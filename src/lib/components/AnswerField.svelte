<script lang="ts">
	type QuestionType = 'single' | 'multi' | 'text' | 'boolean' | 'number';

	type Props = {
		qtype: QuestionType;
		options?: string[] | null;
		value: unknown;
		disabled?: boolean;
		onsave: (value: unknown) => void;
	};

	let { qtype, options = null, value, disabled = false, onsave }: Props = $props();

	let selected = $derived(Array.isArray(value) ? (value as string[]) : []);

	function toggleMulti(opt: string, checked: boolean) {
		onsave(checked ? [...selected, opt] : selected.filter((x) => x !== opt));
	}
</script>

{#if qtype === 'single'}
	<select
		class="af"
		{disabled}
		value={(value as string) ?? ''}
		onchange={(e) => onsave(e.currentTarget.value || null)}
	>
		<option value="">– bitte wählen –</option>
		{#each options ?? [] as o (o)}<option value={o}>{o}</option>{/each}
	</select>
{:else if qtype === 'multi'}
	<div class="af-multi">
		{#each options ?? [] as o (o)}
			<label class="af-check">
				<input
					type="checkbox"
					{disabled}
					checked={selected.includes(o)}
					onchange={(e) => toggleMulti(o, e.currentTarget.checked)}
				/>
				<span>{o}</span>
			</label>
		{/each}
	</div>
{:else if qtype === 'boolean'}
	<div class="af-bool">
		<button
			type="button"
			class={['af-btn', value === true ? 'af-btn--on' : ''].filter(Boolean).join(' ')}
			{disabled}
			onclick={() => onsave(true)}>Ja</button
		>
		<button
			type="button"
			class={['af-btn', value === false ? 'af-btn--on' : ''].filter(Boolean).join(' ')}
			{disabled}
			onclick={() => onsave(false)}>Nein</button
		>
	</div>
{:else if qtype === 'number'}
	<input
		class="af"
		type="number"
		{disabled}
		value={(value as number) ?? ''}
		onchange={(e) => onsave(e.currentTarget.value === '' ? null : Number(e.currentTarget.value))}
	/>
{:else}
	<input
		class="af"
		type="text"
		{disabled}
		value={(value as string) ?? ''}
		onchange={(e) => onsave(e.currentTarget.value || null)}
	/>
{/if}

<style>
	.af {
		width: 100%;
		font-size: var(--text-base);
		padding: var(--space-2);
		border: 1px solid var(--hairline, rgba(0, 0, 0, 0.2));
		border-radius: var(--radius-sm, 8px);
		background: var(--surface, #fff);
		color: var(--text-strong);
		min-height: 44px;
	}
	.af-multi {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
	}
	.af-check {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		font-size: var(--text-base);
		min-height: 36px;
	}
	.af-check input {
		width: 20px;
		height: 20px;
	}
	.af-bool {
		display: flex;
		gap: var(--space-2);
	}
	.af-btn {
		flex: 1;
		min-height: 44px;
		border: 1px solid var(--lions-blue, #1e4fa3);
		border-radius: var(--radius-sm, 8px);
		background: var(--surface, #fff);
		color: var(--lions-blue, #1e4fa3);
		font-size: var(--text-base);
		font-weight: 600;
		cursor: pointer;
	}
	.af-btn--on {
		background: var(--lions-blue, #1e4fa3);
		color: #fff;
	}
</style>
