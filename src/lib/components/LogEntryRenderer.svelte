<script lang="ts">
    import { Features, features } from "../../services/features.svelte";
    import {
        LogType,
        type FriendLogs,
        type LogEntry,
    } from "../../services/friendly_log.svelte";
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

        [{senderName}] ---&#8203;&gt; [{recipientName}] ---
        <button
            class="no-style image-string"
            disabled={!showTranslator}
            popovertarget="translator-{entryId}"
        >{messageAsString}</button>
        {#if encrypted}🔑{/if}

        <div popover="auto" class="translated-image" id="translator-{entryId}">
            <ImageMatrixRenderer matrix={message} />
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
        width: 175px;
        height: 175px;
        padding: 8px;
        overflow: hidden;

        position: absolute;
        position-anchor: --image-string;
        position-area: bottom center;

        background-color: var(--bg);
        border: 1px solid var(--muted-grey);
    }
</style>
