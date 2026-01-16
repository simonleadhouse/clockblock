# Local Agent Offline Cache + Reconnection Sync Design

Date: 2026-01-16

## Goals
- Track Minecraft play time reliably even when the UI or internet is offline.
- Keep the local agent as the source of truth, with a simple UI read path.
- Enable future Supabase sync without losing audit history.

## Key Decisions
- Source of truth: local agent (Python) with SQLite storage.
- Storage: SQLite for durable, queryable offline tracking.
- UI access: local HTTP API exposed by the agent.
- Sync: on reconnect plus periodic while online.
- Conflict handling: append-only events, recompute rollups as needed.
- Sampling interval: 5 seconds.
- UI updates: polling (MVP), with possible SSE upgrade later.
- Supabase sync payload: raw heartbeat events only.
- Device identity: local UUID generated on first run.
- Retention: rolling 30-day window for raw events.

## Architecture Overview
The agent polls `Minecraft.exe` every 5 seconds, writes heartbeat events to SQLite, and maintains daily rollups for fast reads. The UI polls a local HTTP API (`/status`, `/daily`, `/history`) and never reads SQLite directly. The agent handles cloud sync and continues to operate even when Supabase is unreachable.

## Data Model
### heartbeats
- `id` (uuid, primary key)
- `device_id` (text)
- `timestamp_utc` (text, ISO8601)
- `is_playing` (boolean)
- `poll_interval_sec` (integer)
- `synced_at` (text, nullable)

### daily_rollups
- `device_id` (text)
- `date_utc` (text, YYYY-MM-DD)
- `minutes_used` (real)
- `minutes_overdraft` (real)
- `last_heartbeat_at` (text)
- `updated_at` (text)

Rollups are updated incrementally as heartbeats arrive but can be recomputed from raw events if needed.

## Local HTTP API (read-only)
- `GET /status` → `{ is_playing, last_seen, online, device_id }`
- `GET /daily?date=YYYY-MM-DD` → daily rollup (defaults to today)
- `GET /history?limit=200` → recent heartbeats

## Sync Rules
- Agent uploads unsynced heartbeats in batches.
- On success, set `synced_at` locally.
- If Supabase already has the event id, skip (idempotent).
- Recompute rollups server-side from raw events as needed.
- On failure, keep local data and retry with backoff.

## Retention
- Delete heartbeats older than 30 days.
- Keep rollups longer if desired (optional).

## Error Handling
- DB write failures: log and retry, do not crash.
- API should respond from local SQLite even when cloud sync fails.
- Sync failures should not affect local tracking.

## Testing
- Unit tests: rollup math, retention pruning, sync batching/duplicate handling.
- Integration: SQLite + mocked Supabase endpoint.
- UI: mock `/status` + `/daily` to verify display updates.

## Open Questions
- Framework choice for API (FastAPI vs Flask) based on local-agent constraints.
- Supabase table schema and indexing for raw heartbeat events.
