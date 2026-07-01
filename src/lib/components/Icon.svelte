<script lang="ts">
    interface Props {
        name: string;
        style?: "solid" | "regular";
        class?: string;
    }

    const { name, style = "regular", class: iconClass }: Props = $props();
</script>

<svg
    class={["icon", iconClass]}
    role="presentation"
    aria-hidden="true"
    width="1em"
    height="1em"
>
    <use href={`/icons.svg#${style}-${name}`}></use>
</svg>

<style>
    .icon {
        display: inline-block;
        vertical-align: middle;
        fill: currentColor;
    }
</style>