<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLInputAttributes, HTMLTextareaAttributes } from 'svelte/elements';

	type Props = {
		label?: string;
		hint?: string;
		error?: string;
		required?: boolean;
		multiline?: boolean;
		icon?: Snippet;
		id?: string;
		value?: string;
	} & HTMLInputAttributes &
		HTMLTextareaAttributes;

	let {
		label,
		hint,
		error,
		required = false,
		multiline = false,
		icon,
		id,
		value = $bindable(''),
		class: extra = '',
		...rest
	}: Props = $props();

	let fieldId = $derived(
		id || (label ? `f-${label.replace(/\s+/g, '-').toLowerCase()}` : undefined)
	);
	let inputCls = $derived(
		['lc-input', icon ? 'lc-input--has-icon' : '', error ? 'lc-input--error' : '']
			.filter(Boolean)
			.join(' ')
	);
</script>

<div class={['lc-field', extra].filter(Boolean).join(' ')}>
	{#if label}
		<label class="lc-field__label" for={fieldId}>
			{label}{#if required}<span class="lc-field__req">*</span>{/if}
		</label>
	{/if}
	<div class="lc-input-wrap">
		{#if icon}<span class="lc-input__icon">{@render icon()}</span>{/if}
		{#if multiline}
			<textarea id={fieldId} class={inputCls} aria-invalid={!!error} bind:value {...rest}
			></textarea>
		{:else}
			<input id={fieldId} class={inputCls} aria-invalid={!!error} bind:value {...rest} />
		{/if}
	</div>
	{#if error}
		<p class="lc-field__error">{error}</p>
	{:else if hint}
		<p class="lc-field__hint">{hint}</p>
	{/if}
</div>
