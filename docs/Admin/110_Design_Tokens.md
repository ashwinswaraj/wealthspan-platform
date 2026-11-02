# Design Tokens

> Status: Active · Owner: Ashwin Swaraj · Last updated: 2026-11-01

Tokens are CSS variables in `apps/admin/src/styles.css`, mapped by Tailwind `@theme inline`: background, foreground, primary (and container, fixed), secondary, muted, accent, destructive, border, input, ring, plus radius scale (`--radius-sm/md/lg`) and fonts `--font-headline`, `--font-body`, `--font-label`. Dark mode redefines the variables under `.dark`. Some screens still use literal hex classes (`#0d0d0d`, `#ececec`); migrating them to tokens is wanted.
