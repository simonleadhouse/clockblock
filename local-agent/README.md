# ClockBlock Local Agent

Lightweight Python listener that detects `Minecraft.exe` and emits a heartbeat every 60 seconds.

## Requirements
- Python 3.10+

## Setup
```bash
cd local-agent
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\\Scripts\\activate
pip install -r requirements.txt
```

## Configuration
Use a JSON config file or environment variables.

### Config file
```bash
python clockblock_listener.py --config config.example.json
```

### Environment variables
```bash
export CLOCKBLOCK_HEARTBEAT_URL="https://example.com/clockblock/heartbeat"
export CLOCKBLOCK_DEVICE_ID="pc-01"
export CLOCKBLOCK_USER_ID="00000000-0000-0000-0000-000000000000"
export CLOCKBLOCK_DEVICE_TOKEN="device-token-here"
export CLOCKBLOCK_QUEUE_PATH="$HOME/.clockblock/heartbeat_queue.jsonl"
```

## Run
```bash
python clockblock_listener.py
```

### One-off test
```bash
python clockblock_listener.py --once --dry-run
```

## Payload
```json
{
  "device_id": "pc-01",
  "user_id": "uuid",
  "timestamp": "2026-01-12T18:00:00Z",
  "is_playing": true,
  "minutes_delta": 1,
  "client_version": "0.1.0"
}
```

## Notes
- `minutes_delta` is fixed to 1 because the polling interval is expected to be 60 seconds.
- Override the process name with `--process-name` or `CLOCKBLOCK_PROCESS_NAME` for non-standard Minecraft launches.
- Heartbeats are queued to `CLOCKBLOCK_QUEUE_PATH` when offline and replayed on reconnect.
- Set the queue file with `--queue-path` or `CLOCKBLOCK_QUEUE_PATH`.
