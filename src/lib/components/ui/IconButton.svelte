<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';

	type Props = {
		/** Pflicht-Label für Screenreader (aria-label + title). */
		label: string;
		size?: 'sm' | 'md' | 'lg';
		bordered?: boolean;
		tone?: 'default' | 'primary';
		icon: Snippet;
	} & HTMLButtonAttributes;

	let {
		label,
		size = 'md',
		bordered = false,
		tone = 'default',
		icon,
		class: extra = '',
		...rest
	}: Props = $props();

	let cls = $derived(
		[
			'lc-iconbtn',
			`lc-iconbtn--${size}`,
			bordered ? 'lc-iconbtn--bordered' : '',
			tone === 'primary' ? 'lc-iconbtn--primary' : '',
			extra
		]
			.filter(Boolean)
			.join(' ')
	);
</script>

<button type="button" class={cls} aria-label={label} title={label} {...rest}>
	{@render icon()}
</button>
