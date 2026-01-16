# Local Agent Offline Cache + Reconnection Sync Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a durable SQLite cache to the local agent, plus reconnection sync logic and a local HTTP API for the UI.

**Architecture:** The agent owns a SQLite database (raw heartbeats + daily rollups), exposes read-only HTTP endpoints, and syncs unsent heartbeats to a remote endpoint on reconnect + periodic intervals.

**Tech Stack:** Python 3.10, sqlite3 (stdlib), FastAPI + Uvicorn, requests, psutil, pytest.

---

### Task 1: Add test dependency

**Files:**
- Modify: `local-agent/requirements.txt`

**Step 1: Add pytest to requirements**

```text
# local-agent/requirements.txt
psutil
requests
pytest
```

**Step 2: Install deps (once per environment)**

Run: `python -m pip install -r local-agent/requirements.txt`
Expected: `Successfully installed ... pytest ...`

**Step 3: Commit**

```bash
git add local-agent/requirements.txt
git commit -m "chore(agent): add pytest"
```

---

### Task 2: Add SQLite storage layer and schema

**Files:**
- Create: `local-agent/clockblock_agent/__init__.py`
- Create: `local-agent/clockblock_agent/storage.py`
- Create: `local-agent/tests/test_storage_schema.py`

**Step 1: Write the failing test**

```python
# local-agent/tests/test_storage_schema.py
import sqlite3
import tempfile
from pathlib import Path
import sys

sys.path.append(str(Path(__file__).resolve().parents[1]))

from clockblock_agent import storage


def test_init_db_creates_tables():
    with tempfile.TemporaryDirectory() as tmp:
        db_path = Path(tmp) / "clockblock.db"
        storage.init_db(str(db_path))

        conn = sqlite3.connect(db_path)
        rows = conn.execute("SELECT name FROM sqlite_master WHERE type='table'").fetchall()
        table_names = {row[0] for row in rows}
        assert "heartbeats" in table_names
        assert "daily_rollups" in table_names
```

**Step 2: Run test to verify it fails**

Run: `python -m pytest local-agent/tests/test_storage_schema.py -v`
Expected: FAIL with `ModuleNotFoundError` or `AttributeError` (storage missing)

**Step 3: Write minimal implementation**

```python
# local-agent/clockblock_agent/storage.py
import sqlite3


def init_db(db_path: str) -> None:
    conn = sqlite3.connect(db_path)
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS heartbeats (
            id TEXT PRIMARY KEY,
            device_id TEXT NOT NULL,
            timestamp_utc TEXT NOT NULL,
            is_playing INTEGER NOT NULL,
            poll_interval_sec INTEGER NOT NULL,
            synced_at TEXT
        )
        """
    )
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS daily_rollups (
            device_id TEXT NOT NULL,
            date_utc TEXT NOT NULL,
            minutes_used REAL NOT NULL,
            minutes_overdraft REAL NOT NULL,
            last_heartbeat_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            PRIMARY KEY (device_id, date_utc)
        )
        """
    )
    conn.commit()
    conn.close()
```

```python
# local-agent/clockblock_agent/__init__.py
# Empty package marker
```

**Step 4: Run test to verify it passes**

Run: `python -m pytest local-agent/tests/test_storage_schema.py -v`
Expected: PASS

**Step 5: Commit**

```bash
git add local-agent/clockblock_agent/__init__.py local-agent/clockblock_agent/storage.py local-agent/tests/test_storage_schema.py
git commit -m "feat(agent): add sqlite schema setup"
```

---

### Task 3: Heartbeat insert + rollup update

**Files:**
- Modify: `local-agent/clockblock_agent/storage.py`
- Create: `local-agent/tests/test_storage_rollups.py`

**Step 1: Write the failing test**

