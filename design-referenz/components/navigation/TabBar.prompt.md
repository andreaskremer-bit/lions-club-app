The primary mobile navigation — fixed bottom bar with line icons, active tab in Lions Blue.

```jsx
const tabs = [
	{ id: 'termine', label: 'Termine', icon: <svg /* lucide calendar */ /> },
	{ id: 'mitglieder', label: 'Mitglieder', icon: <svg /* lucide users */ /> },
	{ id: 'news', label: 'News', icon: <svg /* lucide newspaper */ />, badge: 2 },
	{ id: 'mehr', label: 'Mehr', icon: <svg /* lucide menu */ /> }
];
<TabBar items={tabs} value={tab} onChange={setTab} />;
```

Each item: `{id, label, icon, iconActive?, badge?}`. Place it as the last child of a phone frame; it pads for the home indicator.
