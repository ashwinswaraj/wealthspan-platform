# Rate Limiting

> Status: Draft · Last updated: 2026-11-01

Implemented in `apps/api/src/middleware/security.ts` (`rateLimit`, fixed window, **in memory per function instance**, so it is a brake, not an exact quota):

| Function                               | Limit                                                                                                                                   |
| -------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| finance writes (POST/PATCH/PUT/DELETE) | 90 per minute per user                                                                                                                  |
| finance reads (GET)                    | 300 per minute per user                                                                                                                 |
| files                                  | 5 per minute per client address                                                                                                         |
| chat                                   | daily quota of 40 messages per user (IST day) kept in the Data Store table `chat_usage`; can overshoot slightly under parallel requests |

Exceeding answers `429 rate_limited` with `Retry-After`. Request bodies are capped at 32 kb (`413 too_large`). Login rate limits are Catalyst's. Planned: a shared limiter if instances multiply, and an overall cost alarm for Sarvam.
