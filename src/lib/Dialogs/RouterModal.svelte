<script lang="ts">
	import type { DialogProps } from '../../services/dialog_manager.svelte';
	import { type ImageMatrix } from '../../helpers/images';
	import Dialog from '../Components/Dialog.svelte';
	import Icon from '../Components/Icon.svelte';
	import ImageMatrixRenderer from '../Components/ImageMatrixRenderer.svelte';
	import { microbitService } from '../../services/microbit.svelte';
	import CodeMarquee from '../Components/CodeMarquee.svelte';
	import { scope, t } from '@i18n';

	const scopedT = scope('dialogs.routerModal');

	type Props = DialogProps<
		{ sender: string; requestedReceiver: string; message: ImageMatrix },
		{ newReceiver: string }
	>;

	const { data, onClose, onResult }: Props = $props();

	const sender = microbitService.knownMicrobits.find((mb) => mb.name === data.sender);
	const requestedReceiver = microbitService.knownMicrobits.find(
		(mb) => mb.name === data.requestedReceiver
	);
	const receivers = microbitService.knownMicrobits.filter((mb) => mb.name !== data.sender);

	let selectedReceiver: string | null = $state(null);
	let receiverName = $derived(
		data.requestedReceiver === 'ALL' ? t('allMicrobits') : data.requestedReceiver
	);
</script>

<Dialog open {onClose} ariaLabel={scopedT('dialogAriaLabel')}>
	<h2><Icon name="sitemap" /> <span>{scopedT('title')}</span></h2>

	<div class="message-preview">
		<ImageMatrixRenderer matrix={sender?.image} class="sender" />
		<CodeMarquee />
		<ImageMatrixRenderer matrix={data.message} class="message" />
		<CodeMarquee />
		<ImageMatrixRenderer matrix={requestedReceiver?.image} class="receiver" />
	</div>

	<div class="text">
		<p>
			<span class="highlight">{data.sender}</span>
			{scopedT('wantsToSend')}
			<span class="highlight">{receiverName}</span>
		</p>
		<p>{scopedT('chooseReceipient')}</p>
	</div>

	<div class="receivers">
		{#each receivers as receiver (receiver.name)}
			<label class="hide-input" for={receiver.name}>
				<input
					type="radio"
					value={receiver.name}
					bind:group={selectedReceiver}
					id={receiver.name}
					name="receiver"
				/>
				<ImageMatrixRenderer matrix={receiver.image} class="candidate" />
				{receiver.name}
			</label>
		{/each}
	</div>

	<footer>
		<button class="transparent" onclick={onClose}>{scopedT('deleteMessage')}</button>
		<button
			onclick={() => onResult({ newReceiver: selectedReceiver! })}
			disabled={selectedReceiver === null}>{scopedT('sendMessage')}</button
		>
	</footer>
</Dialog>

<style>
	.highlight {
		/* color: var(--accent); */
		font-family: var(--sans-display);
		/* text-decoration: underline;
        text-decoration-style: wavy; */
		text-transform: uppercase;
	}

	h2 {
		display: flex;
		align-items: center;
		gap: 0.5rem;

		span {
			height: 18px; /* Jank because the font outline it larger than the actual text, and causes it to not line up */
			display: inline-block;
		}
	}

	footer {
		display: flex;
		justify-content: flex-end;
		gap: 1rem;
		margin-top: 1rem;
	}

	.message-preview {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 1rem;
		margin-block: 1rem;
	}

	.text {
		margin-block: 1.75rem;
		display: flex;
		justify-content: center;
		text-align: center;
		flex-direction: column;
	}

	.receivers {
		display: flex;
		justify-content: center;
		margin-block: 1rem;

		label {
			display: flex;
			gap: 0.25rem;
			padding: 0.75rem;
			justify-content: center;
			align-items: center;
			flex-direction: column;
			font-family: var(--sans-display);
			color: var(--white);
			border: 1px solid transparent;
			text-transform: uppercase;
			font-size: 0.8rem;

			&:hover {
				border: 1px solid var(--muted-grey);
			}

			&:has(input:checked) {
				border: 1px solid var(--accent);
			}

			:global(.image-matrix.candidate) {
				max-width: 70px;
			}
		}
	}

	:global(.image-matrix) {
		&.sender,
		&.receiver {
			max-width: 60px;
		}

		&.message {
			max-width: 50px;
		}
	}
</style>
