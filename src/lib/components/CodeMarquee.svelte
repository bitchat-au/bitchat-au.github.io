<span class="code-marquee-effect" data-value="110010110001"></span>

<style>
    .code-marquee-effect {
        width: 100%;
        height: 0.6rem;
        line-height: 0.6rem;
        font-family: monospace;
        color: var(--muted-grey);
        opacity: 0.6;
        font-size: 0.6rem;

        overflow: hidden;
        white-space: nowrap;
        position: relative;

        &::before {
            content: attr(data-value) attr(data-value) attr(data-value)
                attr(data-value);
            position: absolute;
            top: 0;
            left: 0;
            width: max-content;
            will-change: transform;
            animation: marquee 10s linear infinite;

            @media (prefers-reduced-motion: reduce) {
                animation: none;
            }
        }
    }

    @keyframes marquee {
        0% {
            transform: translateX(-50%);
        }
        100% {
            transform: translateX(0);
        }
    }
</style>
