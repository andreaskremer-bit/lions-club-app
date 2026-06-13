Toggle for settings and the attendance present/absent control.

```jsx
<Switch label="Push-Erinnerungen" defaultChecked />
<Switch tone="present" checked={present} onChange={e => setPresent(e.target.checked)} />
```
