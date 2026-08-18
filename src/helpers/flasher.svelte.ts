import { createUSBConnection } from '@microbit/microbit-connection/usb';
import { microbitBoardId, type MicropythonFsHex } from '@microbit/microbit-fs';
import { type BoardVersion, type ProgressCallback } from '@microbit/microbit-connection';
import { compileMicropythonWithConfig } from './micropython_compiler';
import { confirm } from './popup';
import { t } from '@i18n';

// eslint-disable-next-line svelte/prefer-svelte-reactivity
const flashedMicrobits = new Set<number>();

async function flashMicrobit(fs: MicropythonFsHex, progress: ProgressCallback): Promise<void> {
	const usb = createUSBConnection({ deviceSelectionMode: 'UseAnyAllowed' });
	await usb.connect();

	const deviceId = usb.getDeviceId();

	if (flashedMicrobits.has(deviceId)) {
		const overwrite = await confirm(t('flasher.duplicate.title'), t('flasher.duplicate.description'));

		if (!overwrite) {
			return;
		}
	}

	const flashSource = async (boardVersion: BoardVersion) =>
		fs.getIntelHex(microbitBoardId[boardVersion]);
	await usb.flash(flashSource, {
		partial: true,
		progress
	});

	flashedMicrobits.add(deviceId);
}

export async function flashMicrobitWithConfig(
	source: 'dummy' | 'master',
	radioChannel: number,
	progress: ProgressCallback
): Promise<void> {
	const fs = await compileMicropythonWithConfig(source, radioChannel);
	await flashMicrobit(fs, progress);
}
