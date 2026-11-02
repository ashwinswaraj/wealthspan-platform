# AGENTS.md — apps/web

Rules specific to this app. Falls back to root `AGENTS.md` for anything not
covered here.

## Current state

The Wealthspan user app: login (Catalyst Embedded Auth), home with projects, Excel-style sheets per section,
and the AI accountant chat, organized into `src/features/{projects, sheets, wealthspan-auth,
wealthspan-shell}/`. It is built as a static SPA and served by Catalyst Web Client Hosting under `/app/`.

## Rules

- `[SEC]` Never assume a request is authenticated because a screen is shown: the session check and every
  permission rule run on the Catalyst functions, not in the browser.
- `[RULE]` Money is typed in rupees and stored as paise; do all arithmetic through `@wealthspan/utils`, never in
  a component or in the chatbot prompt.
- `[SCALE]` The sheet columns come from `SHEETS` in `packages/constants/src/sheets.ts`; the grid, the xlsx
  export and (later) the chatbot tools all read the same definition. Change it there, not per screen.
- `[CLR]` `docs/Platform/` has a spec per module; check there before designing a new flow from scratch.
- `[RULE]` UI comes from `@wealthspan/ui/design-system` only: this app has no local `design-system/` folder.

## Never do without confirmation

- Restructure `src/routes/` without regenerating `routeTree.gen.ts` (root
  `AGENTS.md` §4)
- Add a new top-level route that bypasses session checks
- Import anything from `apps/admin` (apps never import each other)
