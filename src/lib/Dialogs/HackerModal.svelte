<script lang="ts">
    import type { DialogProps } from "../../services/dialog_manager.svelte";
    import {
        cloneImage,
        COMMON_IMAGES,
        type ImageMatrix,
    } from "../../helpers/images";
    import Dialog from "../Components/Dialog.svelte";
    import Icon from "../Components/Icon.svelte";
    import ImageMatrixRenderer from "../Components/ImageMatrixRenderer.svelte";
    import { scope, t } from "@i18n";
    import InteractiveBitString from "../Components/InteractiveBitString.svelte";

    const scopedT = scope("dialogs.hackerModal");

    type Props = DialogProps<
        { message: ImageMatrix; sender: string; receiver: string },
        { newMessage: ImageMatrix }
    >;

    const { data, onClose, onResult }: Props = $props();

    let modifiedMessage = $state<ImageMatrix>(COMMON_IMAGES.EMPTY);
    let hoverIndex = $state<number | null>(null);
    let receiverName = $derived(data.receiver === "ALL" ? t("allMicrobits") : data.receiver);

    $effect(() => {
        modifiedMessage = cloneImage(data.message);
    });
</script>

<Dialog
    open
    {onClose}
    ariaLabel={scopedT("dialogAriaLabel")}
    class="hacker-modal"
>
    <h2><Icon name="bug" /> <span>{scopedT("title")}</span></h2>

    <p class="description">
        <span class="highlight">{data.sender}</span> {scopedT("wantsToSend")}
        <span class="highlight">{receiverName}</span>. {scopedT("changeMessage")}
    </p>

    <hr>

    <div class="header">
        <InteractiveBitString
            bind:image={modifiedMessage}
            onHover={(index) => (hoverIndex = index)}
        />
    </div>

    <section>
        <ImageMatrixRenderer
            matrix={modifiedMessage}
            class="hacked-image"
            padding={10}
            caption={scopedT("imageRenderAriaLabel")}
            highlightedPixel={hoverIndex !== null
                ? [Math.floor(hoverIndex / 5), hoverIndex % 5]
                : null}
        />
    </section>

    <hr class="large">

    <footer>
        <button class="transparent" onclick={onClose}
            >{scopedT("cancel")}</button
        >
        <button onclick={() => onResult({ newMessage: modifiedMessage })}
            >{scopedT("modify")}</button
        >
    </footer>
</Dialog>

<style>
    h2 {
        display: flex;
        align-items: center;
        gap: 0.5rem;

        span {
            height: 18px; /* Jank because the font outline it larger than the actual text, and causes it to not line up */
            display: inline-block;
        }
    }

    .description {
        text-align: center;
        width: 100%;
        margin-bottom: 1rem;

        .highlight {
            font-family: var(--sans-display);
            text-transform: uppercase;
        }
    }

    footer {
        display: flex;
        justify-content: flex-end;
        gap: 1rem;
    }

    .header {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.25rem;
    }

    section {
        display: flex;
        justify-content: center;
        align-items: center;
    }

    :global(.hacked-image) {
        max-width: 300px;
        cursor: not-allowed;
        margin-top: 1.5rem;
    }
</style>