```python
# local-agent/tests/test_storage_rollups.py
import tempfile
from pathlib import Path
import sys
from datetime import datetime, timezone
import pytest

sys.path.append(str(Path(__file__).resolve().parents[1]))

from clockblock_agent import storage


def test_insert_heartbeat_updates_rollup():
    with tempfile.TemporaryDirectory() as tmp:
        db_path = Path(tmp) / "clockblock.db"
        storage.init_db(str(db_path))

        now = datetime(2026, 1, 16, 12, 0, tzinfo=timezone.utc)
        storage.insert_heartbeat(
            db_path=str(db_path),
            heartbeat_id="hb-1",
            device_id="pc-1",
            timestamp_utc=now.isoformat().replace("+00:00", "Z"),
            is_playing=True,
            poll_interval_sec=5,
        )

        rollup = storage.get_daily_rollup(str(db_path), "pc-1", "2026-01-16")
        assert rollup["minutes_used"] == pytest.approx(5 / 60)
```

**Step 2: Run test to verify it fails**

Run: `python -m pytest local-agent/tests/test_storage_rollups.py -v`
Expected: FAIL (missing insert_heartbeat/get_daily_rollup)

**Step 3: Write minimal implementation**

```python
# local-agent/clockblock_agent/storage.py
import sqlite3
from typing import Dict


def _date_from_iso(iso_ts: str) -> str:
    return iso_ts[:10]


def insert_heartbeat(
    db_path: str,
    heartbeat_id: str,
    device_id: str,
    timestamp_utc: str,
    is_playing: bool,
    poll_interval_sec: int,
) -> None:
    conn = sqlite3.connect(db_path)
    conn.execute(
        """
        INSERT INTO heartbeats (id, device_id, timestamp_utc, is_playing, poll_interval_sec, synced_at)
        VALUES (?, ?, ?, ?, ?, NULL)
        """,
        (heartbeat_id, device_id, timestamp_utc, int(is_playing), poll_interval_sec),
    )

    date_utc = _date_from_iso(timestamp_utc)
    minutes_delta = poll_interval_sec / 60 if is_playing else 0
    conn.execute(
        """
        INSERT INTO daily_rollups (device_id, date_utc, minutes_used, minutes_overdraft, last_heartbeat_at, updated_at)
        VALUES (?, ?, ?, 0, ?, ?)
        ON CONFLICT(device_id, date_utc)
        DO UPDATE SET
            minutes_used = minutes_used + ?,
            last_heartbeat_at = excluded.last_heartbeat_at,
            updated_at = excluded.updated_at
        """,
        (
            device_id,
            date_utc,
            minutes_delta,
            timestamp_utc,
            timestamp_utc,
            minutes_delta,
        ),
    )
    conn.commit()
    conn.close()


def get_daily_rollup(db_path: str, device_id: str, date_utc: str) -> Dict[str, float]:
    conn = sqlite3.connect(db_path)
    row = conn.execute(
        """
        SELECT minutes_used, minutes_overdraft, last_heartbeat_at, updated_at
        FROM daily_rollups
        WHERE device_id = ? AND date_utc = ?
        """,
        (device_id, date_utc),
    ).fetchone()
    conn.close()
    if not row:
        return {
            "minutes_used": 0,
            "minutes_overdraft": 0,
            "last_heartbeat_at": None,
            "updated_at": None,
        }
    return {
        "minutes_used": row[0],
        "minutes_overdraft": row[1],
        "last_heartbeat_at": row[2],
        "updated_at": row[3],
    }
```

**Step 4: Run test to verify it passes**

Run: `python -m pytest local-agent/tests/test_storage_rollups.py -v`
Expected: PASS

**Step 5: Commit**

```bash
git add local-agent/clockblock_agent/storage.py local-agent/tests/test_storage_rollups.py
git commit -m "feat(agent): record heartbeats and rollups"
```

---

### Task 4: Retention pruning + unsynced queue

**Files:**
- Modify: `local-agent/clockblock_agent/storage.py`
- Create: `local-agent/tests/test_storage_prune_and_sync.py`

**Step 1: Write the failing test**

