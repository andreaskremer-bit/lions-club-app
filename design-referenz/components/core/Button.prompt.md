Primary action control in Lions Blue — use for the single most important action on a screen (e.g. "Anmelden", "Speichern").

```jsx
<Button variant="primary" size="lg" fullWidth>Anmelden</Button>
<Button variant="secondary" iconLeft={<svg/* lucide */ />}>Abmelden</Button>
<Button variant="ghost" size="sm">Mehr anzeigen</Button>
<Button variant="danger">Mitglied löschen</Button>
```

Variants: `primary` (filled blue), `secondary` (hairline on card), `ghost` (quiet blue), `danger` (clay). Sizes `sm | md | lg`; use `md`/`lg` for touch. `fullWidth` for mobile CTAs. Pass `as="a"` for link buttons.
