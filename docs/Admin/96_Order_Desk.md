# Entry Review

> Status: Partly built · Owner: Ashwin Swaraj · Last updated: 2026-11-01

## Purpose

Inspect transactions across the platform without seeing private content.

## State

The Financial Ledger & Projects screen lists recent transactions (`GET /admin/ledger`): project, type, payment mode, amount, date. Counterparty shows "Hidden" and categories are reduced to the type. Status is always "Cleared" because Wealthspan records money that already moved. See `116_Order_Review.md`.
