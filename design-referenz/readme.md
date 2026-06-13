# `Lions Club Bonn-Rheinaue — Design System („Lions 2.0")`

`A warm-reduced, readability-first design system for the `**`Clubverwaltungs-App`**` of the `**`Lions Club Bonn-Rheinaue`**` — a mobile-first PWA that replaces the club's Avareto LionsApp. The aesthetic is deliberately calm and editorial (inspired by the Anthropic/Claude look) but tuned for an ehrenamtlich-run club of mixed ages: higher contrast, larger type, big touch targets, hairlines instead of heavy shadows.`

> **`Language:`**` the product is `**`German`**`. All UI copy, labels and sample content are written in German.`

---

## `Sources`

`This system was built from the club's written specification — there is `**`no production codebase yet`**` (the app will be built in SvelteKit + Supabase afterwards). Source documents (mounted read-only during authoring):`

- `lions-club-app/DESIGN-BRIEF.md — confirmed design direction „Lions 2.0", colors, type, components, screen list, core flows.`
- `lions-club-app/SPEZIFIKATION.md — v1.2 product spec: roles & rights, event types & donation rules, attendance, data model, GDPR.`

`Production stack (for later handoff, not used here): `**`SvelteKit`**` frontend on `**`Netlify`**`, `**`Supabase (EU/Frankfurt)`**` for DB/Auth/Storage, `**`E-Mail-OTP`**` auth, Web-Push + e-mail reminders. This Claude Design system is a `**`visual & component template`**`, not drop-in code.`

---

## `Product context`

`The app serves `**`~34 members`**`, `**`~90% on mobile`**`. Core jobs:`

1. **`Termine`**` — a `**`Anstehend / Vergangen`**` segment (default Anstehend, next event on top) splits the list so nobody scrolls endlessly; the calendar view is freely navigable across months. Each card shows your own RSVP status (Zugesagt / Abgesagt / Offen) plus aggregate response counts (✓ zugesagt · ✗ abgesagt · ? offen). `**`Past events are read-only`**` (no register/cancel) but keep their final responses and recorded attendance for board/treasurer reference. Tapping any count opens a member sheet; the detail offers both Zusagen and Absagen so "Offen" never lingers. `**`Per-person Zusatzabfragen`**`: each event can ask flexible questions (Einfachauswahl, Mehrfachauswahl, Freitext, Ja/Nein, Zahl) answered separately for the member and every Begleitperson (e.g. a menu choice per attendee), plus booking-level group questions (Zimmerwunsch, Anreise, Kinderzahl for trips). The same engine powers the standalone survey area planned for Phase 2.`
2. **`Mitglieder`**` — directory with photo, office/role, direct call/mail; self-service editing of your own data and your partner's.`
3. **`Anwesenheit (Vorstand)`**` — for donation-bound events (Club-Abend, Mitglieder-Versammlung), the board records attendance; each absence of an active member creates a donation entry for the Förderverein.`
4. **`Schatzmeister`**` — absences per member & period, sum at the configurable rate, PDF/CSV export. The app only `**`records`**`; no payment processing.`
5. **`News & Dokumente`**`, plus a `**`Galerie`**` link to the existing Google share.`

`Roles (Ämter) are real permission roles: Präsident, Vizepräsident, Sekretär, Schatzmeister, Clubmaster, Webmaster/IT; others are display titles only.`

---

## `CONTENT FUNDAMENTALS`

`How copy is written in this product:`

- **`Language & address:`**` German throughout. The user is addressed informally with `**`„du"`**` (e.g. „Melde dich an", „Dein Status") — fitting for a club of acquaintances. Board/admin labels stay neutral-imperative („Anwesenheit erfassen", „Code anfordern").`
- **`Tone:`**` seriös, ruhig, vertrauenswürdig — it handles personal member data. Clear and reassuring, never playful or salesy. Short, plain sentences.`
- **`Casing:`**` German sentence/word capitalisation (nouns capitalised: „Begleitperson", „Mitglieder-Versammlung"). Buttons are short verbs or noun phrases in normal case („Anmelden", „Speichern", „Code anfordern"). `**`Uppercase only`**` for small mono labels (eyebrows, section labels, status counts), never for body or buttons.`
- **`Numbers, dates, money:`**` German formats — date 12.06.2026, time 19:00, money 25,00 € (amount first, comma decimal, space before the € sign — German convention). Dates/times/amounts are set in the `**`mono`**` font with tabular figures.`
- **`Status words are fixed vocabulary:`**` `**`Zugesagt / Abgesagt / Offen`**` is the member’s own RSVP state (label badge); aggregate counts use `**`angemeldet/abgemeldet/offen`**`. `**`Anwesend / Abwesend`**` (attendance), `**`aktiv / inaktiv / Ehrenmitglied`**` (member status). Reuse these exact words.`
- **`Event titles name the program/theme, not the type.`**` Use the evening’s subject as the title (e.g. „Thalia Buchhandlung – gestern, heute, morgen") and show the type („Club-Abend") only as a badge — never „Club-Abend Juni" as a title.`
- **`Hints are gentle, not alarmist.`**` Member-facing screens never repeat the absence-donation rule — members already know it, and it only created anxiety. The monetary view lives **only** in the Schatzmeister-Auswertung; attendance simply records An-/Abwesenheit. Where context is genuinely needed, use a quiet HintCard with a 4px stripe — no exclamation marks, no scare blocks.`
- **`Emoji:`**` `**`none.`**` Not part of the brand. Iconography is line icons only.`
- **`Vibe:`**` an elegant, trustworthy club ledger that happens to be a phone app — warm paper, serif headlines, disciplined color, lots of breathing room.`

