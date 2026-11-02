# ADR-009: Data-quality review (Planned)

> Status: Proposed · Last updated: 2026-11-01

## Context

Entries made by the chatbot or typed by hand can be wrong (wrong account, duplicate, card bill counted twice).

## Decision (proposed)

Quality is handled first in code: double-counting guards (`looksLikeCardBillPayment`, `findSameAmountCardExpenses`), validation, `created_by` (`manual` / `chatbot` / `system`) and the `audit_log`. A separate admin review queue is not built; it is only considered if support volume shows a need.

## Consequences

Admins can already read the audit log. Nothing here is shipped beyond that.
