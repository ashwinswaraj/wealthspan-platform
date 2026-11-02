# AGENTS.md: infrastructure/database

Wealthspan's database is the **Zoho Catalyst Data Store**. There is no local database stack and no migration
CLI: tables and columns are created in the Catalyst console (Cloud Scale → Data Store).

- The schema lives in `docs/Database/42_Catalyst_Data_Store_Schema.md`: change that file first, then the console.
- Money columns are integers in paise; every row carries `user_id`; deletes are soft (`deleted_at`).
- Unique columns (`sub_key`, etc.) carry the race-safety rules; do not drop them.
- Never run schema changes on Production without the owner's approval. Test in Development first.
