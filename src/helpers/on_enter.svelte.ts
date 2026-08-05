import type { Action } from 'svelte/action';

// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
export const onEnter: Action<HTMLElement, Function> = (node, fn) => {
	$effect(() => {
		const handleKeydown = (event: KeyboardEvent) => {
			if (event.key === 'Enter') {
				fn();
			}
		};

		node.addEventListener('keydown', handleKeydown);

		return () => {
			node.removeEventListener('keydown', handleKeydown);
		};
	});
};
