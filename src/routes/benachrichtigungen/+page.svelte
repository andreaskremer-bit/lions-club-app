<script lang="ts">
	import { onMount, untrack } from 'svelte';
	import { goto, invalidateAll } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { env } from '$env/dynamic/public';
	import { AppBar, IconButton, Button, SegmentedControl } from '$lib/components/ui';
	import { pushSupported, subscriptionToRow, urlBase64ToUint8Array } from '$lib/push';
	import { ChevronLeft } from '@lucide/svelte';
	import type { NotificationChannel } from './+page';

	let { data } = $props();
	let supabase = $derived(data.supabase);

	// --- Versandkanäle (P4) -----------------------------------------------------
	let channel = $state<NotificationChannel>(untrack(() => data.channel));
	let channelBusy = $state(false);
	let channelError = $state<string | null>(null);
	const channelOptions = [
		{ value: 'push', label: 'Nur Push' },
		{ value: 'email', label: 'Nur E-Mail' },
		{ value: 'both', label: 'Beide' }
	];

	async function saveChannel(value: string) {
		if (!data.memberId || channelBusy) return;
		const prev = channel;
		channel = value as NotificationChannel;
		channelBusy = true;
		channelError = null;
		const { error } = await supabase
			.from('member')
			.update({ notification_channel: channel })
			.eq('id', data.memberId);
		channelBusy = false;
		if (error) {
			channel = prev; // bei Fehler zurücksetzen
			channelError = 'Speichern fehlgeschlagen. Bitte erneut versuchen.';
		}
	}

	// VAPID-Public-Key zur Laufzeit (Netlify-Env). Dynamic statt static, damit der
	// Build nicht bricht, wenn die Variable (noch) nicht gesetzt ist.
	const vapidKey = env.PUBLIC_VAPID_KEY ?? '';

	let unreadCount = $derived(data.notifications.filter((n) => !n.read_at).length);
	let busy = $state(false);

	// --- Push-Abo (Web-Push) ---------------------------------------------------
	// Zustand: 'unsupported' | 'unconfigured' | 'denied' | 'on' | 'off' | 'loading'
	let pushState = $state<'loading' | 'unsupported' | 'unconfigured' | 'denied' | 'on' | 'off'>(
		'loading'
	);
	let pushBusy = $state(false);
	let pushError = $state<string | null>(null);

	onMount(async () => {
		if (!pushSupported()) {
			pushState = 'unsupported';
			return;
		}
		if (!vapidKey) {
			pushState = 'unconfigured';
			return;
		}
		if (Notification.permission === 'denied') {
			pushState = 'denied';
			return;
		}
		// getRegistration() löst sofort auf (undefined, wenn noch kein SW registriert) —
		// im Gegensatz zu serviceWorker.ready, das bis zum aktiven SW blockieren kann.
		try {
			const reg = await navigator.serviceWorker.getRegistration();
			const sub = reg ? await reg.pushManager.getSubscription() : null;
			pushState = sub ? 'on' : 'off';
		} catch {
			pushState = 'off';
		}
	});

	async function enablePush() {
		if (pushBusy) return;
		pushBusy = true;
		pushError = null;
		try {
			const permission = await Notification.requestPermission();
			if (permission !== 'granted') {
				pushState = permission === 'denied' ? 'denied' : 'off';
				return;
			}
			const reg = await navigator.serviceWorker.ready;
			const sub = await reg.pushManager.subscribe({
				userVisibleOnly: true,
				applicationServerKey: urlBase64ToUint8Array(vapidKey)
			});
			const { error } = await supabase
				.from('push_subscription')
				.upsert(
					{ member_id: data.memberId, ...subscriptionToRow(sub) },
					{ onConflict: 'endpoint' }
				);
			if (error) throw error;
			pushState = 'on';
		} catch (e) {
			pushError = 'Aktivierung fehlgeschlagen. Bitte erneut versuchen.';
			console.error('Push-Abo fehlgeschlagen:', e);
		} finally {
			pushBusy = false;
		}
	}

	async function disablePush() {
		if (pushBusy) return;
		pushBusy = true;
		pushError = null;
		try {
			const reg = await navigator.serviceWorker.ready;
			const sub = await reg.pushManager.getSubscription();
			if (sub) {
				await supabase.from('push_subscription').delete().eq('endpoint', sub.endpoint);
				await sub.unsubscribe();
			}
			pushState = 'off';
		} catch (e) {
			pushError = 'Deaktivierung fehlgeschlagen. Bitte erneut versuchen.';
			console.error('Push-Abmeldung fehlgeschlagen:', e);
		} finally {
			pushBusy = false;
		}
	}

	const fmt = new Intl.DateTimeFormat('de-DE', {
		day: '2-digit',
		month: 'short',
		hour: '2-digit',
		minute: '2-digit'
	});

	async function markAllRead() {
		if (busy || unreadCount === 0) return;
		busy = true;
		await supabase
			.from('notification')
			.update({ read_at: new Date().toISOString() })
			.is('read_at', null);
		busy = false;
		await invalidateAll();
	}

	function open(n: (typeof data.notifications)[number]) {
		if (n.event_id) goto(resolve('/termine/[id]', { id: n.event_id }));
		else if (n.document_id) goto(resolve('/dokumente'));
		else if (n.news_post_id) goto(resolve('/news'));
	}

	// --- Test-Trigger (nur manage_members) -------------------------------------
	let canTrigger = $derived((data.permissions ?? []).includes('manage_members'));
	let triggerBusy = $state(false);
	let triggerMsg = $state<string | null>(null);

	async function runReminders(send: boolean) {
		if (triggerBusy) return;
		triggerBusy = true;
		triggerMsg = null;
		try {
			const res = await fetch('/api/admin/reminders/run', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ send })
			});
			if (!res.ok) throw new Error(await res.text());
			triggerMsg = send ? 'Reminder erzeugt und Versand angestoßen.' : 'Fällige Reminder erzeugt.';
			await invalidateAll();
		} catch (e) {
			triggerMsg = 'Fehlgeschlagen: ' + (e as Error).message;
		} finally {
			triggerBusy = false;
		}
	}
