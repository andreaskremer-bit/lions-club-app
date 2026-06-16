<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';

	type Props = {
		label?: string;
		/** On-Zustand: blau (primary) oder Sage (present). */
		tone?: 'primary' | 'present';
		checked?: boolean;
	} & HTMLInputAttributes;

	let {
		label,
		tone = 'primary',
		checked = $bindable(false),
		class: extra = '',
		...rest
	}: Props = $props();

	let cls = $derived(
		['lc-switch', tone === 'present' ? 'lc-switch--present' : '', extra].filter(Boolean).join(' ')
	);
</script>

<label class={cls}>
	<input type="checkbox" role="switch" bind:checked {...rest} />
	<span class="lc-switch__track"><span class="lc-switch__thumb"></span></span>
	{#if label}<span class="lc-switch__label">{label}</span>{/if}
</label>
