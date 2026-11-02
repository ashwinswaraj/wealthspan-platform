# Backup Strategy

> Status: Draft · Last updated: 2026-11-01

Not yet defined. Facts and plan:

- Data lives in the Catalyst Data Store (India DC). Soft delete gives users a 30-day recovery window for their own records; it is not a backup.
- Planned: scheduled export of all tables (a Catalyst cron function writing to File Store or an external bucket), tested restore into Development, and a documented retention period.
- Admins can already read the ledger and audit log, which helps reconstruct changes.
- Before launch: confirm Catalyst's own backup/restore options and record them here.
