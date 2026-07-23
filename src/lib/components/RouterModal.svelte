<script lang="ts">
    import type { DialogProps } from "../../services/dialog_manager.svelte";
    import type { ImageMatrix } from "../../helpers/images";
    import Dialog from "./Dialog.svelte";
    import Icon from "./Icon.svelte";

    type Props = DialogProps<
        { sender: string, requestedReceiver: string, message: ImageMatrix },
        { newReceiver: string }
    >

    const { data, onClose, onResult }: Props = $props();
</script>

<Dialog open onClose={onClose}>
    <h2><Icon name="sitemap" /> <span>Router</span></h2>
    <span class="highlight">{data.sender}</span> wants to send a message to <span class="highlight">{data.requestedReceiver}</span>. Do you want to accept it?

    <footer>
        <button class="transparent" onclick={onClose}>Cancel</button>
        <button onclick={() => onResult({ newReceiver: "0" })}>Send</button>
    </footer>
</Dialog>

<style>
    .highlight {
        color: var(--accent);
        text-decoration: underline;
        text-decoration-style: wavy;
    }

    h2 {
        display: flex;
        align-items: center;
        gap: 0.5rem;

        span {
            height: 18px; /* Jank because the font outline it larger than the actual text, and causes it to not line up */
            display: inline-block;
        }
    }

    footer {
        display: flex;
        justify-content: flex-end;
        gap: 1rem;
        margin-top: 1rem;
    }
</style>