```python
# local-agent/tests/test_storage_prune_and_sync.py
import tempfile
from pathlib import Path
import sys
from datetime import datetime, timezone, timedelta

sys.path.append(str(Path(__file__).resolve().parents[1]))

from clockblock_agent import storage


def test_prune_removes_old_heartbeats_and_marks_synced():
    with tempfile.TemporaryDirectory() as tmp:
        db_path = Path(tmp) / "clockblock.db"
        storage.init_db(str(db_path))

        old_ts = (datetime.now(timezone.utc) - timedelta(days=40)).isoformat().replace("+00:00", "Z")
        new_ts = datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")

        storage.insert_heartbeat(str(db_path), "hb-old", "pc-1", old_ts, True, 5)
        storage.insert_heartbeat(str(db_path), "hb-new", "pc-1", new_ts, True, 5)

        storage.prune_heartbeats(str(db_path), older_than_days=30)
        remaining = storage.list_heartbeat_ids(str(db_path))
        assert "hb-old" not in remaining
        assert "hb-new" in remaining

        unsynced = storage.get_unsynced_heartbeats(str(db_path), limit=10)
        assert len(unsynced) == 1
        storage.mark_heartbeats_synced(str(db_path), ["hb-new"], new_ts)
        unsynced_after = storage.get_unsynced_heartbeats(str(db_path), limit=10)
        assert unsynced_after == []
```

**Step 2: Run test to verify it fails**

Run: `python -m pytest local-agent/tests/test_storage_prune_and_sync.py -v`
Expected: FAIL (missing prune/list/sync functions)

**Step 3: Write minimal implementation**

```python
# local-agent/clockblock_agent/storage.py
from datetime import datetime, timezone, timedelta
from typing import List, Dict


def list_heartbeat_ids(db_path: str) -> List[str]:
    conn = sqlite3.connect(db_path)
    rows = conn.execute("SELECT id FROM heartbeats").fetchall()
    conn.close()
    return [row[0] for row in rows]


def prune_heartbeats(db_path: str, older_than_days: int) -> None:
    cutoff = datetime.now(timezone.utc) - timedelta(days=older_than_days)
    cutoff_iso = cutoff.isoformat().replace("+00:00", "Z")
    conn = sqlite3.connect(db_path)
    conn.execute("DELETE FROM heartbeats WHERE timestamp_utc < ?", (cutoff_iso,))
    conn.commit()
    conn.close()


def get_unsynced_heartbeats(db_path: str, limit: int) -> List[Dict[str, str]]:
    conn = sqlite3.connect(db_path)
    rows = conn.execute(
        """
        SELECT id, device_id, timestamp_utc, is_playing, poll_interval_sec
        FROM heartbeats
        WHERE synced_at IS NULL
        ORDER BY timestamp_utc ASC
        LIMIT ?
        """,
        (limit,),
    ).fetchall()
    conn.close()
    return [
        {
            "id": row[0],
            "device_id": row[1],
            "timestamp_utc": row[2],
            "is_playing": bool(row[3]),
            "poll_interval_sec": row[4],
        }
        for row in rows
    ]


def mark_heartbeats_synced(db_path: str, heartbeat_ids: List[str], synced_at: str) -> None:
    if not heartbeat_ids:
        return
    conn = sqlite3.connect(db_path)
    placeholders = ",".join(["?"] * len(heartbeat_ids))
    conn.execute(
        f"UPDATE heartbeats SET synced_at = ? WHERE id IN ({placeholders})",
        [synced_at, *heartbeat_ids],
    )
    conn.commit()
    conn.close()
```

**Step 4: Run test to verify it passes**

Run: `python -m pytest local-agent/tests/test_storage_prune_and_sync.py -v`
Expected: PASS

**Step 5: Commit**

```bash
git add local-agent/clockblock_agent/storage.py local-agent/tests/test_storage_prune_and_sync.py
git commit -m "feat(agent): add retention pruning and sync queue"
```

---

### Task 5: Tracker helper (process detection + record)

