<script lang="ts">
	import { ACCEPTED_FILE_TYPES } from '$lib/documents';

	let {
		file = null,
		accept = ACCEPTED_FILE_TYPES,
		disabled = false,
		placeholder = 'PDF, Word, … bis 20 MB',
		onpick
	}: {
		file?: File | null;
		accept?: string;
		disabled?: boolean;
		placeholder?: string;
		onpick: (f: File | null) => void;
	} = $props();

	function onchange(e: Event) {
		onpick((e.target as HTMLInputElement).files?.[0] ?? null);
	}
</script>

<label class="filepick">
	<input class="filepick__input" type="file" {accept} {disabled} {onchange} />
	<span class="filepick__btn">Datei wählen</span>
	<span class="filepick__name" class:filepick__name--empty={!file}>
		{file ? file.name : placeholder}
	</span>
</label>

<style>
	.filepick {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		min-height: 48px;
		padding: var(--space-2) var(--space-3);
		background: var(--surface-card);
		border: 1px solid var(--border-field);
		border-radius: var(--radius-md);
		cursor: pointer;
		transition:
			border-color var(--dur-fast) var(--ease-standard),
			box-shadow var(--dur-fast) var(--ease-standard);
	}
	.filepick:hover {
		border-color: var(--border-strong);
	}
	.filepick:focus-within {
		border-color: var(--border-focus);
		box-shadow: var(--focus-ring);
	}
	.filepick:has(.filepick__input:disabled) {
		opacity: 0.6;
		cursor: default;
	}
	/* Natives File-Input visuell entfernen, aber fokussierbar lassen. */
	.filepick__input {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0 0 0 0);
		white-space: nowrap;
		border: 0;
	}
	.filepick__btn {
		flex: none;
		display: inline-flex;
		align-items: center;
		height: 36px;
		padding: 0 var(--space-4);
		border-radius: var(--radius-sm);
		background: var(--surface-fill);
		border: 1px solid var(--border-field);
		font-size: var(--text-sm);
		font-weight: 600;
		color: var(--text-strong);
	}
	.filepick__name {
		min-width: 0;
		flex: 1;
		font-size: var(--text-base);
		color: var(--text-body);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.filepick__name--empty {
		color: var(--text-muted);
	}
</style>
