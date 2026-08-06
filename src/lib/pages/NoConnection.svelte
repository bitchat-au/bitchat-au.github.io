<script>
	import { t } from '@i18n';
	import { microbitService } from '../../services/microbit.svelte';
	import { FriendlyError } from '../../helpers/friendly_error';

	let error = $state();

	function handleConnect() {
		microbitService.connect()
			.catch(err => error = err);
	}
</script>

<main>
	<h1>{t('welcome.noConnection')}</h1>
	<button onclick={handleConnect}>{t('welcome.connect')}</button>
	<span class="error">{FriendlyError.getMessage(error)}</span>
</main>

<style>
	main {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}

	h1 {
		font-size: 2rem;
		margin-bottom: 1rem;
	}

	button {
		padding: 0.5rem 1rem;
		font-size: 1rem;
		cursor: pointer;
	}

	.error {
		margin-top: 1rem;
		color: var(--danger);
	}
</style>
