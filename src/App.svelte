<script>
	import DialogRenderer from './lib/Components/DialogRenderer.svelte';
	import ChatLayout from './lib/Layouts/ChatLayout.svelte';
	import Default from './lib/Layouts/BaseLayout.svelte';
	import { Features, features } from './services/features.svelte';

	const route = decodeURI(window.location.pathname.replace(/\/$/, ''));
	const isTeacherRoute = route === '/teacher' || route === '/lærer' || route === '/laerer';

	$effect(() => {
		document.body.dataset.hacker = features.isActive(Features.Hacker) ? 'true' : 'false';
	});
</script>

<Default>
	{#if isTeacherRoute}
		{#await import('./lib/Pages/TeacherCheatSheet.svelte') then { default: TeacherCheatSheet }}
			<TeacherCheatSheet />
		{/await}
	{:else}
		<ChatLayout />
	{/if}
</Default>

<DialogRenderer />
