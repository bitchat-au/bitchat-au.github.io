<script lang="ts">
	import { untrack } from 'svelte';
	import { flashMicrobitWithConfig } from '../../helpers/flasher.svelte';
	import { confirm } from '../../helpers/popup';
	import Dialog from '../Components/Dialog.svelte';

	let groups: number = $state(1);
	let clientsPrGroup: number = $state(1);
	let currentMicrobitIndex: number = $state(0);
	let flashProgress: number | undefined = $state(0);
	let showSetupModal: boolean = $state(false);
	let operatingSystem = navigator.platform;

	interface MicrobitState {
		groupId: number;
		type: 'dummy' | 'master';
		state: 'unflashed' | 'flashing' | 'un-plug' | 'flashed' | 'error';
	}

	let microbits: MicrobitState[] = $state([]);
	const isAllDone: boolean = $derived(microbits.every((m) => m.state === 'flashed'));

	function calculateMicrobits() {
		untrack(() => (microbits = []));

		for (let groupId = 1; groupId <= groups; groupId++) {
			for (let clientId = 1; clientId <= clientsPrGroup; clientId++) {
				untrack(() =>
					microbits.push({
						groupId,
						type: 'dummy',
						state: 'unflashed'
					})
				);
			}
			untrack(() =>
				microbits.push({
					groupId,
					type: 'master',
					state: 'unflashed'
				})
			);
		}
	}

	$effect(() => {
		calculateMicrobits();
	});

	const isDone = (idx: number) => {
		return microbits[idx]?.state === 'flashed';
	};

	function increaseCounter() {
		if (isAllDone) {
			return;
		}

		do {
			currentMicrobitIndex = (currentMicrobitIndex + 1) % microbits.length;
		} while (isDone(currentMicrobitIndex));
	}

	async function flashMicrobit() {
		const currentMb = microbits[currentMicrobitIndex];
		const { groupId, type } = currentMb;

		try {
			await flashMicrobitWithConfig(type, groupId, (stage, progress) => {
				currentMb.state = 'flashing';
				flashProgress = progress;
			});

			currentMb.state = 'un-plug';
		} catch (error) {
			console.error('Error flashing microbit:', error);
			currentMb.state = 'error';
			currentMicrobitIndex = (currentMicrobitIndex + 1) % microbits.length;
		}
	}

	$effect(() => {
		const onUSBDisconnect = () => {
			if (microbits[currentMicrobitIndex].state === 'un-plug') {
				microbits[currentMicrobitIndex].state = 'flashed';
			}
			increaseCounter();
		};

		const onUSBConnect = () => {
			flashMicrobit();
		};

		navigator.usb?.addEventListener('connect', onUSBConnect);
		navigator.usb?.addEventListener('disconnect', onUSBDisconnect);
		return () => {
			navigator.usb?.removeEventListener('connect', onUSBConnect);
			navigator.usb?.removeEventListener('disconnect', onUSBDisconnect);
		};
	});

	const showAdvancedWarning = async () => {
		const LOCALSTORAGE_KEY = 'bit:chat-classroom-flasher';
		if (!localStorage.getItem(LOCALSTORAGE_KEY)) {
			await confirm(
				'Warning: advanced tool ahead',
				"This tool is designed for power users, and requires tweaking some advanced features in chrome. You should only use this tool if you know what you're doing, otherwise use the regular flashing tool.",
				{
					cancelText: 'Go back',
					confirmText: "I know what i'm doing"
				}
			);

			localStorage.setItem(LOCALSTORAGE_KEY, 'accepted');

			showSetupModal = true;
		}
	};
	$effect(() =>
		untrack(() => {
			showAdvancedWarning();
		})
	);
</script>

