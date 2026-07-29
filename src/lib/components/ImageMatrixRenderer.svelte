<script lang="ts">
    import {
        COMMON_IMAGES,
        getImageCaption,
        type ImageMatrix,
    } from "../../helpers/images";

    interface Props {
        matrix?: ImageMatrix | null;
        class?: string;
        padding?: number;
        caption?: string;
        highlightedPixel?: [number, number] | null;
    }

    const {
        matrix = COMMON_IMAGES.EMPTY,
        class: classList,
        padding = 30,
        caption: customCaption,
        highlightedPixel = null,
    }: Props = $props();

    const caption = $derived(
        (customCaption || getImageCaption(matrix)) ?? "5x5 LED-matrix",
    );
</script>

<svg
    viewBox={`0 0 ${218 + padding * 2} ${218 + padding * 2}`}
    class={["image-matrix", classList]}
    aria-label={caption}
>
    <rect width={218 + padding * 2} height={218 + padding * 2} fill="#111" />

    {#each matrix as row, rowIndex}
        {#each row as pixel, colIndex}
            {#if pixel}
                <rect
                    class="sim-led"
                    x={colIndex * 46 - 2 + 12 + padding}
                    y={rowIndex * 44 - 2 + 10 + padding}
                    width="14"
                    height="24"
                    rx="3"
                    ry="3"
                    style="filter: url(&quot;#ledglow&quot;); fill: rgb(255, 127, 127);"
                >
                    <title>({rowIndex},{colIndex})</title>
                </rect>
            {:else}
                <rect
                    class="sim-led-back"
                    x={colIndex * 46 + 12 + padding}
                    y={rowIndex * 44 + 10 + padding}
                    width="10"
                    height="20"
                    rx="2"
                    ry="2"
                    style="fill: rgb(32, 32, 32);"
                >
                    <title>({rowIndex},{colIndex})</title>
                </rect>
            {/if}
        {/each}
    {/each}

    {#if highlightedPixel}
        <rect
            class="highlight"
            aria-label="Markeret pixel ({highlightedPixel[0]},{highlightedPixel[1]})"
            x={highlightedPixel[1] * 46 + 12 + padding - 4}
            y={highlightedPixel[0] * 44 + 10 + padding - 4}
            width="18"
            height="28"
            rx="4"
            ry="4"
            style="outline: 2px solid var(--accent); fill-opacity: 0;"
        />
    {/if}
</svg>

<style>
    svg {
        aspect-ratio: 1/1;
        width: 100%;
        background-color: #111;
        border-radius: 0.5rem;
    }
</style>
