<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';
	import { Check } from '@lucide/svelte';

	type Props = {
		label?: string;
		description?: string;
		/** Als Radio (rund) statt Checkbox darstellen. */
		radio?: boolean;
		checked?: boolean;
	} & HTMLInputAttributes;

	let {
		label,
		description,
		radio = false,
		checked = $bindable(false),
		class: extra = '',
		...rest
	}: Props = $props();

	let cls = $derived(['lc-check', radio ? 'lc-check--radio' : '', extra].filter(Boolean).join(' '));
</script>

<label class={cls}>
	{#if radio}
		<input type="radio" {checked} {...rest} />
	{:else}
		<input type="checkbox" bind:checked {...rest} />
	{/if}
	<span class="lc-check__box">
		{#if radio}<span class="lc-check__dot"></span>{:else}<Check />{/if}
	</span>
	{#if label || description}
		<span class="lc-check__text">
			{#if label}<span class="lc-check__label">{label}</span>{/if}
			{#if description}<span class="lc-check__desc">{description}</span>{/if}
		</span>
	{/if}
</label>
