<script lang="ts">
	import { COMMON_IMAGES } from '../../helpers/images';
	import { Features, features } from '../../services/features.svelte';
	import { microbitService } from '../../services/microbit.svelte';
	import { LogType, type FriendLogs, type LogEntry } from '../../services/friendly_log.svelte';
	import CodeMarquee from './CodeMarquee.svelte';
	import ImageMatrixRenderer from './ImageMatrixRenderer.svelte';

	interface Props {
		entry: LogEntry;
	}

	const { entry }: Props = $props();
	const entryId = $props.id();
	const showTranslator = $derived(features.isActive(Features.Translator));

	function getDeviceImage(name: string) {
		if (name === 'ALL') {
			return COMMON_IMAGES.FULL;
		}

		const device = microbitService.knownMicrobits.find((mb) => mb.name === name);
		return device?.image ?? COMMON_IMAGES.QUESTION_MARK;
	}
</script>

<code>
	{#if entry.type === LogType.Device}
		{entry.message[0]} joined
	{:else if entry.type === LogType.Message}
		{@const [senderName, recipientName, message] = entry.message as FriendLogs[LogType.Message]}
		{@const messageAsString = message.map((row) => row.join('')).join(':')}

		<label
			role={showTranslator ? 'button' : 'presentation'}
			class="no-style image-string"
			for={`translator-${entryId}`}
		>
			[{senderName}] ---&#8203;&gt; [{recipientName}] ---
			{messageAsString}
			<input
				class="translator-toggle"
				type="checkbox"
				disabled={!showTranslator}
				name="translator-toggle"
				id="translator-{entryId}"
			/>
		</label>

		<div class="translated" id="translator-{entryId}">
			<ImageMatrixRenderer matrix={getDeviceImage(senderName)} class="sender" />
			<CodeMarquee />
			<ImageMatrixRenderer matrix={getDeviceImage(recipientName)} class="recipient" />
			<ImageMatrixRenderer matrix={message} class="message" />
		</div>
	{/if}
</code>

<style>
	.image-string {
		&:not(:has([disabled])) {
			text-decoration: underline;
		}

		&:disabled {
			cursor: unset;
		}

		&:has(:focus-visible) {
			outline-style: solid;
			outline-width: 2px;
		}
	}

	/* Only show translation if the toggle is turned on, and the translator isnt disabled */
	code:has(.translator-toggle:checked):not(:has(.translator-toggle[disabled])) {
		position: relative;
		margin-bottom: 4px;

		&:before {
			content: '';
			position: absolute;
			top: 0;
			bottom: 0;
			left: -6px;
			width: 1px;
			background-color: var(--muted-grey);
		}
		.translated {
			display: flex;
		}
	}

	.translator-toggle {
		position: fixed;
		top: -100px;

		clip: rect(0, 0, 0, 0);
	}

	.translated {
		align-items: center;
		/* padding: 8px; */
		overflow: hidden;
		width: calc(55ch + 4px);
		max-width: 100%;
		margin-top: 2px;
		margin-left: -4px;
		padding: 8px 4px;
		display: none;
		font-family: var(--mono);
		font-size: 16px;
		position: relative;
		height: 5rem;
		padding-right: 15ch;

		background-color: var(--bg);

		:global(.image-matrix) {
			max-width: 68px;
			position: absolute;
			z-index: 1;

			&.sender {
				left: 4px;
			}

			&.recipient {
				left: calc(13ch + 4px);
			}

			&.message {
				left: calc(37ch + 2px);
			}
		}
	}
</style>
