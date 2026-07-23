<script lang="ts">
    import type { ImageMatrix } from "../../helpers/images";

    interface Props {
        matrix: ImageMatrix;
    }

    const { matrix }: Props = $props();
</script>

<svg>
    <rect width="100%" height="100%" class="image-matrix-bg" />

    {#each matrix as row, rowIndex}
        {#each row as pixel, colIndex}
            <use
                x={(colIndex * 20 + 8) + "%"}
                y={(rowIndex * 20 + 6) + "%"}
                width="5%"
                height="5%"
                href={pixel ? "#led-on" : "#led-off"}
            />
        {/each}
    {/each}
</svg>

<style>
    svg {
        aspect-ratio: 1/1;
        width: 100%;
    }

    .image-matrix-bg {
        fill: var(--bg);
    }
</style>
