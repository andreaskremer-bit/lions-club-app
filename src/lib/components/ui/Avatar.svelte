<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';

	type Props = {
		name?: string;
		src?: string | null;
		size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
		tone?: 'gold' | 'blue' | 'cream';
	} & HTMLAttributes<HTMLSpanElement>;

	let { name = '', src = null, size = 'md', tone = 'gold', class: extra = '', ...rest }: Props =
		$props();

	let initials = $derived(
		name
			.trim()
			.split(/\s+/)
			.slice(0, 2)
			.map((w) => w[0] || '')
			.join('')
			.toUpperCase()
	);

	let cls = $derived(
		['lc-avatar', `lc-avatar--${size}`, tone !== 'gold' ? `lc-avatar--${tone}` : '', extra]
			.filter(Boolean)
			.join(' ')
	);
</script>

<span class={cls} aria-label={name || undefined} {...rest}>
	{#if src}
		<img {src} alt={name} />
	{:else}
		{initials}
	{/if}
</span>
