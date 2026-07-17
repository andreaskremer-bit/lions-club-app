<script lang="ts">
	import { goto, invalidateAll } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { AppBar, IconButton, Avatar, Tag, Card, ListRow, Button } from '$lib/components/ui';
	import { ChevronLeft, Phone, Smartphone, Mail, MapPin, Send, Building2 } from '@lucide/svelte';
	import type { MemberStatus } from '../+page';

	let { data } = $props();
	let m = $derived(data.member);

	let inviting = $state(false);
	let inviteMsg = $state('');

	async function einladen() {
		if (inviting) return;
		inviting = true;
		inviteMsg = '';
		const res = await fetch(`/api/mitglieder/${m.id}/einladen`, { method: 'POST' });
		inviting = false;
		if (!res.ok) {
			const body = await res.json().catch(() => ({}));
			inviteMsg = 'Einladen fehlgeschlagen: ' + (body.message ?? res.status);
			return;
		}
		inviteMsg = 'Konto angelegt – Login per E-Mail-Code möglich.';
		await invalidateAll();
	}

	const statusLabel: Record<MemberStatus, string> = {
		aktiv: 'aktiv',
		inaktiv: 'inaktiv',
		ehrenmitglied: 'Ehrenmitglied'
	};
	const statusTone: Record<MemberStatus, 'sage' | 'gold' | 'neutral'> = {
		aktiv: 'sage',
		ehrenmitglied: 'gold',
		inaktiv: 'neutral'
	};

	let fullName = $derived([m.title, m.first_name, m.last_name].filter(Boolean).join(' '));
	let ämter = $derived(
		m.member_amt
			.map((r) => r.amt)
			.filter((a): a is NonNullable<typeof a> => !!a)
			.sort((a, b) => a.sort_order - b.sort_order)
	);
	let address = $derived(
		[m.street, [m.zip, m.city].filter(Boolean).join(' ')].filter(Boolean).join(', ')
	);

	function formatDate(d: string | null): string | null {
		if (!d) return null;
		return new Intl.DateTimeFormat('de-DE', {
			day: '2-digit',
			month: 'long',
			year: 'numeric'
		}).format(new Date(d));
	}

	// Partner-Wunsch „Geburtstag ja, Alter nein": nur Tag + Monat, ohne Jahr.
	function formatDayMonth(d: string | null): string | null {
		if (!d) return null;
		return new Intl.DateTimeFormat('de-DE', { day: '2-digit', month: 'long' }).format(new Date(d));
	}
</script>

