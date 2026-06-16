<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { Button, Input, OtpInput } from '$lib/components/ui';
	import { Mail, ArrowRight, ChevronLeft } from '@lucide/svelte';

	let { data } = $props();
	let supabase = $derived(data.supabase);

	let step = $state<'email' | 'code'>('email');
	let email = $state('');
	let code = $state('');
	let loading = $state(false);
	let error = $state('');
	let info = $state('');

	async function requestCode() {
		error = '';
		info = '';
		if (!email.trim()) {
			error = 'Bitte gib deine E-Mail-Adresse ein.';
			return;
		}
		loading = true;
		// Kein Self-Signup: nur angelegte Mitglieder erhalten einen Code.
		const { error: err } = await supabase.auth.signInWithOtp({
			email: email.trim(),
			options: { shouldCreateUser: false }
		});
		loading = false;
		if (err) {
			error = 'Code konnte nicht gesendet werden. Bitte prüfe deine E-Mail-Adresse.';
			return;
		}
		step = 'code';
		code = '';
	}

	async function verify() {
		if (code.length < 6) return;
		error = '';
		loading = true;
		const { error: err } = await supabase.auth.verifyOtp({
			email: email.trim(),
			token: code,
			type: 'email'
		});
		loading = false;
		if (err) {
			error = 'Der Code ist ungültig oder abgelaufen.';
			code = '';
			return;
		}
		await goto(resolve('/'), { invalidateAll: true });
	}

	async function resend() {
		await requestCode();
		if (!error) info = 'Wir haben dir einen neuen Code gesendet.';
	}
</script>

<div class="login">
	<div class="login__top">
		<div class="brand">
			<img class="brand__emblem" src="/icons/lions-emblem.png" alt="Lions Club Bonn-Rheinaue" />
			<div class="brand__name">Lions Club<br />Bonn-Rheinaue</div>
			<div class="brand__sub">We Serve</div>
		</div>
	</div>

	{#if step === 'email'}
		<div class="login__card">
			<h1 class="login__h">Willkommen zurück</h1>
			<p class="login__p">
				Melde dich mit deiner E-Mail-Adresse an. Wir senden dir einen 6-stelligen Code.
			</p>
			<Input
				label="E-Mail"
				type="email"
				autocomplete="email"
				bind:value={email}
				placeholder="name@example.de"
				error={error || undefined}
				onkeydown={(e) => e.key === 'Enter' && requestCode()}
			>
				{#snippet icon()}<Mail size={20} />{/snippet}
			</Input>
			<Button
				variant="primary"
				size="lg"
				fullWidth
				disabled={loading}
				onclick={requestCode}
				style="margin-top: 4px"
			>
				{loading ? 'Wird gesendet …' : 'Code anfordern'}
				{#snippet iconRight()}<ArrowRight size={20} />{/snippet}
			</Button>
		</div>
	{:else}
		<div class="login__card">
			<button class="login__back" onclick={() => (step = 'email')}>
				<ChevronLeft size={18} /> Zurück
			</button>
			<h1 class="login__h">Code eingeben</h1>
			<p class="login__p">
				Wir haben einen Code an<br /><strong>{email}</strong> gesendet.
			</p>
			<OtpInput bind:value={code} oncomplete={verify} />
			{#if error}<p class="login__err">{error}</p>{/if}
			{#if info}<p class="login__info">{info}</p>{/if}
			<Button
				variant="primary"
				size="lg"
				fullWidth
				disabled={code.length < 6 || loading}
				onclick={verify}
				style="margin-top: 20px"
			>
				{loading ? 'Anmeldung …' : 'Anmelden'}
			</Button>
			<button class="login__resend" onclick={resend} disabled={loading}>Code erneut senden</button>
		</div>
	{/if}
</div>

<style>
	.login {
		display: flex;
		flex-direction: column;
		min-height: 100dvh;
		max-width: var(--content-max);
		margin: 0 auto;
		padding: 0 24px calc(28px + env(safe-area-inset-bottom, 0px));
	}
	.login__top {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	.brand {
		text-align: center;
	}
	.brand__emblem {
		width: 108px;
		height: 108px;
		object-fit: contain;
		display: block;
		margin: 0 auto 18px;
	}
	.brand__name {
		font-family: var(--font-display);
		font-weight: 600;
		font-size: 25px;
		color: var(--text-strong);
		line-height: 1.12;
		letter-spacing: -0.01em;
		white-space: nowrap;
	}
	.brand__sub {
		font-family: var(--font-mono);
		font-size: 11px;
		letter-spacing: 0.16em;
		text-transform: uppercase;
		color: var(--gold-700);
		margin-top: 8px;
	}
	.login__card {
		display: flex;
		flex-direction: column;
		gap: 14px;
		padding-bottom: 24px;
	}
	.login__h {
		font-size: 26px;
	}
	.login__p {
		font-size: 15px;
		color: var(--text-secondary);
		margin: -4px 0 6px;
		line-height: 1.5;
	}
	.login__p strong {
		color: var(--text-strong);
	}
	.login__back {
		align-self: flex-start;
		display: inline-flex;
		align-items: center;
		gap: 4px;
		background: none;
		border: none;
		color: var(--text-secondary);
		font-family: var(--font-sans);
		font-size: 14px;
		font-weight: 600;
		cursor: pointer;
		padding: 4px 0;
	}
	.login__resend {
		background: none;
		border: none;
		color: var(--text-link);
		font-family: var(--font-sans);
		font-size: 14px;
		font-weight: 600;
		cursor: pointer;
		padding: 14px;
		align-self: center;
	}
	.login__err {
		font-size: 14px;
		color: var(--danger-fg);
		font-weight: 500;
		margin: 0;
	}
	.login__info {
		font-size: 14px;
		color: var(--text-secondary);
		margin: 0;
	}
</style>
