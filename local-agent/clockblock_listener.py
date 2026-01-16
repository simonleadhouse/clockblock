#!/usr/bin/env python3
"""ClockBlock local listener: detect Minecraft.exe and emit heartbeat payloads."""

from __future__ import annotations

import argparse
import json
import logging
import os
import socket
import sys
import time
from datetime import datetime, timezone
from typing import Any, Dict, Optional

import psutil
import requests

CLIENT_VERSION = "0.1.0"
DEFAULT_PROCESS_NAME = "Minecraft.exe"
DEFAULT_POLL_INTERVAL_SEC = 60
DEFAULT_TIMEOUT_SEC = 10
DEFAULT_QUEUE_PATH = os.path.join(
    os.path.expanduser("~"),
    ".clockblock",
    "heartbeat_queue.jsonl",
)
RETRYABLE_STATUS_CODES = {408, 429, 500, 502, 503, 504}


def utc_now_iso() -> str:
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")


def is_process_running(process_name: str) -> bool:
    target = process_name.lower()
    for proc in psutil.process_iter(["name", "exe"]):
        try:
            proc_name = (proc.info.get("name") or "").lower()
            if proc_name == target:
                return True
            proc_exe = proc.info.get("exe") or ""
            if os.path.basename(proc_exe).lower() == target:
                return True
        except (psutil.NoSuchProcess, psutil.AccessDenied):
            continue
    return False


def load_json_config(path: Optional[str]) -> Dict[str, Any]:
    if not path:
        return {}
    if not os.path.exists(path):
        raise FileNotFoundError(f"Config not found: {path}")
    with open(path, "r", encoding="utf-8") as handle:
        return json.load(handle)


def env_value(key: str) -> Optional[str]:
    value = os.getenv(key)
    return value if value else None


def resolve_config(args: argparse.Namespace) -> Dict[str, Any]:
    file_config = load_json_config(args.config)

    config: Dict[str, Any] = {}
    config.update(file_config)

    env_overrides = {
        "endpoint_url": env_value("CLOCKBLOCK_HEARTBEAT_URL"),
        "device_id": env_value("CLOCKBLOCK_DEVICE_ID"),
        "user_id": env_value("CLOCKBLOCK_USER_ID"),
        "device_token": env_value("CLOCKBLOCK_DEVICE_TOKEN"),
        "process_name": env_value("CLOCKBLOCK_PROCESS_NAME"),
        "poll_interval_sec": env_value("CLOCKBLOCK_POLL_INTERVAL_SEC"),
        "timeout_sec": env_value("CLOCKBLOCK_TIMEOUT_SEC"),
        "queue_path": env_value("CLOCKBLOCK_QUEUE_PATH"),
    }
    for key, value in env_overrides.items():
        if value is None:
            continue
        if key in {"poll_interval_sec", "timeout_sec"}:
            config[key] = int(value)
        else:
            config[key] = value

    cli_overrides = {
        "endpoint_url": args.endpoint_url,
        "device_id": args.device_id,
        "user_id": args.user_id,
        "device_token": args.device_token,
        "process_name": args.process_name,
        "poll_interval_sec": args.poll_interval_sec,
        "timeout_sec": args.timeout_sec,
        "queue_path": args.queue_path,
    }
    for key, value in cli_overrides.items():
        if value is not None:
            config[key] = value

    return config


def build_payload(config: Dict[str, Any], is_playing: bool) -> Dict[str, Any]:
    return {
        "device_id": config["device_id"],
        "user_id": config.get("user_id"),
        "timestamp": utc_now_iso(),
        "is_playing": is_playing,
        "minutes_delta": 1 if is_playing else 0,
        "client_version": CLIENT_VERSION,
    }


def send_heartbeat(
    session: requests.Session,
    endpoint_url: str,
    device_token: Optional[str],
    payload: Dict[str, Any],
    timeout_sec: int,
) -> tuple[bool, bool]:
    headers = {"Content-Type": "application/json"}
    if device_token:
        headers["Authorization"] = f"Bearer {device_token}"

    try:
        response = session.post(
            endpoint_url,
            json=payload,
            headers=headers,
            timeout=timeout_sec,
        )
    except requests.RequestException as exc:
        logging.error("Heartbeat request failed: %s", exc)
        return False, True
    if response.status_code >= 400:
        logging.error(
            "Heartbeat failed (%s): %s",
            response.status_code,
            response.text.strip(),
        )
        return False, response.status_code in RETRYABLE_STATUS_CODES
    else:
        logging.info("Heartbeat sent (%s)", response.status_code)
        return True, False


def ensure_parent_dir(path: str) -> None:
    parent = os.path.dirname(path)
    if parent:
        os.makedirs(parent, exist_ok=True)


def read_queue(queue_path: str) -> list[Dict[str, Any]]:
    if not os.path.exists(queue_path):
        return []
    entries: list[Dict[str, Any]] = []
    with open(queue_path, "r", encoding="utf-8") as handle:
        for line in handle:
            trimmed = line.strip()
            if not trimmed:
                continue
            try:
                entries.append(json.loads(trimmed))
            except json.JSONDecodeError:
                logging.warning("Skipping malformed queue entry: %s", trimmed)
    return entries