<main>
	<h1>Advanced classroom flasher</h1>
	<p class="subheading">
		This tool is designed for power users, for very quick flashing of multiple micro:bits. Required
		some setup to work as expected,
		<button class="no-style inline" onclick={() => (showSetupModal = true)}>
			show setup instructions
		</button>
	</p>

	<div class="inputs">
		<div class="input-field">
			<label for="groups">Groups</label>
			<div class="input-container">
				<input type="number" id="groups" bind:value={groups} min="1" max="10" />
			</div>
		</div>

		<div class="input-field">
			<label for="clientsPrGroup">Clients per group</label>
			<div class="input-container">
				<input type="number" id="clientsPrGroup" bind:value={clientsPrGroup} min="1" max="10" />
			</div>
		</div>
	</div>

	<hr />

	<table>
		<colgroup>
			<col span="1" style="width: 10%;" />
			<col span="1" style="width: 30%;" />
			<col span="1" style="width: 30%;" />
			<col span="1" style="width: 30%;" />
		</colgroup>

		<thead>
			<tr>
				<th>#</th>
				<th>Group</th>
				<th>Type</th>
				<th>State</th>
			</tr>
		</thead>
		<tbody>
			{#each microbits as mb, index (index)}
				<tr
					class:current={index === currentMicrobitIndex}
					class:success={mb.state === 'flashed'}
					class:error={mb.state === 'error'}
					class:master={mb.type === 'master'}
					onclick={() => (currentMicrobitIndex = index)}
				>
					<td>{index + 1}</td>
					<td>{mb.groupId}</td>
					<td>{mb.type}</td>
					<td>
						{#if mb.state === 'flashing'}
							<progress value={flashProgress} max="1"
								>{Math.floor((flashProgress || 0) * 100)}</progress
							>
						{:else}
							{mb.state}
						{/if}
					</td>
				</tr>
			{/each}
		</tbody>
	</table>

	<button
		onclick={() => {
			currentMicrobitIndex = 0;
			calculateMicrobits();
		}}
	>
		Reset state
	</button>
</main>

<Dialog
	bind:open={showSetupModal}
	ariaLabel="Advanced classroom flashing instructions"
	class="setup-instructions"
>
	<header>
		<h1>Setup Instructions</h1>
	</header>

	{#if operatingSystem.indexOf('Mac') !== -1}
		<ol>
			<li>Quit Google Chrome completely (<code>Cmd + Q</code>).</li>
			<li>Open <strong>Terminal</strong>.</li>
			<li>
				Run the following command:
				<pre><code
						>defaults write com.google.Chrome WebUsbAllowDevicesForUrls -array '&lbrace; devices = ( &lbrace;&rbrace; ); urls = ( "{location.origin}" ); &rbrace;'</code
					></pre>
			</li>
			<li>Open Chrome and verify at <code>chrome://policy</code>.</li>
			<li>Reopen this page</li>
		</ol>
	{:else if operatingSystem.indexOf('Win') !== -1}
		<ol>
			<li>Open <strong>Registry Editor</strong> (<code>regedit</code>).</li>
			<li>
				Navigate to: <code>HKEY_LOCAL_MACHINE\SOFTWARE\Policies\Google\Chrome</code> (Create the
				<code>Google</code>
				and <code>Chrome</code> keys if they do not exist).
			</li>
			<li>
				Create a new <strong>String Value (REG_SZ)</strong> named
				<code>WebUsbAllowDevicesForUrls</code>.
			</li>
			<li>
				Set the value data to:
				<pre><code
						>[&lbrace;"devices": [&lbrace;&rbrace;], "urls": ["{location.origin}"]&rbrace;]</code
					></pre>
			</li>
			<li>Restart Chrome and verify at <code>chrome://policy</code>.</li>
			<li>Reopen this page</li>
		</ol>
	{:else}
		<ol>
			<li>Open your terminal.</li>
			<li>
				Create the Chrome managed policies directory if it does not exist:
				<pre><code>sudo mkdir -p /etc/opt/chrome/policies/managed/</code></pre>
			</li>
			<li>
				Create a new policy file:
				<pre><code>sudo nano /etc/opt/chrome/policies/managed/webusb.json</code></pre>
			</li>
			<li>
				Add the following JSON content:
				<pre><code
						>&lbrace;
  "WebUsbAllowDevicesForUrls": [
    &lbrace;
      "devices": [&lbrace;&rbrace;],
      "urls": ["{location.origin}"]
    &lbrace;
  ]
&rbrace;</code
					></pre>
			</li>
			<li>Save the file and restart Chrome. Verify at <code>chrome://policy</code>.</li>
			<li>Reopen this page</li>
		</ol>
	{/if}
</Dialog>

<style>
	main {
		padding: 1.5rem;
	}

	.inputs {
		display: flex;
		gap: 1rem;
	}

	.input-field {
		max-width: 200px;
		margin: 0;
		flex: 1;
	}

	table {
		width: 100%;
		border-collapse: collapse;
		margin-bottom: 1rem;
	}
	th,
	td {
		padding: 8px;
		border: 1px solid var(--stroke);
		text-align: left;
	}
	tr {
		border-left: 4px solid var(--stroke);
		background: var(--bg);

		&:not(:has(th)):hover {
			background-color: hsl(from var(--bg) h s calc(l * 0.9));
			cursor: pointer;
		}

		&.current {
			border-left-color: #4e4eee;
		}

		&.success {
			border-left-color: var(--electric-green);
		}

		&.error {
			border-left-color: var(--danger);
		}

		&.master:not(:last-of-type) td {
			border-bottom: 4px solid var(--stroke);
		}
	}

	td progress {
		width: 100%;
		accent-color: var(--accent);
	}

	:global(.setup-instructions) {
		max-width: 800px;

		pre {
			overflow-x: auto;
			scrollbar-width: thin;
			background-color: #171717;
			padding: 0.25rem;
			scrollbar-color: var(--muted-grey) #171717;
		}
	}
</style>
