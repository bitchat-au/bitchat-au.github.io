<script lang="ts">
    import { getMBImage } from "../../helpers/images";
    import { Features, features } from "../../services/features.svelte";
    import {
        LogType,
        type FriendLogs,
        type LogEntry,
    } from "../../services/friendly_log.svelte";
    import CodeMarquee from "./CodeMarquee.svelte";
    import ImageMatrixRenderer from "./ImageMatrixRenderer.svelte";

    interface Props {
        entry: LogEntry;
    }

    const { entry }: Props = $props();
    const entryId = $props.id();
    const showTranslator = $derived(features.isActive(Features.Translator));
</script>

<code>
    {#if entry.type === LogType.Device}
        {entry.message[0]} joined
    {:else if entry.type === LogType.Message}
        {@const [senderName, recipientName, message, encrypted] =
            entry.message as FriendLogs[LogType.Message]}
        {@const messageAsString = message.map((row) => row.join("")).join(":")}

        <button
            role={showTranslator ? "button" : "presentation"}
            class="no-style image-string"
            disabled={!showTranslator}
            popovertarget="translator-{entryId}"
        >
            [{senderName}] ---&#8203;&gt; [{recipientName}] ---
            {messageAsString}
            {#if encrypted}🔑{/if}
        </button>

        <div popover="auto" class="translated-image" id="translator-{entryId}">
            <ImageMatrixRenderer matrix={getMBImage(senderName)} />
            <CodeMarquee />
            <ImageMatrixRenderer matrix={message} />
            <CodeMarquee />
            <ImageMatrixRenderer matrix={getMBImage(recipientName)} />
        </div>
    {/if}
</code>

<style>
    code {
        anchor-scope: all;
    }

    .image-string {
        anchor-name: --image-string;

        &:not([disabled]) {
            text-decoration: underline;
        }

        &:disabled {
            cursor: unset;
        }
    }

    .translated-image {
        align-items: center;
        gap: 0.5rem;
        padding: 8px;
        overflow: hidden;
        width: 400px;

        position: absolute;
        position-anchor: --image-string;
        position-area: bottom center;

        background-color: var(--bg);
        border: 1px solid var(--muted-grey);

        &:popover-open {
            display: flex;
        }

        :global(.image-matrix) {
            max-width: 60px;
        }
    }
</style>
