# Chatbot Tool-Actions

> Status: Partly built (chat shipped; tools Planned) · Owner: Ashwin Swaraj · Last updated: 2026-11-01

## Purpose

The AI accountant reads and writes the same sheets as the user.

## Shipped

`POST /chat` (`apps/api/src/features/chat`) calls Sarvam `sarvam-105b`, with a per-user daily quota of 40 messages (`DAILY_CHAT_LIMIT`, table `chat_usage`).

## Planned (tools not built yet)

The chatbot never touches the database; it calls fixed tools, and the server decides confirmation from `CHATBOT_TOOL_POLICY` (`packages/constants/src/finance.ts`):

| Level   | Tools                                     | Behaviour                            |
| ------- | ----------------------------------------- | ------------------------------------ |
| none    | search, summary, list_*, generate_file    | runs at once                         |
| undo    | create_*                                  | runs, shows Undo                     |
| confirm | update__, delete__, conclude/reopen event | shows the change, waits for the user |

More than 3 rows in one call always needs confirmation. Lifecycle: `32_Assignment_Lifecycle.md`.

## References

- [Data model](../Database/41_Wealthspan_Data_Model.md)
