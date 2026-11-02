# Brand Guidelines

Status: Draft · Owner: Ashwin Swaraj · Last updated: 2026-11-01

## Identity

- **Name:** Wealthspan (one word, capital W).
- **Tagline:** "The full arc of your money."
- **Mark:** a drawn arc inside a tile (see `apps/web/src/styles.css`, `.wealthspan-logo-tile`). Details in [Logo](Assets/75_Logo.md).

## Voice

Calm, plain and precise, like a good accountant talking to a friend.

- Say what happened and what will change, with the rupee amount.
- Short sentences; no jargon without a one-line explanation.
- Never hype returns or promise outcomes; Wealthspan records and explains, it does not give investment advice.
- Ask before changing or deleting anything.

## Visual

- Colors: brand blue primary on a soft off-white surface ([Colors](Assets/77_Colors.md)).
- Type: Inter everywhere (login headline in Newsreader) ([Fonts](Assets/78_Fonts.md)).
- Amounts are shown as ₹ with Indian digit grouping; PDF exports use "Rs." because the built-in PDF fonts lack the ₹ glyph.
- Tokens and components live in `@wealthspan/ui`; see `docs/Frontend/`.

## Do not

- Show invented statistics, audit badges or custody claims (the original reference design had them; they are removed).
- Mention other AI vendors' names in user-facing text; the assistant is "the Wealthspan accountant".
