# Subscription Billing

> Status: Active (manual UPI); gateway TBD · Owner: Ashwin Swaraj · Last updated: 2026-11-01

## Purpose

How a user pays for Pro.

## Today

There is no payment gateway. The user pays by UPI, then submits the 12-digit UTR and a reference code (`WSP-` plus the last 5 characters of their id) in the remark. An admin matches it on the bank statement and approves or rejects (`apps/api/src/features/subscription`). Each UTR can be used once.

## TBD

A payment gateway with automatic confirmation, invoices and renewals is not chosen. Do not describe it as built.

Lifecycle: `34_Payment_Lifecycle.md`. Admin side: `docs/Admin/99_*` (Subscription Billing).
