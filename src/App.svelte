<script>
	import DialogRenderer from './lib/Components/DialogRenderer.svelte';
	import ChatLayout from './lib/Layouts/ChatLayout.svelte';
	import Default from './lib/Layouts/BaseLayout.svelte';
	import { Features, features } from './services/features.svelte';

	const route = decodeURI(window.location.pathname.replace(/\/$/, ''));

	const page = $derived.by(() => {
		switch (route) {
			case '/teacher':
			case '/lærer':
			case '/laerer':
				return 'teacher';
			case '/flash':
				return 'flash';
			default:
				return 'chat';
		}
	})

	$effect(() => {
		document.body.dataset.hacker = features.isActive(Features.Hacker) ? 'true' : 'false';
	});
</script>

<Default>
	{#if page === 'teacher'}
		{#await import('./lib/Pages/TeacherCheatSheet.svelte') then { default: TeacherCheatSheet }}
			<TeacherCheatSheet />
		{/await}
	{:else if page === 'flash'}
		{#await import('./lib/Pages/FlashPage.svelte') then { default: FlashPage }}
			<FlashPage />
		{/await}
	{:else}
		<ChatLayout />
	{/if}
</Default>

<DialogRenderer />
