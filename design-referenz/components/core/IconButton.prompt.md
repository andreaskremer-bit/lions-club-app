Icon-only button for app bars and row quick-actions (call, mail, edit, back). Always pass `label` for accessibility.

```jsx
<IconButton icon={<svg/* lucide phone */ />} label="Anrufen" tone="primary" />
<IconButton icon={<svg/* lucide chevron-left */ />} label="Zurück" />
<IconButton icon={<svg/* lucide pencil */ />} label="Bearbeiten" bordered />
```

`size` sm|md|lg (md = 44px). `bordered` adds hairline + card surface. `tone="primary"` tints the glyph blue.
