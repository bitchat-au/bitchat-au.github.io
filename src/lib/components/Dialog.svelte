<script lang="ts">
	import type { Snippet } from 'svelte';
	import Icon from './Icon.svelte';
	import { t } from '@i18n';
	import { closeNearestDialog } from '../../helpers/close_dialog';

	interface Props {
		children?: Snippet;
		open: boolean;
		ariaLabel: string;
		class?: string;
		onClose?: () => void;
		id?: string;
	}

	let {
		children,
		open = $bindable(false),
		ariaLabel,
		class: dialogClass,
		onClose,
		id
	}: Props = $props();

	let dialog: HTMLDialogElement;

	$effect(() => {
		if (open) {
			dialog.showModal();
		} else {
			dialog.close();
		}
	});

	function handleDialogClose() {
		open = false;
		onClose?.();
	}
</script>

<dialog
	bind:this={dialog}
	onclose={handleDialogClose}
	aria-label={ariaLabel}
	tabindex="-1"
	class={dialogClass}
	{id}
>
	<button
		class="no-style close"
		use:closeNearestDialog
		aria-label={t('dialogs.close')}
		autofocus
	>
		<Icon name="times" />
	</button>
	{@render children?.()}
</dialog>

<style>
	dialog {
		position: relative;
	}

	.close {
		position: absolute;
		top: 0;
		right: 0;
		padding: 1rem;
		display: flex;
	}
</style>
