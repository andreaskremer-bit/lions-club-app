Inline 2–3 way toggle — the Liste/Kalender switch and short filters.

```jsx
const [view, setView] = React.useState('liste');
<SegmentedControl
	value={view}
	onChange={setView}
	options={[
		{ label: 'Liste', value: 'liste' },
		{ label: 'Kalender', value: 'kalender' }
	]}
/>;
```

Options can carry an `icon` node.
