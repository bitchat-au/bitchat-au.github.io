<script lang="ts">
	import { t } from '@i18n';
	import { microbitService } from '../../services/microbit.svelte';
	import ImageMatrixRenderer from './ImageMatrixRenderer.svelte';
	import { FriendlyError } from '../../helpers/friendly_error';

	const devices = microbitService.knownMicrobits;

	let error: string | undefined = $state();

	function handleConnect() {
		microbitService.connect().catch((err) => (error = err));
	}
</script>

{#if microbitService.connected}
	<h2>{t('devices.title')}</h2>

	<ul>
		{#each devices as device (device.name)}
			<li>
				<ImageMatrixRenderer matrix={device.image} />
				<span class="name">{device.name}</span>
			</li>
		{/each}
	</ul>

	{#if devices.length === 0}
		<p class="muted no-devices">{t('devices.noDevices')}</p>
	{/if}
{:else}
	<div class="no-connection">
		<span class="title">{t('welcome.noConnection')}</span>
		<button onclick={handleConnect} class="large">{t('welcome.connect')}</button>
		<span class="error">{FriendlyError.getMessage(error)}</span>
	</div>
	<a class="button program-microbits secondary" href="/flash">
		{t('welcome.programMicrobits')}
	</a>
{/if}

<style>
	ul {
		list-style: none;
		padding: 0;
		margin: 0;
	}

	li {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 0;

		border-top: 1px solid var(--stroke);

		&:first-child {
			border-top: none;
		}

		:global(.image-matrix) {
			max-width: 50px;
		}

		.name {
			font-family: var(--sans-display);
			color: var(--white);
			font-size: 0.8rem;
			text-transform: uppercase;
		}
	}

	.no-devices {
		text-align: center;
		margin-top: auto;
		margin-bottom: auto;
	}

	.no-connection {
		display: flex;
		flex-direction: column;
		align-items: stretch;
		gap: 1rem;
		margin-top: auto;
		margin-bottom: auto;
		text-align: center;

		.title {
			font-family: var(--heading);
			font-size: 1.5rem;
		}

		.error {
			color: var(--danger);
		}
	}
</style>
