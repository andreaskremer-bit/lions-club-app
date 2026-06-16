<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { AppBar, IconButton, Input, Select, Button, Card } from '$lib/components/ui';
	import { ChevronLeft } from '@lucide/svelte';

	let { data } = $props();
	let supabase = $derived(data.supabase);

	let first_name = $state('');
	let last_name = $state('');
	let title = $state('');
	let email = $state('');
	let status = $state<'aktiv' | 'inaktiv' | 'ehrenmitglied'>('aktiv');
	const statusOptions: { value: typeof status; label: string }[] = [
		{ value: 'aktiv', label: 'aktiv' },
		{ value: 'inaktiv', label: 'inaktiv' },
		{ value: 'ehrenmitglied', label: 'Ehrenmitglied' }
	];
	let mobile = $state('');
	let phone = $state('');
	let phone_office = $state('');
	let city = $state('');
	let birthday = $state('');
	let joined_on = $state('');

	let saving = $state(false);
	let error = $state('');

	const orNull = (v: string) => (v.trim() === '' ? null : v.trim());

	async function save(e: SubmitEvent) {
		e.preventDefault();
		if (!first_name.trim() || !last_name.trim() || !email.trim()) {
			error = 'Vorname, Nachname und E-Mail sind erforderlich.';
			return;
		}
		saving = true;
		error = '';
		const { data: created, error: err } = await supabase
			.from('member')
			.insert({
				first_name: first_name.trim(),
				last_name: last_name.trim(),
				title: orNull(title),
				email: email.trim(),
				status,
				mobile: orNull(mobile),
				phone: orNull(phone),
				phone_office: orNull(phone_office),
				city: orNull(city),
				birthday: orNull(birthday),
				joined_on: orNull(joined_on)
			})
			.select('id')
			.single();
		saving = false;
		if (err) {
			error = err.message.includes('member_email_unique')
				? 'Diese E-Mail ist bereits vergeben.'
				: 'Anlegen fehlgeschlagen: ' + err.message;
			return;
		}
		await goto(resolve('/mitglieder/[id]', { id: created.id }), { invalidateAll: true });
	}
</script>

<div class="shell">
	<AppBar title="Neues Mitglied" eyebrow="Verwaltung" bordered>
		{#snippet leading()}
			<IconButton label="Zurück" onclick={() => goto(resolve('/mitglieder'))}>
				{#snippet icon()}<ChevronLeft />{/snippet}
			</IconButton>
		{/snippet}
	</AppBar>

	<main class="shell__body">
		<form onsubmit={save} class="form">
			<Card>
				<h2 class="sec">Stammdaten</h2>
				<Input label="Titel" bind:value={title} placeholder="z. B. Dr." />
				<Input label="Vorname" bind:value={first_name} required />
				<Input label="Nachname" bind:value={last_name} required />
				<Input
					label="E-Mail"
					type="email"
					bind:value={email}
					required
					hint="Login-Adresse; Einladung folgt separat."
				/>
				<Select label="Status" options={statusOptions} bind:value={status} />
			</Card>

			<Card>
				<h2 class="sec">Kontakt &amp; Daten</h2>
				<Input label="Handy" type="tel" bind:value={mobile} />
				<Input label="Festnetz" type="tel" bind:value={phone} />
				<Input label="Büro" type="tel" bind:value={phone_office} />
				<Input label="Ort" bind:value={city} />
				<Input label="Geburtstag" type="date" bind:value={birthday} />
				<Input label="Mitglied seit" type="date" bind:value={joined_on} />
			</Card>

			{#if error}<p class="err">{error}</p>{/if}

			<Button type="submit" fullWidth disabled={saving}>
				{saving ? 'Anlegen …' : 'Mitglied anlegen'}
			</Button>
		</form>
	</main>
</div>

<style>
	.shell {
		display: flex;
		flex-direction: column;
		min-height: 100dvh;
		max-width: var(--content-max);
		margin: 0 auto;
	}
	.shell__body {
		flex: 1;
		padding: var(--screen-pad);
	}
	.form {
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
	}
	.sec {
		font-size: var(--text-sm);
		color: var(--text-secondary);
		text-transform: uppercase;
		letter-spacing: 0.06em;
		margin: 0 0 var(--space-3);
	}
	.err {
		color: var(--clay, #b4502f);
		font-size: var(--text-base);
		margin: 0;
	}
</style>
