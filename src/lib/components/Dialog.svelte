<script lang="ts">
    import type { Snippet } from "svelte";
    import Icon from "./Icon.svelte";

    interface Props {
        children?: Snippet;
        open: boolean;
        onClose?: () => void;
    }

    const { children, open, onClose }: Props = $props();

    let dialog: HTMLDialogElement;

    $effect(() => {
        if (open) {
            dialog.showModal();
        } else {
            dialog.close();
        }
    })
</script>

<dialog bind:this={dialog} onclose={onClose}>
    <button class="no-style close" onclick={onClose}>
        <Icon name="times" />
    </button>
    {@render children?.()}
</dialog>

<style>
    dialog {
        position: relative;
    }

    .close {
        position: absolute;
        top: 0;
        right: 0;
        padding: 1rem;
        display: flex;
    }
</style>