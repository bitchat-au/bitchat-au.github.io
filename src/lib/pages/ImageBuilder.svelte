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
    import Icon from "../components/Icon.svelte";
    import ImageMatrixRenderer from "../components/ImageMatrixRenderer.svelte";

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

        addUserImage(
            createImageWithCaption(imageUnderConstruction, "User image"),
        );
        clearImage();
    };
</script>

<div class="builder">
    <div class="header">
        <div class="bit-string-interactive">
            {#each imageUnderConstruction as row, rowIndex}
                <div class="row">
                    <span>{rowIndex + 1}:</span>
                    {#each row as pixel, colIndex}
                        <button
                            class="pixel"
                            class:active={pixel === 1}
                            onclick={() =>
                                (imageUnderConstruction[rowIndex][colIndex] =
                                    pixel === 1 ? 0 : 1)}>{pixel}</button
                        >
                    {/each}
                </div>
            {/each}
        </div>
        <span class="bit-string"
            >Bit streng: {imageUnderConstruction.flat().join("")}</span
        >
    </div>
    <ImageMatrixRenderer
        matrix={imageUnderConstruction}
        class="image-preview"
        padding={10}
        caption="Forhåndsvisning af billede"
    />
</div>

<div class="actions">
    <button onclick={clearImage} class="transparent">Ryd billede</button>
    <button onclick={onSave} disabled={isEmptyImage(imageUnderConstruction)}
        >Gem billede</button
    >
</div>

<footer>
    <h2>Gemte billeder</h2>

    <div class="saved-images">
        <ImageMatrixRenderer matrix={COMMON_IMAGES.HAPPY} class="saved-image" />
        <ImageMatrixRenderer matrix={COMMON_IMAGES.SAD} class="saved-image" />
        {#each userImages as image}
            <button
                class="saved-image no-style"
                onclick={() => removeUserImage(image)}
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

        .header {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 0.25rem;

            .bit-string {
                font-family: var(--mono);
                font-size: 0.9rem;
                color: var(--muted-grey);
            }
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

    .bit-string-interactive {
        display: flex;
        gap: 1rem;
        justify-content: center;
        flex-wrap: wrap;

        .row {
            display: flex;
            align-items: center;

            span {
                margin-right: 0.5rem;
                font-family: var(--sans-display);
            }

            .pixel {
                display: flex;
                justify-content: center;
                align-items: center;
                width: 20px;
                height: 20px;
                font-family: var(--mono);

                &:not(.active) {
                    background-color: var(--bg);
                    color: var(--white);
                    border: 1px solid var(--white);
                }

                &.active {
                    background-color: var(--white);
                    color: var(--bg);
                }
            }
        }
    }

    footer {
        border-top: 1px solid var(--muted-grey);
        padding-top: 1rem;

        .saved-images {
            display: flex;
            align-items: center;
            gap: 1rem;
            width: 100%;
            overflow-x: auto;
            scrollbar-width: thin;

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

                &:hover::after {
                    content: "";
                    position: absolute;
                    inset: 0;
                    background-color: rgba(255, 0, 0, 0.3);
                    aspect-ratio: 1/1;
                    border-radius: 0.5rem;
                    backdrop-filter: blur(2px);
                }

                &:hover :global(.delete) {
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
