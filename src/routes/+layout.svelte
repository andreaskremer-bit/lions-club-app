<script lang="ts">
	import '$lib/styles/fonts'; // self-hosted Schriften (DSGVO: kein Google-Fonts-CDN)
	import '$lib/styles/app.css'; // Design-Tokens "Lions 2.0"

	let { children } = $props();
</script>

{@render children()}