<div class="shell">
	<AppBar title="Profil" eyebrow="Mitglied" bordered>
		{#snippet leading()}
			<IconButton label="Zurück" onclick={() => goto(resolve('/mitglieder'))}>
				{#snippet icon()}<ChevronLeft />{/snippet}
			</IconButton>
		{/snippet}
		{#snippet trailing()}
			{#if data.isSelf || data.permissions.includes('edit_member_master')}
				<a class="edit-link" href={resolve('/mitglieder/[id]/bearbeiten', { id: m.id })}
					>Bearbeiten</a
				>
			{/if}
		{/snippet}
	</AppBar>

	<main class="shell__body">
		<header class="head">
			<Avatar name={`${m.first_name} ${m.last_name}`} src={data.photoUrl} size="xl" />
			<h1 class="head__name">{fullName}</h1>
			<div class="head__tags">
				<Tag tone={statusTone[m.status]} dot>{statusLabel[m.status]}</Tag>
				{#each ämter as a (a.label)}
					<Tag tone="blue" outline title={a.label}>{a.abbr ?? a.label}</Tag>
				{/each}
			</div>
		</header>

		<Card>
			<h2 class="sec">Kontakt</h2>
			{#if m.mobile}
				<ListRow href={`tel:${m.mobile}`} title={m.mobile} subtitle="Mobil">
					{#snippet lead()}<Smartphone size={20} />{/snippet}
				</ListRow>
			{/if}
			{#if m.phone}
				<ListRow href={`tel:${m.phone}`} title={m.phone} subtitle="Festnetz">
					{#snippet lead()}<Phone size={20} />{/snippet}
				</ListRow>
			{/if}
			{#if m.phone_office}
				<ListRow href={`tel:${m.phone_office}`} title={m.phone_office} subtitle="Büro">
					{#snippet lead()}<Building2 size={20} />{/snippet}
				</ListRow>
			{/if}
			<ListRow href={`mailto:${m.email}`} title={m.email} subtitle="E-Mail">
				{#snippet lead()}<Mail size={20} />{/snippet}
			</ListRow>
			{#if address}
				<ListRow title={address} subtitle="Adresse" interactive={false}>
					{#snippet lead()}<MapPin size={20} />{/snippet}
				</ListRow>
			{/if}
		</Card>

		<Card>
			<h2 class="sec">Im Club</h2>
			<dl class="facts">
				{#if m.lions_member_no}
					<div>
						<dt>Mitgliedsnummer</dt>
						<dd>{m.lions_member_no}</dd>
					</div>
				{/if}
				{#if formatDate(m.birthday)}
					<div>
						<dt>Geburtstag</dt>
						<dd>{formatDate(m.birthday)}</dd>
					</div>
				{/if}
				{#if formatDate(m.joined_on)}
					<div>
						<dt>Mitglied seit</dt>
						<dd>{formatDate(m.joined_on)}</dd>
					</div>
				{/if}
			</dl>
		</Card>

		{#if data.permissions.includes('manage_members')}
			<Card>
				<h2 class="sec">Zugang</h2>
				{#if m.user_id}
					<p class="muted">Login aktiv.</p>
				{:else}
					<p class="muted">
						Noch kein Login. Lade das Mitglied ein, um den Anmelde-Code per E-Mail zu aktivieren.
					</p>
					<Button variant="secondary" disabled={inviting} onclick={einladen}>
						{#snippet iconLeft()}<Send size={18} />{/snippet}
						{inviting ? 'Einladen …' : 'Einladen'}
					</Button>
				{/if}
				{#if inviteMsg}<p class="muted">{inviteMsg}</p>{/if}
			</Card>
		{/if}

		{#if m.partner_first_name || m.partner_last_name}
			<Card>
				<h2 class="sec">Partner/in</h2>
				<dl class="facts">
					<div>
						<dt>Name</dt>
						<dd>
							{[m.partner_title, m.partner_first_name, m.partner_last_name]
								.filter(Boolean)
								.join(' ')}
						</dd>
					</div>
					{#if m.partner_birthday}
						<div>
							<dt>Geburtstag</dt>
							<dd>
								{m.partner_birthday_show_age
									? formatDate(m.partner_birthday)
									: formatDayMonth(m.partner_birthday)}
							</dd>
						</div>
					{/if}
					{#if m.partner_mobile}
						<div>
							<dt>Mobil</dt>
							<dd><a href={`tel:${m.partner_mobile}`}>{m.partner_mobile}</a></dd>
						</div>
					{/if}
					{#if m.partner_email}
						<div>
							<dt>E-Mail</dt>
							<dd><a href={`mailto:${m.partner_email}`}>{m.partner_email}</a></dd>
						</div>
					{/if}
				</dl>
			</Card>
		{/if}
	</main>
</div>

<style>
	.edit-link {
		font-size: var(--text-base);
		font-weight: 600;
		color: var(--lions-blue, #1e4fa3);
	}
	.head {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-2);
		padding: var(--space-3) 0 var(--space-1);
		text-align: center;
	}
	.head__name {
		font-size: var(--text-xl);
		margin: var(--space-1) 0 0;
	}
	.head__tags {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2);
		justify-content: center;
	}
	.sec {
		font-size: var(--text-sm);
		color: var(--text-secondary);
		text-transform: uppercase;
		letter-spacing: 0.06em;
		margin: 0 0 var(--space-2);
	}
	.muted {
		font-size: var(--text-sm);
		color: var(--text-secondary);
		margin: 0 0 var(--space-2);
	}
	.facts {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
		margin: 0;
	}
	.facts div {
		display: flex;
		justify-content: space-between;
		gap: var(--space-3);
	}
	.facts dt {
		color: var(--text-secondary);
		font-size: var(--text-base);
	}
	.facts dd {
		margin: 0;
		color: var(--text-strong);
		font-size: var(--text-base);
		text-align: right;
	}
</style>
