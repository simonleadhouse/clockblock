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
) -> None:
    headers = {"Content-Type": "application/json"}
    if device_token:
        headers["Authorization"] = f"Bearer {device_token}"

    response = session.post(
        endpoint_url,
        json=payload,
        headers=headers,
        timeout=timeout_sec,
    )
    if response.status_code >= 400:
        logging.error(
            "Heartbeat failed (%s): %s",
            response.status_code,
            response.text.strip(),
        )
    else:
        logging.info("Heartbeat sent (%s)", response.status_code)


def validate_config(config: Dict[str, Any], dry_run: bool) -> None:
    if not config.get("device_id"):
        config["device_id"] = socket.gethostname()

    if "process_name" not in config:
        config["process_name"] = DEFAULT_PROCESS_NAME

    if "poll_interval_sec" not in config:
        config["poll_interval_sec"] = DEFAULT_POLL_INTERVAL_SEC

    if "timeout_sec" not in config:
        config["timeout_sec"] = DEFAULT_TIMEOUT_SEC

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
            try:
                send_heartbeat(
                    session,
                    config["endpoint_url"],
                    config.get("device_token"),
                    payload,
                    config["timeout_sec"],
                )
            except requests.RequestException as exc:
                logging.error("Heartbeat request failed: %s", exc)

        if args.once:
            break

        time.sleep(config["poll_interval_sec"])

    return 0


if __name__ == "__main__":
    sys.exit(main())
