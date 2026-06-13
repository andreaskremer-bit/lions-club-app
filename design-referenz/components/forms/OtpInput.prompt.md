Six-cell OTP entry for the e-mail login code. Auto-advances, supports paste, mono digits.

```jsx
const [code, setCode] = React.useState('');
<OtpInput value={code} onChange={setCode} />;
```

Controlled — read `value` to know when all 6 digits are entered.