---

## `VISUAL FOUNDATIONS`

**`Overall feeling.`**` Warm cream „paper", serif display headlines, a single disciplined action color (Lions Blue), gold used like gold leaf — sparingly. Quiet, spacious, high-contrast. The visual anchor is the `**`event list row`**`: a status circle on the left, a type tag, and a mono date on the right.`

**`Color.`**

- `Base surface is `**`warm cream`**` #F6F1E7 (--surface-app) — never pure white; this is the source of the warmth. Cards sit slightly lighter at #FCFAF4 (--surface-card).`
- `Separation is by `**`hairline`**` #E4DCCB (--border-hairline), `**`not shadow`**`.`
- `Text is warm `**`near-black`**` #211E18 (--text-strong); secondary is a solid #6E675A (--text-secondary) — a real contrast step, never pale grey.`
- **`Primary / action`**` = modernised `**`Lions Blue`**` #1E4FA3 (buttons, links, active tab, focus).`
- **`Accent`**` = `**`Lions Gold`**` #B98A22, sparing: the „Zugesagt" status, honors, highlights.`
- **`Clay/Red`**` #B4502F for gentle hints/warnings and „Abgesagt" — always on a light tint, never a loud full block.`
- **`Sage`**` #3F7A53 for „Anwesend" (present). Light mode is the product default; dark mode is a later option.`

**`Type.`**` Source superfamily. `**`Source Serif 4`**` for headlines only (warm, high-contrast serif). `**`Source Sans 3`**` for all content & UI — base `**`17px`**`, never below 16–17 in the app, intentionally larger and higher-contrast than the editorial inspiration. `**`Source Code Pro`**` mono, used sparingly for dates, times, tabular money and small uppercase labels. Headlines use slight negative tracking; mono labels use +0.06em and uppercase.`

**`Spacing & layout.`**` 4px base unit, generous whitespace, calm rhythm. Mobile gutter 20px, content column ≤ 440px. Bottom tab bar 64px. `**`Touch targets ≥ 44px`**` everywhere (buttons are 48px md / 54px lg). Fixed elements: top AppBar, bottom TabBar; the screen body scrolls between them; detail screens pin a primary CTA to the bottom.`

**`Backgrounds.`**` Flat warm fills only. `**`No gradients, no photographic hero backgrounds, no textures or patterns.`**` Imagery is limited to member photos (round avatars) and the linked external gallery — warm, natural, never duotone/grainy filters.`

**`Corners & cards.`**` Soft, calm radii: fields & cards 12px (--radius-md), sheets 16px, pills for badges/toggles. A card = card surface + `**`one hairline border, no drop shadow`**`. The only elevation is --shadow-md/lg reserved for sheets and dialogs, and a faint --shadow-sm under switch thumbs.`

**`Borders & shadows.`**` Hairlines do the structural work. Inputs have a 1px field border (--border-field) that turns blue on focus with a soft 3px focus ring (--focus-ring). Errors turn the border clay.`

**`Motion.`**` Calm and minimal — short fades and small movements (120–320ms) on --ease-standard / --ease-out. `**`No bounce, no springy overshoot, no infinite decorative loops.`**

**`Hover / press states.`**` Hover: a gentle warm fill (--surface-fill / cream-50) or one step darker on the primary (--primary-hover). Press: primary goes a step darker still (--primary-press) `**`and`**` the element nudges down 1px (translateY(1px)). Quiet, never flashy.`

**`Transparency & blur.`**` Used almost never. Surfaces are opaque warm fills; there are no glassmorphism/blur panels. (A future sheet/dialog scrim may use a low-opacity ink overlay.)`

**`Status system.`**` The signature device: a colored dot/badge encoding state — gold = Zugesagt, clay = Abgesagt, neutral ring = Offen, sage = Anwesend. Each event list card carries the member’s own status badge plus aggregate ✓/✗/? counts. Status is `**`never color-only`**`: it always pairs with a word or labelled badge (accessibility / Barrierearmut), and meta text meets WCAG AA contrast on cream.`

