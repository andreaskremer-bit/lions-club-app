---
name: lions-bonn-rheinaue-design
description: Use this skill to generate well-branded interfaces and assets for the Lions Club Bonn-Rheinaue club-management app ("Lions 2.0" — warm-reduced, readability-first, German PWA), either for production or throwaway prototypes/mocks. Contains design guidelines, colors, type, fonts, assets, and a full mobile UI kit with reusable components.
user-invocable: true
---

Read the `readme.md` file within this skill, and explore the other available files (tokens, components, foundations, ui_kits).

If creating visual artifacts (slides, mocks, throwaway prototypes, etc), copy assets out and create static HTML files for the user to view. If working on production code, you can copy assets and read the rules here to become an expert in designing with this brand.

If the user invokes this skill without any other guidance, ask them what they want to build or design, ask some questions, and act as an expert designer who outputs HTML artifacts _or_ production code, depending on the need.

Key facts to honor:

- The product UI is **German**, addressing the user informally ("du"). No emoji.
- Warm cream base (`#F6F1E7`), Lions Blue action (`#1E4FA3`), sparing Lions Gold (`#B98A22`), clay hints (`#B4502F`). Hairlines, not shadows. Light mode default.
- Source Serif 4 (headlines only) + Source Sans 3 (content, base 17px) + Source Code Pro (dates/times/labels). Touch targets ≥ 44px.
- Link `styles.css` for tokens. Reusable React components live under `components/` (namespace `window.LionsClubBonnRheinaueDesignSystem_4b530e`); load `_ds_bundle.js`. Line icons via Lucide.
- The logo is a typographic placeholder — the official Lions emblem is trademarked and must be supplied by the club.
