// https://github.com/microbit-foundation/python-editor-v3/blob/main/src/micropython/micropython.ts

import { type IntelHexWithId } from '@microbit/microbit-fs';
import { microbitBoardId } from '@microbit/microbit-universal-hex';

const v2Main = {
	name: 'MicroPython (micro:bit V2)',
	source: () => import('../micropython/microbit-micropython-v2.hex?raw'),
	boardId: microbitBoardId.V2,
	version: '2.1.2',
	web: 'https://github.com/microbit-foundation/micropython-microbit-v2/releases/tag/v2.1.2'
};

const v1Main = {
	name: 'MicroPython (micro:bit V1)',
	source: () => import('../micropython/microbit-micropython-v1.hex?raw'),
	boardId: microbitBoardId.V1,
	version: '1.1.1',
	web: 'https://github.com/bbcmicrobit/micropython/releases/tag/v1.1.1'
};

export const microPythonConfig = {
	versions: [v1Main, v2Main]
};

export const fetchMicroPython = async (): Promise<IntelHexWithId[]> =>
	Promise.all(
		microPythonConfig.versions.map(async ({ boardId, source }) => {
			const hex = await source().then((module) => module.default);
			return { boardId, hex };
		})
	);
