The signature indicator — a member's registration state for an event. Defaults to German labels.

```jsx
<StatusBadge status="yes" />     {/* Angemeldet — gold */}
<StatusBadge status="no" />      {/* Abgemeldet — clay */}
<StatusBadge status="open" />    {/* Offen — neutral */}
<StatusBadge status="present" /> {/* Anwesend — sage */}

{/* dot-only for the left edge of a list row */}
<StatusBadge status="yes" dotOnly />
```

Pair the `dotOnly` circle with a mono date on the right in `ListRow`.
