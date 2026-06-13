Labeled text field with optional icon, hint and an explicit inline error.

```jsx
<Input label="E-Mail" type="email" required
  icon={<svg/* lucide mail */ />} placeholder="name@example.de" />

<Input label="Handy" error="Bitte eine gültige Nummer eingeben." />

<Input label="Kommentar" multiline placeholder="Optional…" />
```

Errors replace the hint and turn the border clay. `multiline` renders a textarea.
