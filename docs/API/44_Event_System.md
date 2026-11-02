# Event System

> Status: Draft · Last updated: 2026-11-01

Phase 1 has no event bus or queue. The only event-like record is the Data Store table `audit_log` (`actor`, `action`, `entity`, `entity_id`, `before_json`, `after_json`, `undone_at`), written by the finance and catalog services for every change (`created_by` = `manual`, `chatbot` or `system`). Admins read it via `GET /admin/audit`; it also backs the chatbot's Undo (Planned with chat tools).

Scheduled work (purging soft-deleted rows after 30 days) is Planned as a Catalyst cron function; it does not exist yet.
