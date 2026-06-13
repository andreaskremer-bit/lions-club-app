<script lang="ts">
	import '$lib/styles/fonts'; // self-hosted Schriften (DSGVO: kein Google-Fonts-CDN)
	import '$lib/styles/app.css'; // Design-Tokens "Lions 2.0"
	import { invalidate } from '$app/navigation';
	import { onMount } from 'svelte';

	let { data, children } = $props();
	let supabase = $derived(data.supabase);
	let session = $derived(data.session);

	// Auth-Statusänderungen (Login/Logout/Token-Refresh) spiegeln und Daten neu laden.
	onMount(() => {
		const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
			if (newSession?.expires_at !== session?.expires_at) {
				invalidate('supabase:auth');
			}
		});
		return () => sub.subscription.unsubscribe();
	});
</script>

{@render children()}
