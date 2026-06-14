<script lang="ts">
	import { untrack } from 'svelte';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { AppBar, IconButton, Input, Button, Card } from '$lib/components/ui';
	import { ChevronLeft } from '@lucide/svelte';

	let { data } = $props();
	let supabase = $derived(data.supabase);
	let m = $derived(data.member);

	// Anfangswerte einmalig (nicht-reaktiver Snapshot) — das Formular ist danach eigenständig.
	const init = untrack(() => data.member);

	// Bearbeitbare Stammdaten (E-Mail/Status bewusst NICHT — Admin-Weg / Spaltenschutz).
	let title = $state(init.title ?? '');
	let first_name = $state(init.first_name);
	let last_name = $state(init.last_name);
	let phone = $state(init.phone ?? '');
	let mobile = $state(init.mobile ?? '');
	let street = $state(init.street ?? '');
	let zip = $state(init.zip ?? '');
	let city = $state(init.city ?? '');
	let birthday = $state(init.birthday ?? '');
	let partner_name = $state(init.partner_name ?? '');
	let partner_birthday = $state(init.partner_birthday ?? '');
	let partner_email = $state(init.partner_email ?? '');
	let partner_mobile = $state(init.partner_mobile ?? '');

	let saving = $state(false);
	let error = $state('');

	const orNull = (v: string) => (v.trim() === '' ? null : v.trim());

	async function save(e: SubmitEvent) {
		e.preventDefault();
		if (!first_name.trim() || !last_name.trim()) {
			error = 'Vor- und Nachname dürfen nicht leer sein.';
			return;
		}
		saving = true;
		error = '';
		const { error: err } = await supabase
			.from('member')
			.update({
				title: orNull(title),
				first_name: first_name.trim(),
				last_name: last_name.trim(),
				phone: orNull(phone),
				mobile: orNull(mobile),
				street: orNull(street),
				zip: orNull(zip),
				city: orNull(city),
				birthday: orNull(birthday),
				partner_name: orNull(partner_name),
				partner_birthday: orNull(partner_birthday),
				partner_email: orNull(partner_email),
				partner_mobile: orNull(partner_mobile)
			})
			.eq('id', m.id);
		saving = false;
		if (err) {
			error = 'Speichern fehlgeschlagen: ' + err.message;
			return;
		}
		await goto(resolve('/mitglieder/[id]', { id: m.id }), { invalidateAll: true });
	}
</script>

<div class="shell">
	<AppBar title="Profil bearbeiten" eyebrow="Selbstpflege" bordered>
		{#snippet leading()}
			<IconButton label="Zurück" onclick={() => goto(resolve('/mitglieder/[id]', { id: m.id }))}>
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
				<Input label="Geburtstag" type="date" bind:value={birthday} />
			</Card>

			<Card>
				<h2 class="sec">Kontakt</h2>
				<Input label="Handy" type="tel" bind:value={mobile} />
				<Input label="Festnetz" type="tel" bind:value={phone} />
				<Input label="Straße" bind:value={street} />
				<div class="row">
					<Input label="PLZ" bind:value={zip} class="zip" />
					<Input label="Ort" bind:value={city} class="ort" />
				</div>
			</Card>

			<Card>
				<h2 class="sec">Partner/in</h2>
				<Input label="Name" bind:value={partner_name} />
				<Input label="Geburtstag" type="date" bind:value={partner_birthday} />
				<Input label="Handy" type="tel" bind:value={partner_mobile} />
				<Input label="E-Mail" type="email" bind:value={partner_email} />
			</Card>

			{#if error}<p class="err">{error}</p>{/if}

			<Button type="submit" fullWidth disabled={saving}>
				{saving ? 'Speichern …' : 'Speichern'}
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
	.row {
		display: flex;
		gap: var(--space-3);
	}
	.row :global(.zip) {
		flex: 0 0 32%;
	}
	.row :global(.ort) {
		flex: 1;
	}
	.err {
		color: var(--clay, #b4502f);
		font-size: var(--text-base);
		margin: 0;
	}
</style>
