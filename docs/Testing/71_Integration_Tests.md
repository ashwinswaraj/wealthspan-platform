# Integration Tests

> Status: Draft · Last updated: 2026-11-01

None automated yet. Priority list:

- finance + catalog + subscription against the Catalyst Development Data Store (user isolation, 409 on in-use deletes, unique `sub_key`, unique UTR).
- Sarvam adapter against the live API with a test key (timeout under 30 s).
- Real `getCurrentUser()` field names and how bigint ids and NULLs come back (still unverified).