**Files:**
- Create: `local-agent/clockblock_agent/tracker.py`
- Create: `local-agent/tests/test_tracker.py`

**Step 1: Write the failing test**

```python
# local-agent/tests/test_tracker.py
import tempfile
from pathlib import Path
import sys
from datetime import datetime, timezone

sys.path.append(str(Path(__file__).resolve().parents[1]))

from clockblock_agent import storage, tracker


def test_record_heartbeat_writes_event():
    with tempfile.TemporaryDirectory() as tmp:
        db_path = Path(tmp) / "clockblock.db"
        storage.init_db(str(db_path))

        now = datetime(2026, 1, 16, 12, 0, tzinfo=timezone.utc)
        tracker.record_heartbeat(
            db_path=str(db_path),
            device_id="pc-1",
            is_playing=True,
            poll_interval_sec=5,
            now_iso=now.isoformat().replace("+00:00", "Z"),
        )

        ids = storage.list_heartbeat_ids(str(db_path))
        assert len(ids) == 1
```

**Step 2: Run test to verify it fails**

Run: `python -m pytest local-agent/tests/test_tracker.py -v`
Expected: FAIL (tracker missing)

**Step 3: Write minimal implementation**

```python
# local-agent/clockblock_agent/tracker.py
import os
import uuid
import psutil

from . import storage


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


def record_heartbeat(
    db_path: str,
    device_id: str,
    is_playing: bool,
    poll_interval_sec: int,
    now_iso: str,
) -> str:
    heartbeat_id = str(uuid.uuid4())
    storage.insert_heartbeat(
        db_path=db_path,
        heartbeat_id=heartbeat_id,
        device_id=device_id,
        timestamp_utc=now_iso,
        is_playing=is_playing,
        poll_interval_sec=poll_interval_sec,
    )
    return heartbeat_id
```

**Step 4: Run test to verify it passes**

Run: `python -m pytest local-agent/tests/test_tracker.py -v`
Expected: PASS

**Step 5: Commit**

```bash
git add local-agent/clockblock_agent/tracker.py local-agent/tests/test_tracker.py
git commit -m "feat(agent): add process tracker"
```

---

### Task 6: Sync worker (post unsynced events)

**Files:**
- Create: `local-agent/clockblock_agent/sync.py`
- Create: `local-agent/tests/test_sync.py`

**Step 1: Write the failing test**

```python
# local-agent/tests/test_sync.py
import tempfile
from pathlib import Path
import sys
from datetime import datetime, timezone

sys.path.append(str(Path(__file__).resolve().parents[1]))

from clockblock_agent import storage, sync


def test_sync_marks_events_synced(monkeypatch):
    with tempfile.TemporaryDirectory() as tmp:
        db_path = Path(tmp) / "clockblock.db"
        storage.init_db(str(db_path))

        now = datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")
        storage.insert_heartbeat(str(db_path), "hb-1", "pc-1", now, True, 5)

        def fake_post(url, json, headers, timeout):
            class Resp:
                status_code = 200
                text = "ok"
            return Resp()

        monkeypatch.setattr(sync.requests, "post", fake_post)

        sync.sync_once(
            db_path=str(db_path),
            endpoint_url="https://example.com/ingest",
            device_token=None,
            batch_limit=10,
        )

        remaining = storage.get_unsynced_heartbeats(str(db_path), limit=10)
        assert remaining == []
```

**Step 2: Run test to verify it fails**

Run: `python -m pytest local-agent/tests/test_sync.py -v`
Expected: FAIL (sync missing)

**Step 3: Write minimal implementation**

```python
# local-agent/clockblock_agent/sync.py
from datetime import datetime, timezone
from typing import Optional
import requests

from . import storage


def sync_once(db_path: str, endpoint_url: str, device_token: Optional[str], batch_limit: int) -> int:
    heartbeats = storage.get_unsynced_heartbeats(db_path, limit=batch_limit)
    if not heartbeats:
        return 0

    headers = {"Content-Type": "application/json"}
    if device_token:
        headers["Authorization"] = f"Bearer {device_token}"

    response = requests.post(endpoint_url, json=heartbeats, headers=headers, timeout=10)
    if response.status_code >= 400:
        return 0

    now = datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")
    storage.mark_heartbeats_synced(db_path, [hb["id"] for hb in heartbeats], now)
    return len(heartbeats)
```

