# ADR-005: Notifications are in-app only in Phase 1

> Status: Accepted · Last updated: 2026-11-01

## Decision

Phase 1 has no push, SMS or marketing email. Reminders (EMI due, budget cap) are planned as in-app only. Push needs a mobile app or service worker plan; SMS needs a sender registration (DLT in India) and cost approval. SMS _reading_ is a Phase 2 feature with its own consent design.

## Consequences

Users must open the app to see reminders. Revisit with Phase 2. Status of each channel: [Integrations](../Integrations/52_Push_Notifications.md).
