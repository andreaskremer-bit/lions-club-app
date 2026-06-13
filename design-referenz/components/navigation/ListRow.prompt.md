The workhorse row: status/avatar lead, title + subtitle, trailing mono date and chevron. Stack rows inside a `flush` Card — they self-divide with hairlines.

```jsx
<Card flush>
  <ListRow
    lead={<StatusBadge status="yes" dotOnly />}
    title="Club-Abend Juni"
    subtitle="Restaurant Rheinblick · Bonn"
    date={"12.06.\n19:00"}
    chevron
    onClick={open}
  />
  <ListRow lead={<Avatar name="Maria Vogt" />} title="Maria Vogt" subtitle="Schatzmeisterin" chevron />
</Card>
```