---

## `ICONOGRAPHY`

- **`Icon set: `[`Lucide`](https://lucide.dev)**` — line icons, ~1.9 stroke weight, rounded caps. Loaded via `**`CDN`**` (unpkg.com/lucide) in cards and the UI kit. Chosen to match the brief's „Linien-Icons" for the tab bar and quiet, modern feel. `*`(Substitution flag: the spec doesn't name an icon library — Lucide is a close, freely-licensed match. Swap if the club standardises on another set.)`*
- **`Style:`**` always line (stroke), never filled or duotone; single color (usually --text-secondary, or --primary for active/primary actions). Tab-bar icons go blue when active.`
- **`No emoji. No unicode glyph icons.`**` Icons are real SVGs from Lucide.`
- **`Common icons:`**` calendar-days, users, newspaper, menu (tabs); bell, search, map-pin, clock, phone, mail, user-plus, check, x, chevron-left/right, file-text, image, download, coins, clipboard-check, info, cake, utensils.`
- `Usage in code: components accept an `**`icon node`**` prop (pass a Lucide <svg>); in HTML cards/kit we use <i data-lucide="name"> + lucide.createIcons(), wrapped by the Ic helper in the UI kit.`

**`Logo / brand mark.`**` The club supplied the `**`official Lions Clubs International emblem`**` (assets/lions-emblem.png) — it is used in the logo lockup (foundations/brand-logo.card.html) and the app login screen, paired with the serif wordmark „Lions Club Bonn-Rheinaue" + tagline „We Serve". A typographic „LC" lettermark (assets/monogram.svg) remains available as a compact fallback for tight spaces (e.g. favicon). The emblem is a registered trademark of Lions Clubs International — use it only as the official club mark, on adequate clear space, without recoloring or distortion.`

---

## `Index / manifest`

**`Root`**

- `styles.css — global entry point (consumers link this one file; it @imports everything below).`
- `readme.md — this guide.`
- `SKILL.md — Agent-Skill front-matter for use in Claude Code.`

**`Tokens`**` (tokens/) — fonts.css (Source family via Google Fonts CDN), colors.css, typography.css, spacing.css (spacing/radii/elevation/motion), base.css (light reset + element defaults).`

**`Components`**` (components/) — React primitives (namespace window.LionsClubBonnRheinaueDesignSystem_4b530e):`

- `core/ — `**`Button, IconButton, Card, Avatar, Tag`**
- `feedback/ — `**`StatusBadge, HintCard`**
- `forms/ — `**`Input, OtpInput, Select, Checkbox, Switch, SegmentedControl`**
- `navigation/ — `**`AppBar, ListRow, TabBar`**
- `Each has <Name>.jsx, <Name>.d.ts, <Name>.prompt.md; each directory has one @dsCard HTML.`

**`Foundations`**` (foundations/) — specimen cards for the Design System tab: color (primary, neutrals, ink, accent, status), type (display, body, mono), spacing (scale, radii, elevation), brand (logo, signature pattern, iconography).`

**`UI kit`**` (ui_kits/club-app/) — interactive mobile PWA recreation: index.html (entry), data.js (sample club data + 34-person roster & responsesFor() grouping), helpers.jsx (Ic + PhoneFrame), QuestionField (flexible Zusatzabfrage engine — single/multi/text/bool/number, per-person & group scope), screens LoginScreen, EventListScreen, EventDetailScreen, MembersScreen, ProfileScreen, AttendanceScreen, TreasurerScreen, AdminScreen (Jahresplanung), the shared ResponseSheet (tap any ✓/✗/? count or Meldungen row to see who is zugesagt / abgesagt / offen, with a Lions-2.0 status switcher), App.jsx, app.css, README.md. The Termin-Detail RSVP control always shows both Zusagen (primary) and Absagen (secondary) with the current status highlighted, so members can resolve „Offen" in either direction.`

**`Assets`**` (assets/) — lions-emblem.png (official Lions Clubs International emblem, supplied by the club), monogram.svg (compact „LC" lettermark fallback).`

---

## `Known caveats / to confirm`

- **`Fonts are CDN-loaded`**` (Google Fonts), not self-hosted — the compiler may not list them as bundled @font-face. Provide TTF/WOFF2 files to self-host for production/offline PWA.`
- **`Hex values are approximations`**` from the agreed concept and should be finally tuned against the official Lions brand manual.`
- **`Logo:`**` official Lions emblem now in place (assets/lions-emblem.png); confirm clear-space / usage rules against the Lions brand manual.`
- **`Lucide`**` is a substitution for an unspecified icon set.`
