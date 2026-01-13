# Local Agent Integration

This document outlines the planned local listener (child PC) and the cloud sync contract.

## Goals
- Detect when `Minecraft.exe` is running.
- Emit a heartbeat every 60 seconds with session metadata.
- Cache events locally when offline and reconcile later.

## Listener Responsibilities
- Poll process list (Windows) to detect Minecraft state.
- Maintain a local session log (rolling file or sqlite).
- Calculate elapsed time locally to avoid cloud latency.
- Push `daily_logs` increments to Supabase when online.
  - Current prototype: `local-agent/clockblock_listener.py`.

## Proposed Payload
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

## Offline Behavior
- If network is down, append to local queue.
- On reconnect, replay queued deltas in order.
- UI should surface last sync time and offline banner.

## Security Notes
- Listener should use a device token instead of storing full user credentials.
- Treat the listener as a cooperative client (no root-level enforcement).