</script>

<div class="shell">
	<AppBar title="Benachrichtigungen" eyebrow="Aktuell" bordered>
		{#snippet leading()}
			<IconButton label="Zurück" onclick={() => goto(resolve('/'))}>
				{#snippet icon()}<ChevronLeft />{/snippet}
			</IconButton>
		{/snippet}
	</AppBar>

	<main class="shell__body">
		<section class="push">
			<div class="push__head">
				<span class="push__title">Push-Benachrichtigungen</span>
				{#if pushState === 'on'}
					<span class="push__status push__status--on">aktiv</span>
				{:else if pushState === 'off'}
					<span class="push__status">inaktiv</span>
				{/if}
			</div>

			{#if pushState === 'loading'}
				<p class="push__hint">Wird geprüft …</p>
			{:else if pushState === 'unsupported'}
				<p class="push__hint">
					Dieses Gerät unterstützt keine Push-Benachrichtigungen. Auf dem iPhone funktioniert Push
					nur, wenn die App über „Zum Home-Bildschirm" installiert ist (ab iOS 16.4).
				</p>
			{:else if pushState === 'unconfigured'}
				<p class="push__hint">
					Push ist serverseitig noch nicht konfiguriert (VAPID-Schlüssel fehlt). In-App-Erinnerungen
					funktionieren trotzdem.
				</p>
			{:else if pushState === 'denied'}
				<p class="push__hint">
					Benachrichtigungen sind in den Browser-/Geräteeinstellungen blockiert. Bitte dort für
					diese App erlauben und die Seite neu laden.
				</p>
			{:else if pushState === 'on'}
				<p class="push__hint">Du erhältst Erinnerungen auch als Push auf dieses Gerät.</p>
				<Button variant="ghost" disabled={pushBusy} onclick={disablePush}>Deaktivieren</Button>
			{:else}
				<p class="push__hint">
					Erinnerungen zusätzlich als Push auf dieses Gerät erhalten – auch wenn die App geschlossen
					ist.
				</p>
				<Button disabled={pushBusy} onclick={enablePush}>Push aktivieren</Button>
			{/if}

			{#if pushError}<p class="push__error">{pushError}</p>{/if}
		</section>

		<section class="push">
			<span class="push__title">Versandkanäle</span>
			<p class="push__hint">
				In-App-Hinweise bekommst du immer. Lege fest, wie du Erinnerungen zusätzlich erhalten
				möchtest: „Beide“ schickt Push und nur dann E-Mail, wenn kein Gerät erreichbar ist.
			</p>
			<SegmentedControl options={channelOptions} value={channel} onchange={saveChannel} />
			{#if channelError}<p class="push__error">{channelError}</p>{/if}
		</section>

		{#if canTrigger}
			<section class="trigger">
				<span class="trigger__label">Test (nur Vorstand): Reminder-Engine manuell starten.</span>
				<div class="trigger__actions">
					<Button variant="ghost" disabled={triggerBusy} onclick={() => runReminders(false)}>
						Reminder erzeugen
					</Button>
					<Button variant="ghost" disabled={triggerBusy} onclick={() => runReminders(true)}>
						+ Versand anstoßen
					</Button>
				</div>
				{#if triggerMsg}<span class="trigger__msg">{triggerMsg}</span>{/if}
			</section>
		{/if}

		{#if unreadCount > 0}
			<div class="bar">
				<span class="bar__label">{unreadCount} ungelesen</span>
				<Button variant="ghost" disabled={busy} onclick={markAllRead}>Alle als gelesen</Button>
			</div>
		{/if}

		<div class="list">
			{#each data.notifications as n (n.id)}
				<button
					class={[
						'note',
						n.read_at ? '' : 'note--unread',
						n.event_id || n.document_id || n.news_post_id ? 'note--link' : ''
					]
						.filter(Boolean)
						.join(' ')}
					onclick={() => open(n)}
					disabled={!n.event_id && !n.document_id && !n.news_post_id}
				>
					{#if !n.read_at}<span class="note__dot"></span>{/if}
					<span class="note__main">
						<span class="note__title">{n.title}</span>
						{#if n.body}<span class="note__body">{n.body}</span>{/if}
						<span class="note__time">{fmt.format(new Date(n.created_at))}</span>
					</span>
				</button>
			{:else}
				<p class="empty">Keine Benachrichtigungen.</p>
			{/each}
		</div>
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
		gap: var(--space-2);
		padding: var(--screen-pad);
	}
	.push {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
		padding: var(--space-3);
		border: 1px solid var(--hairline, rgba(0, 0, 0, 0.08));
		border-radius: var(--radius-md, 12px);
		align-items: flex-start;
	}
	.push__head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		width: 100%;
	}
	.push__title {
		font-size: var(--text-base);
		font-weight: 700;
		color: var(--text-strong);
	}
	.push__status {
		font-size: var(--text-xs);
		color: var(--text-secondary);
	}
	.push__status--on {
		color: var(--sage, #4f7a5b);
		font-weight: 700;
	}
	.push__hint {
		font-size: var(--text-sm);
		color: var(--text-body);
		margin: 0;
	}
	.push__error {
		font-size: var(--text-sm);
		color: var(--clay, #b4502f);
		margin: 0;
	}
	.trigger {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
		padding: var(--space-3);
		border: 1px dashed var(--hairline, rgba(0, 0, 0, 0.16));
		border-radius: var(--radius-md, 12px);
	}
	.trigger__label {
		font-size: var(--text-sm);
		color: var(--text-secondary);
	}
	.trigger__actions {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2);
	}
	.trigger__msg {
		font-size: var(--text-sm);
		color: var(--text-body);
	}
	.bar {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}
	.bar__label {
		font-size: var(--text-sm);
		color: var(--text-secondary);
	}
	.list {
		display: flex;
		flex-direction: column;
	}
	.note {
		display: flex;
		align-items: flex-start;
		gap: var(--space-2);
		width: 100%;
		text-align: left;
		padding: var(--space-3) 0;
		border: none;
		border-bottom: 1px solid var(--hairline, rgba(0, 0, 0, 0.08));
		background: none;
		color: inherit;
		font: inherit;
	}
	.note--link {
		cursor: pointer;
	}
	.note__dot {
		margin-top: 7px;
		width: 8px;
		height: 8px;
		flex: none;
		border-radius: 50%;
		background: var(--lions-blue, #1e4fa3);
	}
	.note--unread .note__title {
		font-weight: 700;
	}
	.note__main {
		display: flex;
		flex-direction: column;
		gap: 2px;
		min-width: 0;
	}
	.note__title {
		font-size: var(--text-base);
		color: var(--text-strong);
	}
	.note__body {
		font-size: var(--text-sm);
		color: var(--text-body);
	}
	.note__time {
		font-size: var(--text-xs);
		color: var(--text-secondary);
	}
	.empty {
		font-size: var(--text-base);
		color: var(--text-secondary);
		text-align: center;
		padding: var(--space-5) 0;
	}
</style>
