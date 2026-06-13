// Login — e-mail OTP, one step per screen.
const LC = window.LionsClubBonnRheinaueDesignSystem_4b530e;

function LoginScreen({ onLogin }) {
  const { Button, Input, OtpInput } = LC;
  const { Ic } = window;
  const [step, setStep] = React.useState('email');
  const [email, setEmail] = React.useState('a.kremer@example.de');
  const [code, setCode] = React.useState('');

  return (
    <div className="login">
      <div className="login__top">
        <div className="brand">
          <img className="brand__emblem" src={(window.__resources && window.__resources.lionsEmblem) || '../../assets/lions-emblem.png'} alt="Lions Clubs International Emblem" />
          <div className="brand__name">Lions Club<br/>Bonn-Rheinaue</div>
          <div className="brand__sub">We Serve</div>
        </div>
      </div>

      {step === 'email' ? (
        <div className="login__card">
          <h1 className="login__h">Willkommen zurück</h1>
          <p className="login__p">Melde dich mit deiner E-Mail-Adresse an. Wir senden dir einen 6-stelligen Code.</p>
          <Input label="E-Mail" type="email" icon={<Ic name="mail" size={20} />} value={email}
            onChange={e => setEmail(e.target.value)} placeholder="name@example.de" />
          <Button variant="primary" size="lg" fullWidth iconRight={<Ic name="arrow-right" size={20} />}
            onClick={() => setStep('code')} style={{ marginTop: 4 }}>Code anfordern</Button>
        </div>
      ) : (
        <div className="login__card">
          <button className="login__back" onClick={() => setStep('email')}>
            <Ic name="chevron-left" size={18} /> Zurück
          </button>
          <h1 className="login__h">Code eingeben</h1>
          <p className="login__p">Wir haben einen Code an<br/><strong>{email}</strong> gesendet.</p>
          <OtpInput value={code} onChange={setCode} />
          <Button variant="primary" size="lg" fullWidth disabled={code.length < 6}
            onClick={onLogin} style={{ marginTop: 20 }}>Anmelden</Button>
          <button className="login__resend">Code erneut senden</button>
        </div>
      )}
    </div>
  );
}
window.LoginScreen = LoginScreen;
