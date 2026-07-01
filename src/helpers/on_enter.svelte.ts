import type { Action } from "svelte/action";

export const onEnter: Action<HTMLElement, Function> = (node, fn) => {
    $effect(() => {
        const handleKeydown = (event: KeyboardEvent) => {
            if (event.key === "Enter") {
                fn();
            }
        };

        node.addEventListener("keydown", handleKeydown);

        return () => {
            node.removeEventListener("keydown", handleKeydown);
        };
    });
};