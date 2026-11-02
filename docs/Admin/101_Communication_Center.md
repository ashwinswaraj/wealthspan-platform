# Communication Center

> Status: Planned · Owner: Ashwin Swaraj · Last updated: 2026-11-01

## State

The System screen has a Broadcast Dispatcher: title, message, audience (All, Free, Go, Pro) and severity (Info, Warning, Critical). Dispatch saves the broadcast (`POST /admin/broadcasts`, table `broadcasts`); users see it in the bell on their home screen. The header bell lists derived alerts (pending payments, services down). See `121_Communication.md`.
