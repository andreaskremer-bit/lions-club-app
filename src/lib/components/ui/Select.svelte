<script lang="ts" module>
	/** Option: einfacher String oder {label, value}. */
	export type SelectOption<T extends string = string> = T | { label: string; value: T };
</script>

<script lang="ts" generics="T extends string = string">
	import type { HTMLSelectAttributes } from 'svelte/elements';
	import { ChevronDown } from '@lucide/svelte';

	type Props = {
		label?: string;
		options?: SelectOption<T>[];
		/** Deaktivierte Erst-Option, solange nichts gewählt ist. */
		placeholder?: string;
		id?: string;
		value?: T;
	} & Omit<HTMLSelectAttributes, 'value'>;

	let {
		label,
		options = [],
		placeholder,
		id,
		value = $bindable(),
		class: extra = '',
		...rest
	}: Props = $props();

	let fieldId = $derived(
		id || (label ? `s-${label.replace(/\s+/g, '-').toLowerCase()}` : undefined)
	);
	const optValue = (o: SelectOption<T>) => (typeof o === 'string' ? o : o.value);
	const optLabel = (o: SelectOption<T>) => (typeof o === 'string' ? o : o.label);
</script>

<div class={['lc-field', extra].filter(Boolean).join(' ')}>
	{#if label}<label class="lc-field__label" for={fieldId}>{label}</label>{/if}
	<div class="lc-select-field">
		<select {id} class="lc-select" bind:value {...rest}>
			{#if placeholder}<option value="" disabled>{placeholder}</option>{/if}
			{#each options as o (optValue(o))}<option value={optValue(o)}>{optLabel(o)}</option>{/each}
		</select>
		<span class="lc-select__chev"><ChevronDown /></span>
	</div>
</div>
