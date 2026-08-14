<script lang="ts">
	import type { DialogProps } from '../../services/dialog_manager.svelte';
	import Dialog from '../Components/Dialog.svelte';
	import { t } from '@i18n';

	type Props = DialogProps<
		{ title: string, text: string, showCancelButton?: boolean, cancelText?: string, confirmText?: string },
		boolean
	>;

	const { data, onClose, onResult }: Props = $props();

	const showCancelButton = $derived(data.showCancelButton ?? true);
	const cancelText = $derived(data.cancelText ?? t('dialogs.genericConfirmation.cancel'));
	const confirmText = $derived(data.confirmText ?? t('dialogs.genericConfirmation.confirm'));
</script>

<Dialog open {onClose} ariaLabel={data.title} class="generic-confirmation">
	<header>
		<h1>{data.title}</h1>
	</header>
	<p>{data.text}</p>
	<footer class="buttons buttons-right">
		{#if showCancelButton}
			<button class="transparent" onclick={onClose}>{cancelText}</button>
		{/if}
		<button onclick={() => onResult(true)}>{confirmText}</button>
	</footer>
</Dialog>

<style>
	footer {
		margin-top: 1rem;
	}

	:global(.generic-confirmation) {
		max-width: 800px;
	}
</style>
