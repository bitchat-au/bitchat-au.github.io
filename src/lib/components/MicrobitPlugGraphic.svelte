<script lang="ts">
	interface Props {
		state?: 'plug-in' | 'flashing' | 'remove' | 'out';
		color?: 'yellow' | 'green' | 'red' | 'blue';
	}

	const { state = "out", color = "yellow" }: Props = $props();
</script>

<svg class={[state, color]} width="300px" height="300px" viewBox="0 0 300 300" xmlns="http://www.w3.org/2000/svg">
	<use id="plug" href="/microusb-plug.svg" width="50px" x="125px" y="-33px" />
	<use href="/microbit.svg" width="300px" x="0" y="30px" />
</svg>

<style>
	svg {
		&.green {
			color: #10D95E;
		}

		&.red {
			color: #DE1642;
		}

		&.yellow {
			color: #FFCC00;
		}

		&.blue {
			color: #0191DC;
		}
	}

	svg.plug-in #plug {
		animation: plugIn linear 3s infinite;
	}

	svg.remove #plug {
		animation: plugOut linear 3s infinite;
	}

	svg.flashing #plug {
		transform: translateY(45px);
	}

	@keyframes plugIn {
		0% {
			transform: translateY(0px);
		}
		30% {
			transform: translateY(45px);
		}
		100% {
			transform: translateY(45px);
		}
	}

	@keyframes plugOut {
		0% {
			transform: translateY(45px);
		}
		30% {
			transform: translateY(0px);
		}
		100% {
			transform: translateY(0px);
		}
	}
</style>