**Step 4: Run test to verify it passes**

Run: `python -m pytest local-agent/tests/test_sync.py -v`
Expected: PASS

**Step 5: Commit**

```bash
git add local-agent/clockblock_agent/sync.py local-agent/tests/test_sync.py
git commit -m "feat(agent): add heartbeat sync worker"
```

---

### Task 7: Local HTTP API

**Files:**
- Modify: `local-agent/requirements.txt`
- Create: `local-agent/clockblock_agent/api.py`
- Create: `local-agent/tests/test_api.py`

**Step 1: Add FastAPI + Uvicorn**

```text
# local-agent/requirements.txt
psutil
requests
pytest
fastapi
uvicorn
```

**Step 2: Write the failing test**

```python
# local-agent/tests/test_api.py
import tempfile
from pathlib import Path
import sys

sys.path.append(str(Path(__file__).resolve().parents[1]))

from clockblock_agent import storage, api


def test_status_endpoint_returns_device_id():
    with tempfile.TemporaryDirectory() as tmp:
        db_path = Path(tmp) / "clockblock.db"
        storage.init_db(str(db_path))

        app = api.create_app(str(db_path), device_id="pc-1")
        client = api.TestClient(app)
        response = client.get("/status")
        assert response.status_code == 200
        assert response.json()["device_id"] == "pc-1"
```

**Step 3: Run test to verify it fails**

Run: `python -m pytest local-agent/tests/test_api.py -v`
Expected: FAIL (api missing)

**Step 4: Write minimal implementation**

```python
# local-agent/clockblock_agent/api.py
from fastapi import FastAPI
from fastapi.responses import JSONResponse
from fastapi.testclient import TestClient

from . import storage


def create_app(db_path: str, device_id: str):
    app = FastAPI()

    @app.get("/status")
    def status():
        return {
            "device_id": device_id,
            "is_playing": None,
            "last_seen": None,
            "online": None,
        }

    @app.get("/daily")
    def daily(date: str):
        rollup = storage.get_daily_rollup(db_path, device_id, date)
        return JSONResponse(rollup)

    @app.get("/history")
    def history(limit: int = 200):
        return []

    return app
```

**Step 5: Run test to verify it passes**

Run: `python -m pytest local-agent/tests/test_api.py -v`
Expected: PASS

**Step 6: Commit**

```bash
git add local-agent/requirements.txt local-agent/clockblock_agent/api.py local-agent/tests/test_api.py
git commit -m "feat(agent): add local read API"
```

---

### Task 8: Integrate agent runtime (polling + API + sync)

**Files:**
- Modify: `local-agent/clockblock_listener.py`
- Create: `local-agent/clockblock_agent/runtime.py`
- Modify: `local-agent/config.example.json`
- Modify: `local-agent/README.md`
- Create: `local-agent/tests/test_runtime_config.py`

**Step 1: Write the failing test**

```python
# local-agent/tests/test_runtime_config.py
import sys
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parents[1]))

from clockblock_agent import runtime


def test_default_config_has_db_path():
    config = runtime.default_config()
    assert "db_path" in config
```

**Step 2: Run test to verify it fails**

Run: `python -m pytest local-agent/tests/test_runtime_config.py -v`
Expected: FAIL (runtime missing)

**Step 3: Write minimal implementation**

