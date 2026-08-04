<script lang="ts">
    import { scope, t } from "@i18n";
    import {
        COMMON_IMAGES,
        encryptImage,
        type ImageMatrix,
    } from "../../helpers/images";
    import { userImages } from "../../services/user_images.svelte";
    import ImageMatrixRenderer from "../Components/ImageMatrixRenderer.svelte";

    const scopedT = scope("codeCracker");

    let imageSelection: "own" | "random" = $state("own");
    let correctCode = $state("");
    let inputCode = $state("");
    let selectedImage: ImageMatrix | null = $state(null);
    let decryptedImage: ImageMatrix = $state(COMMON_IMAGES.EMPTY);
    let correctness = $state(0);

    function generateImage() {
        const candidates =
            imageSelection == "own"
                ? userImages
                : [
                      COMMON_IMAGES.SAD,
                      COMMON_IMAGES.HAPPY,
                      COMMON_IMAGES.HEART,
                      COMMON_IMAGES.DUCK,
                      COMMON_IMAGES.HOUSE,
                      COMMON_IMAGES.GHOST,
                      COMMON_IMAGES.GIRAFFE,
                      COMMON_IMAGES.UMBRELLA,
                      COMMON_IMAGES.SNAKE,
                      COMMON_IMAGES.RABBIT,
                      COMMON_IMAGES.COW,
                      COMMON_IMAGES.PITCHFORK,
                      COMMON_IMAGES.SWORD,
                  ];

        const image = candidates[Math.floor(Math.random() * candidates.length)];
        correctCode = Array.from({ length: 5 }, () =>
            Math.random() > 0.5 ? "A" : "B",
        ).join("");
        inputCode = "AAAAA";
        selectedImage = encryptImage(image, correctCode);
        correctness = 0;
        decryptedImage = selectedImage;
    }

    function checkCode() {
        correctness = [...inputCode]
            .map((char, index) => char === correctCode[index])
            .filter(Boolean).length;
        decryptedImage = selectedImage
            ? encryptImage(selectedImage, inputCode)
            : COMMON_IMAGES.EMPTY;
    }

    const flipCharacter = (index: number) => {
        if (index < 0 || index >= inputCode.length) return;
        const newChar = inputCode[index] === "A" ? "B" : "A";
        inputCode =
            inputCode.substring(0, index) +
            newChar +
            inputCode.substring(index + 1);
    };
</script>

{#if !selectedImage}
    <header>
        <h2>{scopedT("title")}</h2>
        <span class="subheading"
            >{@html scopedT("instructions")}</span
        >
    </header>

    <div class="source-selection">
        <div class="radio-group">
            <label class="as-button"
                ><input
                    type="radio"
                    name="billede"
                    value="own"
                    bind:group={imageSelection}
                />{scopedT("ownImage")}</label
            >
            <label class="as-button"
                ><input
                    type="radio"
                    name="billede"
                    value="random"
                    bind:group={imageSelection}
                />{scopedT("randomImage")}</label
            >
        </div>
        <button onclick={generateImage}>{scopedT("generate")}</button>
    </div>
{:else}
    <div class="code-input">
        <div class="input">
            <h3 class="label">{scopedT("code")}:</h3>
            <div class="characters">
                {#each inputCode.split("") as char, index}
                    <button
                        class="no-style character"
                        onclick={() => flipCharacter(index)}
                    >
                        {char}
                    </button>
                {/each}
            </div>
        </div>
        <button onclick={checkCode} class="decrypt">{scopedT("decrypt")}</button>
    </div>
    <ImageMatrixRenderer
        matrix={decryptedImage}
        class="image-preview"
        padding={10}
        caption={scopedT("imageRenderAriaLabel")}
    />
    <p class="correctness">{scopedT("correctness", { correctness })}</p>
    <button onclick={() => (selectedImage = null)}>{scopedT("tryAgain")}</button>
{/if}

<style>
    header {
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        margin-top: 10rem;
    }

    .source-selection {
        display: flex;
        justify-content: center;
        gap: 2rem;
        margin-top: 1rem;
    }

    :global(.image-matrix.image-preview) {
        max-width: 300px;
    }

    .code-input {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.5rem;
        margin-bottom: 3rem;
        margin-top: 10rem;

        .input {
            display: flex;
            align-items: center;
            gap: 0.25rem;

            .label {
                margin: 0;
                font-size: 24px;
            }
    
            .characters {
                display: flex;
                gap: 0.25rem;
    
                button.character {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    font-family: var(--heading);
                    width: 2rem;
                    height: 2rem;
                    font-size: 1.5rem;
                    padding-top: 4px;
                    border-bottom: 2px solid var(--white);

                    &:hover {
                        border-bottom: 2px solid var(--accent);
                        background-color: rgb(from var(--accent) r g b / 0.1);
                    }
                }
            }
        }

        .decrypt {
            width: 100%;
        }
    }
</style>
