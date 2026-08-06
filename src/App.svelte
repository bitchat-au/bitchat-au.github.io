<script>
	import DialogRenderer from './lib/Components/DialogRenderer.svelte';
	import ConnectedLayout from './lib/Layouts/ConnectedLayout.svelte';
	import Default from './lib/Layouts/BaseLayout.svelte';
	import NoConnection from './lib/Pages/NoConnection.svelte';
	import { microbitService } from './services/microbit.svelte';
	import { Features, features } from './services/features.svelte';

	$effect(() => {
		document.body.dataset.hacker = features.isActive(Features.Hacker) ? 'true' : 'false';
	})
</script>

<Default>
	{#if microbitService.connected}
		<ConnectedLayout />
	{:else}
		<NoConnection />
	{/if}
</Default>

<DialogRenderer />
