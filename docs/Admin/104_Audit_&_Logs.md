# Audit & Logs

> Status: Active · Owner: Ashwin Swaraj · Last updated: 2026-11-01

## Screen: Security & Access Logs

Shows the latest audit rows (`GET /admin/audit`): action, entity and id, actor, time; with CSV export. Backed by the Data Store table `audit`. Admin approvals are the key events to expect there; confirm that approve/reject writes an audit row before relying on it.