```python
# local-agent/clockblock_agent/runtime.py
import threading
import time
from datetime import datetime, timezone
from typing import Dict, Any

import uvicorn

from . import storage, tracker, sync, api


def default_config() -> Dict[str, Any]:
    return {
        "db_path": "clockblock.db",
        "device_id": "pc-01",
        "process_name": "Minecraft.exe",
        "poll_interval_sec": 5,
        "sync_interval_sec": 300,
        "api_host": "127.0.0.1",
        "api_port": 3841,
        "retention_days": 30,
        "timeout_sec": 10,
        "endpoint_url": None,
        "device_token": None,
    }


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")


def run_poll_loop(config: Dict[str, Any]) -> None:
    storage.init_db(config["db_path"])
    while True:
        is_playing = tracker.is_process_running(config["process_name"])
        tracker.record_heartbeat(
            db_path=config["db_path"],
            device_id=config["device_id"],
            is_playing=is_playing,
            poll_interval_sec=config["poll_interval_sec"],
            now_iso=_now_iso(),
        )
        time.sleep(config["poll_interval_sec"])


def run_sync_loop(config: Dict[str, Any]) -> None:
    while True:
        if config.get("endpoint_url"):
            sync.sync_once(
                db_path=config["db_path"],
                endpoint_url=config["endpoint_url"],
                device_token=config.get("device_token"),
                batch_limit=200,
            )
        time.sleep(config["sync_interval_sec"])


def run_retention_loop(config: Dict[str, Any]) -> None:
    while True:
        storage.prune_heartbeats(config["db_path"], config["retention_days"])
        time.sleep(86400)


def run_api(config: Dict[str, Any]) -> None:
    app = api.create_app(config["db_path"], device_id=config["device_id"])
    uvicorn.run(app, host=config["api_host"], port=config["api_port"], log_level="info")


def run_agent(config: Dict[str, Any]) -> None:
    threads = [
        threading.Thread(target=run_poll_loop, args=(config,), daemon=True),
        threading.Thread(target=run_sync_loop, args=(config,), daemon=True),
        threading.Thread(target=run_retention_loop, args=(config,), daemon=True),
    ]
    for t in threads:
        t.start()
    run_api(config)
```

**Step 4: Update config example + README**

```json
// local-agent/config.example.json
{
  "endpoint_url": "https://example.com/clockblock/heartbeat",
  "device_id": "pc-01",
  "device_token": "device-token-here",
  "process_name": "Minecraft.exe",
  "poll_interval_sec": 5,
  "sync_interval_sec": 300,
  "api_host": "127.0.0.1",
  "api_port": 3841,
  "db_path": "clockblock.db",
  "retention_days": 30
}
```

Update `local-agent/README.md` with:
- new poll interval default
- local API endpoint usage
- SQLite db location
- sync behavior

**Step 5: Run test to verify it passes**

Run: `python -m pytest local-agent/tests/test_runtime_config.py -v`
Expected: PASS

**Step 6: Wire `clockblock_listener.py` to runtime**

Update `clockblock_listener.py` to:
- keep CLI + env overrides
- add new config keys (`db_path`, `sync_interval_sec`, `api_host`, `api_port`, `retention_days`)
- call `runtime.run_agent(config)` when not `--once`
- keep `--once` and `--dry-run` to emit a single heartbeat without API

**Step 7: Commit**

```bash
git add local-agent/clockblock_agent/runtime.py local-agent/clockblock_listener.py local-agent/config.example.json local-agent/README.md local-agent/tests/test_runtime_config.py
git commit -m "feat(agent): wire runtime loops and config"
```

---

### Task 9: Final verification

**Step 1: Run agent unit tests**

Run: `python -m pytest local-agent/tests -v`
Expected: PASS

**Step 2: Run app build**

Run: `npm run build`
Expected: PASS

**Step 3: Commit any remaining doc tweaks**

```bash
git status --short
```

If docs changed, commit:

```bash
git add local-agent/README.md local-agent/config.example.json
git commit -m "docs(agent): update local agent usage"
```

---

## Notes
- If FastAPI is too heavy for MVP, replace with Flask and update dependencies/tests accordingly.
- Supabase schema is a later roadmap item; for now `endpoint_url` can point to a placeholder ingest.
