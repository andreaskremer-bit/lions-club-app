<script lang="ts">
	import { untrack } from 'svelte';
	import { goto, invalidateAll } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { AppBar, IconButton, Input, Select, Button, Card, Avatar } from '$lib/components/ui';
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
	let phone_office = $state(init.phone_office ?? '');
	let mobile = $state(init.mobile ?? '');
	let street = $state(init.street ?? '');
	let zip = $state(init.zip ?? '');
	let city = $state(init.city ?? '');
	let birthday = $state(init.birthday ?? '');
	let partner_first_name = $state(init.partner_first_name ?? '');
	let partner_last_name = $state(init.partner_last_name ?? '');
	let partner_birthday = $state(init.partner_birthday ?? '');
	let partner_email = $state(init.partner_email ?? '');
	let partner_mobile = $state(init.partner_mobile ?? '');
	// Status nur für Berechtigte
	let status = $state<MemberStatus>(init.status);
	const statusOptions: { value: MemberStatus; label: string }[] = [
		{ value: 'aktiv', label: 'aktiv' },
		{ value: 'inaktiv', label: 'inaktiv' },
		{ value: 'ehrenmitglied', label: 'Ehrenmitglied' }
	];

	let saving = $state(false);
	let uploading = $state(false);
	let error = $state('');

	const orNull = (v: string) => (v.trim() === '' ? null : v.trim());

	async function onFile(e: Event) {
		const input = e.currentTarget as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return;
		uploading = true;
		error = '';
		const ext = (file.name.split('.').pop() || 'jpg').toLowerCase();
		const path = `${m.id}/avatar_${Date.now()}.${ext}`;
		const { error: upErr } = await supabase.storage
			.from('member-photos')
			.upload(path, file, { contentType: file.type, upsert: true });
		if (upErr) {
			uploading = false;
			error = 'Upload fehlgeschlagen: ' + upErr.message;
			return;
		}
		const { error: updErr } = await supabase
			.from('member')
			.update({ photo_path: path })
			.eq('id', m.id);
		uploading = false;
		input.value = '';
		if (updErr) {
			error = 'Speichern fehlgeschlagen: ' + updErr.message;
			return;
		}
		await invalidateAll();
	}

	async function removePhoto() {
		if (!m.photo_path) return;
		uploading = true;
		error = '';
		await supabase.storage.from('member-photos').remove([m.photo_path]);
		const { error: updErr } = await supabase
			.from('member')
			.update({ photo_path: null })
			.eq('id', m.id);
		uploading = false;
		if (updErr) {
			error = 'Entfernen fehlgeschlagen: ' + updErr.message;
			return;
		}
		await invalidateAll();
	}

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
			phone_office: orNull(phone_office),
			mobile: orNull(mobile),
			street: orNull(street),
			zip: orNull(zip),
			city: orNull(city),
			birthday: orNull(birthday),
			partner_first_name: orNull(partner_first_name),
			partner_last_name: orNull(partner_last_name),
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
		<Card>
			<h2 class="sec">Foto</h2>
			<div class="photo">
				<Avatar name={`${m.first_name} ${m.last_name}`} src={data.photoUrl} size="xl" />
				<div class="photo__actions">
					<label class="filebtn">
						<input type="file" accept="image/*" onchange={onFile} disabled={uploading} />
						<span>{uploading ? 'Lädt …' : 'Foto wählen'}</span>
					</label>
					{#if m.photo_path}
						<Button variant="ghost" disabled={uploading} onclick={removePhoto}>Entfernen</Button>
					{/if}
				</div>
			</div>
		</Card>

		<form onsubmit={save} class="form">
			<Card>
				<h2 class="sec">Stammdaten</h2>
				<Input label="Titel" bind:value={title} placeholder="z. B. Dr." />
				<Input label="Vorname" bind:value={first_name} required />
				<Input label="Nachname" bind:value={last_name} required />
				<Input label="Geburtstag" type="date" bind:value={birthday} />
				{#if data.canEditMaster}
					<Select label="Status" options={statusOptions} bind:value={status} />
				{/if}
			</Card>

			<Card>
				<h2 class="sec">Kontakt</h2>
				<Input label="Handy" type="tel" bind:value={mobile} />
				<Input label="Festnetz" type="tel" bind:value={phone} />
				<Input label="Büro" type="tel" bind:value={phone_office} />
				<Input label="Straße" bind:value={street} />
				<div class="row">
					<Input label="PLZ" bind:value={zip} class="zip" />
					<Input label="Ort" bind:value={city} class="ort" />
				</div>
			</Card>

			<Card>
				<h2 class="sec">Partner/in</h2>
				<Input label="Vorname" bind:value={partner_first_name} />
				<Input label="Nachname" bind:value={partner_last_name} />
				<Input label="Geburtstag" type="date" bind:value={partner_birthday} />
				<Input label="Handy" type="tel" bind:value={partner_mobile} />
				<Input label="E-Mail" type="email" bind:value={partner_email} />
			</Card>

			{#if error}<p class="err">{error}</p>{/if}

			<Button type="submit" fullWidth disabled={saving}>
				{saving ? 'Speichern …' : 'Speichern'}
			</Button>
		</form>

		<Card>
			<h2 class="sec">Ämter (aktuelles Lions-Jahr)</h2>
			{#if data.currentOffices.length}
				<ul class="offices">
					{#each data.currentOffices as o (o)}<li>{o}</li>{/each}
				</ul>
			{:else}
				<p class="muted">Keine Ämter im aktuellen Lions-Jahr.</p>
			{/if}
			{#if data.canManageRoles}
				<Button variant="ghost" onclick={() => goto(resolve('/vorstand'))}>
					Ämter im Vorstandsbereich pflegen
				</Button>
			{/if}
		</Card>

		{#if data.canDelete && !data.isSelf}
			<Card>
				<h2 class="sec">Gefahrenzone</h2>
				<Button variant="danger" fullWidth onclick={removeMember}>Mitglied löschen</Button>
			</Card>
		{/if}
	</main>
</div>

<style>
	.form {
		display: flex;
		flex-direction: column;
		gap: var(--space-5);
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
	.photo {
		display: flex;
		align-items: center;
		gap: var(--space-4);
	}
	.photo__actions {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}
	.filebtn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-height: 44px;
		padding: 0 var(--space-4);
		border: 1px solid var(--lions-blue, #1e4fa3);
		border-radius: var(--radius-sm, 8px);
		color: var(--lions-blue, #1e4fa3);
		font-size: var(--text-base);
		font-weight: 600;
		cursor: pointer;
	}
	.filebtn input {
		display: none;
	}
	.offices {
		margin: 0 0 var(--space-2);
		padding-left: var(--space-4);
		font-size: var(--text-base);
		color: var(--text-strong);
	}
	.offices li {
		padding: 2px 0;
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
