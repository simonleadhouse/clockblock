# Authentication Architecture (Planned)

ClockBlock will use Supabase auth for parent/child roles and device pairing. This document outlines the intended flow.

## Roles
- **Parent**: Full access to schedules, overrides, and reports.
- **Child**: Read-only HUD plus limited history view.
- **Device**: Local agent token used for heartbeat and log sync.

## Proposed Flow
1. Parent creates a household account and invites a child profile.
2. The child PC registers a device token (scoped to that child).
3. The local listener sends heartbeats using the device token only.
4. The dashboard subscribes to realtime status for the child.

## Notes
- Device tokens should be revocable.
- Listener should not store parent credentials.
- Supabase RLS will enforce per-household access.
