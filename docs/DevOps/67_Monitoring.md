# Monitoring

> Status: Draft · Last updated: 2026-11-01

Today:
- Admin `GET /admin/health` measures real Data Store latency and reports the core API as up. Chat (Sarvam) and Files show "not checked".
- Catalyst's own console shows function invocations, errors and execution time.

Planned: uptime ping on `/server/finance/me` expecting 401, alert on error-rate spikes, alert on Sarvam failures and 429 spikes, track free-tier Data Store and mail limits before launch.
