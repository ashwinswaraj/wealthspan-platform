# Audit & Logs

> Status: Partly built · Owner: Ashwin Swaraj · Last updated: 2026-11-01

## Purpose

A record of who changed what.

## State

- Table `audit` (Data Store) stores action, entity, entity id, actor and time; admins read the latest rows via `GET /finance/admin/audit`.
- The data model requires every chatbot change to log actor, tool, before, after and `undone_at`; this lands with the chatbot tools (Planned).
- The audit view shows no user-typed content.

## References

- [Data model](../Database/41_Wealthspan_Data_Model.md)
