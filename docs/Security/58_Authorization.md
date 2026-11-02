# Authorization

> Status: Draft · Last updated: 2026-11-01

See [RBAC](RBAC.md). Core rules: (1) user id only from the session; (2) every query filters by `user_id`; (3) ids in URLs are checked to belong to the user (a foreign id answers not found); (4) admin routes need pinned admin identity; (5) chat requires an active plan; (6) the chatbot, when it gets tools, acts only as the signed-in user and needs server-stored confirmation for risky actions.
