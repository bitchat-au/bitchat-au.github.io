<script lang="ts">
	import { t } from '@i18n';
	import { microbitService } from '../../services/microbit.svelte';
	import ImageMatrixRenderer from './ImageMatrixRenderer.svelte';

	const devices = microbitService.knownMicrobits;
</script>

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
</style>
