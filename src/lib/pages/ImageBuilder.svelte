<script lang="ts">
    import type { ImageMatrix } from "../../helpers/images";
    import {
        COMMON_IMAGES,
        createImageWithCaption,
        isEmptyImage,
    } from "../../helpers/images";
    import {
        addUserImage,
        removeUserImage,
        userImages,
    } from "../../services/user_images.svelte";
    import { microbitService } from "../../services/microbit.svelte";
    import Icon from "../Components/Icon.svelte";
    import ImageMatrixRenderer from "../Components/ImageMatrixRenderer.svelte";
    import { scope } from "@i18n";
    import InteractiveBitString from "../Components/InteractiveBitString.svelte";

    const scopedT = scope("imageBuilder");

    let hoverIndex = $state<number | null>(null);
    let imageUnderConstruction = $state<ImageMatrix>([
        [0, 0, 0, 0, 0],
        [0, 1, 1, 1, 0],
        [0, 1, 0, 1, 0],
        [0, 1, 1, 1, 0],
        [0, 0, 0, 0, 0],
    ]);

    const clearImage = () => (imageUnderConstruction = COMMON_IMAGES.EMPTY);

    const onSave = () => {
        if (isEmptyImage(imageUnderConstruction)) {
            return;
        }

        const image = createImageWithCaption(
            imageUnderConstruction,
            scopedT("ownImageCaption"),
        );
        if (addUserImage(image)) {
            microbitService.writeImageToMB(image);
        }

        clearImage();
    };

    const onRemove = (image: ImageMatrix) => {
        if (removeUserImage(image)) {
            microbitService.removeImageFromMB(image);
        }
    };
</script>

<div class="builder">
    <div class="header">
        <InteractiveBitString
            bind:image={imageUnderConstruction}
            onHover={(index) => (hoverIndex = index)}
        />
    </div>
    <ImageMatrixRenderer
        matrix={imageUnderConstruction}
        class="image-preview"
        padding={10}
        caption={scopedT("imageRenderAriaLabel")}
        highlightedPixel={hoverIndex !== null
            ? [Math.floor(hoverIndex / 5), hoverIndex % 5]
            : null}
    />
</div>

<div class="actions">
    <button onclick={clearImage} class="transparent">{scopedT("clearImage")}</button>
    <button onclick={onSave} disabled={isEmptyImage(imageUnderConstruction)}
        >{scopedT("saveImage")}</button
    >
</div>

<footer aria-label={scopedT("savedImages")}>
    <h2>{scopedT("savedImages")}</h2>

    <div class="saved-images" role="list" aria-label={scopedT("savedImagesAriaLabel")}>
        <ImageMatrixRenderer matrix={COMMON_IMAGES.HAPPY} class="saved-image" />
        <ImageMatrixRenderer matrix={COMMON_IMAGES.SAD} class="saved-image" />
        {#each userImages as image}
            <button
                class="saved-image no-style"
                onclick={() => onRemove(image)}
                aria-label={scopedT("deleteImageAriaLabel")}
            >
                <ImageMatrixRenderer matrix={image} />
                <Icon name="trash-alt" class="delete" />
            </button>
        {/each}
    </div>
</footer>

<style>
    .builder {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        flex-grow: 1;
        gap: 1rem;
        width: 100%;

        .header {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 0.25rem;
        }

        :global(.image-preview) {
            max-width: 400px;
            cursor: not-allowed;
        }
    }

    .actions {
        display: flex;
        justify-content: flex-end;
        gap: 1rem;
        width: 100%;
        margin-bottom: 1rem;
    }

    footer {
        border-top: 1px solid var(--stroke);
        padding-top: 1rem;
        width: 100%;

        .saved-images {
            display: flex;
            align-items: center;
            gap: 1rem;
            width: 100%;
            overflow-x: auto;
            scrollbar-width: thin;
            padding: 4px 0; /* Allows for the focus outline of the saved-image buttons */

            :global(.saved-image) {
                max-width: 80px;
                min-width: 70px;

                &:first-child {
                    margin-left: auto;
                }

                &:last-child {
                    margin-right: auto;
                }
            }

            button.saved-image {
                position: relative;
                display: flex;

                &:hover::after,
                &:focus-visible::after {
                    content: "";
                    position: absolute;
                    inset: 0;
                    background-color: rgba(255, 0, 0, 0.3);
                    aspect-ratio: 1/1;
                    border-radius: 0.5rem;
                    backdrop-filter: blur(2px);
                }

                &:hover :global(.delete),
                &:focus-visible :global(.delete) {
                    opacity: 1;
                }

                :global(.delete) {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    font-size: 2rem;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    opacity: 0;
                    user-select: none;
                    touch-action: none;
                    z-index: 10;
                }
            }
        }
    }
</style>