def write_queue(queue_path: str, entries: list[Dict[str, Any]]) -> None:
    if not entries:
        if os.path.exists(queue_path):
            os.remove(queue_path)
        return
    ensure_parent_dir(queue_path)
    with open(queue_path, "w", encoding="utf-8") as handle:
        for entry in entries:
            handle.write(json.dumps(entry))
            handle.write("\n")


def append_queue(queue_path: str, payload: Dict[str, Any]) -> None:
    ensure_parent_dir(queue_path)
    with open(queue_path, "a", encoding="utf-8") as handle:
        handle.write(json.dumps(payload))
        handle.write("\n")


def flush_queue(
    session: requests.Session,
    endpoint_url: str,
    device_token: Optional[str],
    queue_path: str,
    timeout_sec: int,
) -> int:
    entries = read_queue(queue_path)
    if not entries:
        return 0

    remaining: list[Dict[str, Any]] = []
    sent = 0
    for index, entry in enumerate(entries):
        ok, retryable = send_heartbeat(
            session,
            endpoint_url,
            device_token,
            entry,
            timeout_sec,
        )
        if ok:
            sent += 1
            continue
        if retryable:
            remaining = entries[index:]
            break
        logging.warning("Dropping queued heartbeat with non-retryable status.")

    write_queue(queue_path, remaining)
    return sent


def validate_config(config: Dict[str, Any], dry_run: bool) -> None:
    if not config.get("device_id"):
        config["device_id"] = socket.gethostname()

    if "process_name" not in config:
        config["process_name"] = DEFAULT_PROCESS_NAME

    if "poll_interval_sec" not in config:
        config["poll_interval_sec"] = DEFAULT_POLL_INTERVAL_SEC

    if "timeout_sec" not in config:
        config["timeout_sec"] = DEFAULT_TIMEOUT_SEC
    if "queue_path" not in config:
        config["queue_path"] = DEFAULT_QUEUE_PATH
    config["queue_path"] = os.path.expanduser(config["queue_path"])

    if not config.get("endpoint_url") and not dry_run:
        raise ValueError("endpoint_url is required unless --dry-run is set")

    if config["poll_interval_sec"] <= 0:
        raise ValueError("poll_interval_sec must be greater than 0")

    if config["poll_interval_sec"] != DEFAULT_POLL_INTERVAL_SEC:
        logging.warning(
            "poll_interval_sec is %s; payload minutes_delta remains fixed at 1",
            config["poll_interval_sec"],
        )


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="ClockBlock local listener")
    parser.add_argument("--config", help="Path to JSON config file")
    parser.add_argument("--endpoint-url", help="Heartbeat endpoint URL")
    parser.add_argument("--device-id", help="Device ID override")
    parser.add_argument("--user-id", help="User ID (UUID) override")
    parser.add_argument("--device-token", help="Device token for Authorization header")
    parser.add_argument(
        "--process-name",
        help="Process name to watch (default: Minecraft.exe)",
    )
    parser.add_argument(
        "--poll-interval-sec",
        type=int,
        help="Polling interval in seconds (default: 60)",
    )
    parser.add_argument(
        "--timeout-sec",
        type=int,
        help="HTTP timeout in seconds (default: 10)",
    )
    parser.add_argument(
        "--queue-path",
        help="Path for local offline queue file",
    )
    parser.add_argument(
        "--once",
        action="store_true",
        help="Emit a single heartbeat and exit",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Log heartbeat payloads without sending",
    )
    parser.add_argument(
        "--log-level",
        default="INFO",
        help="Logging level (default: INFO)",
    )
    return parser.parse_args()


def main() -> int:
    args = parse_args()

    logging.basicConfig(
        level=getattr(logging, args.log_level.upper(), logging.INFO),
        format="[%(asctime)s] %(levelname)s %(message)s",
    )

    try:
        config = resolve_config(args)
        validate_config(config, args.dry_run)
    except (ValueError, FileNotFoundError) as exc:
        logging.error("%s", exc)
        return 1

    session = requests.Session()

    while True:
        playing = is_process_running(config["process_name"])
        payload = build_payload(config, playing)

        if args.dry_run:
            logging.info("Dry run payload: %s", json.dumps(payload))
        else:
            flushed = flush_queue(
                session,
                config["endpoint_url"],
                config.get("device_token"),
                config["queue_path"],
                config["timeout_sec"],
            )
            if flushed:
                logging.info("Replayed %s queued heartbeat(s).", flushed)

            ok, retryable = send_heartbeat(
                session,
                config["endpoint_url"],
                config.get("device_token"),
                payload,
                config["timeout_sec"],
            )
            if not ok and retryable:
                append_queue(config["queue_path"], payload)
                logging.warning("Heartbeat queued (offline).")

        if args.once:
            break

        time.sleep(config["poll_interval_sec"])

    return 0


if __name__ == "__main__":
    sys.exit(main())
