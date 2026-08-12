<script lang="ts">
	import { scope } from '@i18n';
	import { flashMicrobitWithConfig } from '../../helpers/flasher.svelte';
	import MicrobitPlugGraphic from './MicrobitPlugGraphic.svelte';
	import { DeviceError } from '@microbit/microbit-connection';
	import { alert } from '../../helpers/popup';

	const scopedT = scope('flasher');

	interface Props {
		source: 'dummy' | 'master';
		skipRemoveStep?: boolean;
		radioChannel: number;
		isSecond?: boolean;
		onFlashComplete?: () => void;
	}

	const { source, radioChannel, onFlashComplete, skipRemoveStep, isSecond }: Props = $props();

	type Steps = 'plug-in' | 'flashing' | 'remove' | 'done';
	let step = $state<Steps>('plug-in');
	let flashProgress: number | undefined = $state(0);
	const color = $derived(source === 'master' ? 'yellow' : 'blue');

	const plugInDescription = $derived(
		source === 'master' ? scopedT('serverDescription') : scopedT('clientDescription')
	);

	async function flashMicrobit() {
		try {
			await flashMicrobitWithConfig(source, radioChannel, (stage, progress) => {
				step = 'flashing';
				flashProgress = progress;
			});

			if (skipRemoveStep) {
				step = 'done';
				onFlashComplete?.();
			} else {
				step = 'remove';
			}
		} catch (error) {
			if (error instanceof DeviceError && error.code === 'no-device-selected') {
				step = 'plug-in';
				alert(scopedT('noDevicesSelected'), scopedT('noDevicesSelectedDescription'));
			} else {
				throw error;
			}
		}
	}

	$effect(() => {
		const onUSBDisconnect = () => {
			if (step === 'remove') {
				step = 'plug-in';
				onFlashComplete?.();
			}
		};

		const onUSBConnect = () => {
			if (step === 'plug-in') {
				// // Attempt to automatically start flashing when a device is connected
				// flashMicrobit();
			}
		};

		navigator.usb?.addEventListener('connect', onUSBConnect);
		navigator.usb?.addEventListener('disconnect', onUSBDisconnect);
		return () => {
			navigator.usb?.removeEventListener('connect', onUSBConnect);
			navigator.usb?.removeEventListener('disconnect', onUSBDisconnect);
		};
	});
</script>

{#if step === 'plug-in'}
	<h2 class="m-0">{scopedT(isSecond ? 'pluginNextMicrobit' : 'pluginMicrobit')}</h2>
	<p class="description">{plugInDescription}</p>
	<MicrobitPlugGraphic {color} state="plug-in" />
	<button class="large" onclick={flashMicrobit}
		>{scopedT(isSecond ? 'programNext' : 'program')}</button
	>
{:else if step === 'flashing'}
	<h2 class="m-0">{scopedT('programmingState')}</h2>
	<p class="description">{scopedT('programmingStateDescription')}</p>
	<MicrobitPlugGraphic {color} state="flashing" />
	<!-- Always reserve space for the progress bar, then show and hide it using css -->
	<div class="progress-container" aria-hidden={!flashProgress}>
		<progress class:active={flashProgress} value={flashProgress} max="1">
			{Math.round((flashProgress || 0) * 100)}%
		</progress>
	</div>
{:else if step === 'remove'}
	<h2 class="m-0">{scopedT('removeMicrobit')}</h2>
	<p class="description">{scopedT('removeMicrobitDescription')}</p>
	<MicrobitPlugGraphic {color} state="remove" />
	<!-- Always reserve space for the progress bar, then show and hide it using css -->
	<div class="progress-container" aria-hidden={!flashProgress}>
		<progress class:active={flashProgress} value={flashProgress} max="1">
			{Math.round((flashProgress || 0) * 100)}%
		</progress>
	</div>
{/if}

<style>
	.progress-container {
		height: 39px; /* Same height as a button to avoid layout shift */
		width: min(275px, 95%);
		
		progress {
			accent-color: var(--accent);
			opacity: 0;
			width: 100%;
	
			&.active {
				opacity: 1;
			}
		}
	}

	.description {
		text-align: center;
		min-height: 2lh;
	}
</style>
