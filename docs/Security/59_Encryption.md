# Encryption

> Status: Draft · Last updated: 2026-11-01

- **In transit:** HTTPS to Catalyst; the same-domain cookie is sent over HTTPS. Functions call Sarvam over HTTPS.
- **At rest:** Data is stored in Catalyst Data Store; encryption at rest is a Catalyst platform property that we have not independently verified (TBD: confirm in Catalyst documentation). Catalyst offers an "Encrypted text" column type; no column uses it yet. Candidates: free-text notes (decision TBD).
- **Secrets:** function env vars only.
- We never store bank passwords or card numbers.
