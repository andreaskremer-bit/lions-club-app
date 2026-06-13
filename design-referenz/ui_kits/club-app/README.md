# Club-App UI kit

Interactive mobile recreation of the Lions Club Bonn-Rheinaue PWA. Open `index.html`.

## Flow
Login (e-mail → 6-digit OTP) → **Termine** (list / calendar) → tap an event → **Termin-Detail** (An-/Abmelden, Begleitperson, Menüauswahl). Bottom tabs: **Termine · Mitglieder · News · Mehr**. From **Mehr**, board tools open: **Anwesenheit erfassen** and **Schatzmeister-Auswertung**, plus **Mein Profil** (Selbstpflege).

To skip the login on load, the OTP step accepts any 6 digits.

## Files
- `index.html` — entry; loads `styles.css`, `_ds_bundle.js` (components), Lucide, then the screens.
- `data.js` — sample members, events, donations (`window.LC_DATA`).
- `helpers.jsx` — `Ic` (Lucide wrapper) and `PhoneFrame`.
- `App.jsx` — login gate, tabs, overlay stack; inline `NewsScreen` + `MoreScreen`.
- `LoginScreen` · `EventListScreen` · `EventDetailScreen` · `MembersScreen` · `ProfileScreen` · `AttendanceScreen` · `TreasurerScreen`.
- `app.css` — kit-specific layout (phone frame, screens). Foundations & components come from the design system tokens/bundle.

These screens compose the design-system primitives (`Button`, `Card`, `AppBar`, `ListRow`, `StatusBadge`, `Tag`, `Input`, `OtpInput`, `Select`, `Switch`, `SegmentedControl`, `Avatar`, `IconButton`, `TabBar`, `HintCard`) — they are not reimplemented here.

Sample names, events and amounts are fictional and illustrative.
