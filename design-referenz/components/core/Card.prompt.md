The default container — warm card surface bounded by a single hairline, never a shadow. Wrap every grouped block in one.

```jsx
<Card>
  <h3>Club-Abend Juni</h3>
  <p>Restaurant Rheinblick · 19:00</p>
</Card>

<Card interactive onClick={open}>…tap target…</Card>
<Card flush>{/* full-bleed list rows */}</Card>
```

`size` md|lg, `flush` removes padding, `sunken` recesses the surface, `interactive` adds hover/press and renders a button.
