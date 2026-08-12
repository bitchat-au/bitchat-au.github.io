import { fetchMicroPython } from './micropython';
import { MicropythonFsHex } from '@microbit/microbit-fs';

const dummyRoleSource = () => import('../micropython/dummy.py?raw');
const masterRoleSource = () => import('../micropython/communicationMB.py?raw');

const commonFsSize = 20 * 1024;

const compilationCache: Record<string, Promise<MicropythonFsHex>> = {};
export async function compileMicropythonWithConfig(
	source: 'dummy' | 'master',
	radioChannel: number
) {
	const cacheKey = `${source}-${radioChannel}`;
	if (!compilationCache[cacheKey]) {
		const sourceCode = await getSource(source);
		const configuredSource = replaceRadioChannel(sourceCode, radioChannel);
		compilationCache[cacheKey] = compileMicropython(configuredSource);
	}

	return compilationCache[cacheKey];
}

async function compileMicropython(sourceCode: string) {
	const micropythonBase = await fetchMicroPython();
	const fs = new MicropythonFsHex(micropythonBase, { maxFsSize: commonFsSize });
	fs.write('main.py', sourceCode);

	return fs;
}

async function getSource(source: 'dummy' | 'master') {
	const sourceModule = source === 'dummy' ? dummyRoleSource : masterRoleSource;
	return sourceModule().then((module) => module.default);
}

function replaceRadioChannel(source: string, radioChannel: number) {
	return source.replace(/radioChannel = \d+/, `radioChannel = ${radioChannel}`);
}
