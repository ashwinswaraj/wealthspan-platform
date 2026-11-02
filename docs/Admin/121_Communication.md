# Communication Process

> Status: Planned · Owner: Ashwin Swaraj · Last updated: 2026-11-01

## Intended steps

Draft a broadcast in System, choose audience and severity, send, and log it in the audit trail. Sending saves the broadcast (table `broadcasts`) and writes an audit row; users read the ones for their tier (`GET /broadcasts`) from the bell on the home screen. Email and push come later (`docs/ADR/ADR-005-Notifications.md`).
