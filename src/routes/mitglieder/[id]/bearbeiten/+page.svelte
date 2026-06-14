<script lang="ts">
	import { untrack } from 'svelte';
	import { goto, invalidateAll } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { AppBar, IconButton, Input, Button, Card } from '$lib/components/ui';
	import { ChevronLeft } from '@lucide/svelte';
	import type { MemberStatus } from '../../+page';

	let { data } = $props();
	let supabase = $derived(data.supabase);
	let m = $derived(data.member);

	const init = untrack(() => data.member);

	// Stammdaten
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
	// Status nur für Berechtigte
	let status = $state<MemberStatus>(init.status);

	// Ämter (nur manage_roles): Zuordnung wird je Umschalten direkt gespeichert.
	let assigned = $state(new Set<string>(untrack(() => data.memberAmtIds)));
	let amtBusy = $state(false);

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
		const payload: Record<string, unknown> = {
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
		};
		// Status darf nur mit edit_member_master geändert werden (sonst Spaltenschutz-Trigger).
		if (data.canEditMaster) payload.status = status;

		const { error: err } = await supabase.from('member').update(payload).eq('id', m.id);
		saving = false;
		if (err) {
			error = 'Speichern fehlgeschlagen: ' + err.message;
			return;
		}
		await goto(resolve('/mitglieder/[id]', { id: m.id }), { invalidateAll: true });
	}

	async function toggleAmt(amtId: string, checked: boolean) {
		if (amtBusy) return;
		amtBusy = true;
		error = '';
		const q = checked
			? supabase.from('member_amt').insert({ member_id: m.id, amt_id: amtId })
			: supabase.from('member_amt').delete().eq('member_id', m.id).eq('amt_id', amtId);
		const { error: err } = await q;
		amtBusy = false;
		if (err) {
			error = 'Amt konnte nicht geändert werden: ' + err.message;
			return;
		}
		if (checked) assigned.add(amtId);
		else assigned.delete(amtId);
		await invalidateAll();
	}

	async function removeMember() {
		if (
			!confirm(
				`${m.first_name} ${m.last_name} wirklich löschen? Das kann nicht rückgängig gemacht werden.`
			)
		)
			return;
		const { error: err } = await supabase.from('member').delete().eq('id', m.id);
		if (err) {
			error = 'Löschen fehlgeschlagen: ' + err.message;
			return;
		}
		await goto(resolve('/mitglieder'), { invalidateAll: true });
	}
</script>

<div class="shell">
	<AppBar
		title={data.isSelf ? 'Profil bearbeiten' : 'Mitglied bearbeiten'}
		eyebrow="Verwaltung"
		bordered
	>
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
				{#if data.canEditMaster}
					<label class="field">
						<span class="field__label">Status</span>
						<select bind:value={status}>
							<option value="aktiv">aktiv</option>
							<option value="inaktiv">inaktiv</option>
							<option value="ehrenmitglied">Ehrenmitglied</option>
						</select>
					</label>
				{/if}
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

		{#if data.canManageRoles}
			<Card>
				<h2 class="sec">Ämter</h2>
				<p class="muted">Änderungen werden sofort gespeichert.</p>
				<div class="aemter">
					{#each data.allAemter as a (a.id)}
						<label class="amt">
							<input
								type="checkbox"
								checked={assigned.has(a.id)}
								disabled={amtBusy}
								onchange={(e) => toggleAmt(a.id, e.currentTarget.checked)}
							/>
							<span>{a.label}</span>
						</label>
					{/each}
				</div>
			</Card>
		{/if}

		{#if data.canDelete && !data.isSelf}
			<Card>
				<h2 class="sec">Gefahrenzone</h2>
				<Button variant="danger" fullWidth onclick={removeMember}>Mitglied löschen</Button>
			</Card>
		{/if}
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
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
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
	.field {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
	}
	.field__label {
		font-size: var(--text-sm);
		font-weight: 600;
		color: var(--text-strong);
	}
	.field select {
		font-size: var(--text-base);
		padding: var(--space-2);
		border: 1px solid var(--hairline, rgba(0, 0, 0, 0.2));
		border-radius: var(--radius-sm, 8px);
		background: var(--surface, #fff);
		color: var(--text-strong);
		min-height: 44px;
	}
	.aemter {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}
	.amt {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		font-size: var(--text-base);
		color: var(--text-strong);
		min-height: 44px;
	}
	.amt input {
		width: 20px;
		height: 20px;
	}
	.muted {
		font-size: var(--text-sm);
		color: var(--text-secondary);
		margin: 0 0 var(--space-2);
	}
	.err {
		color: var(--clay, #b4502f);
		font-size: var(--text-base);
		margin: 0;
	}
</style>
