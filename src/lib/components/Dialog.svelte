<script lang="ts">
    import type { Snippet } from "svelte";
    import Icon from "./Icon.svelte";
    import { t } from "@i18n";

    interface Props {
        children?: Snippet;
        open: boolean;
        onClose?: () => void;
        ariaLabel: string;
    }

    const { children, open, onClose, ariaLabel }: Props = $props();

    let dialog: HTMLDialogElement;

    $effect(() => {
        if (open) {
            dialog.showModal();
        } else {
            dialog.close();
        }
    });
</script>

<dialog
    bind:this={dialog}
    onclose={onClose}
    aria-label={ariaLabel}
    tabindex="-1"
>
    <button class="no-style close" onclick={onClose} aria-label={t("dialogs.close")} autofocus>
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
