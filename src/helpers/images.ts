import { t } from './i18n.svelte';
import { registerOnWindow } from './window';

export type ImageMatrix = [
	[number, number, number, number, number],
	[number, number, number, number, number],
	[number, number, number, number, number],
	[number, number, number, number, number],
	[number, number, number, number, number]
];
export type ImageMatrixWithCaption = ImageMatrix & { [CAPTION_KEY]: string };

const CAPTION_KEY = '__a11y_caption__';

export const packImageString = (imgString: string): string => {
	const rows = imgString.split(':');
	if (rows.length !== 5) {
		throw new Error('Invalid image string. Must have 5 rows.');
	}

	// Validate each row to ensure it has exactly 5 characters and only contains '0' or '1'
	if (rows.some((row) => row.length !== 5 || !/^[01]{5}$/.test(row))) {
		throw new Error('Invalid image string. Each row must have 5 characters of 0s and 1s.');
	}

	const matrix = imgString.split(':').map((row) => row.split('').map(Number)) as ImageMatrix;
	return packImage(matrix);
};

export function packImage(matrix: ImageMatrix): string {
	return matrix
		.map((row) => {
			const val = parseInt(row.join(''), 2);
			return val <= 25 ? String.fromCharCode(val + 65) : (val - 26).toString();
		})
		.join('');
}

export function unpackImage(payload: string): ImageMatrix {
	if (payload.length !== 5) {
		throw new Error('Invalid payload length. Must be 5 characters.');
	}

	if (!/^[A-Z0-5]{5}$/.test(payload)) {
		throw new Error('Invalid payload characters. Must be A-Z or 0-5.');
	}

	return payload.split('').map((char) => {
		const val = /[0-5]/.test(char) ? parseInt(char, 10) + 26 : char.charCodeAt(0) - 65;
		const binaryString = val.toString(2).padStart(5, '0');
		return binaryString.split('').map((bit) => parseInt(bit, 10));
	}) as ImageMatrix;
}

export function createImageWithCaption(
	matrix: ImageMatrix,
	caption: string
): ImageMatrixWithCaption {
	Object.defineProperty(matrix, CAPTION_KEY, {
		value: caption,
		writable: true,
		enumerable: true,
		configurable: true
	});
	return matrix as ImageMatrixWithCaption;
}

export function getImageCaption(matrix: ImageMatrix | undefined | null): string | undefined {
	if (matrix && Object.prototype.hasOwnProperty.call(matrix, CAPTION_KEY)) {
		return (matrix as ImageMatrixWithCaption)[CAPTION_KEY];
	}
	return undefined;
}

export function removeImageCaption(matrix: ImageMatrix): ImageMatrix {
	if (Object.prototype.hasOwnProperty.call(matrix, CAPTION_KEY)) {
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const { [CAPTION_KEY]: _, ...rest } = matrix as ImageMatrixWithCaption;
		return rest as ImageMatrix;
	}
	return matrix;
}

export function isEmptyImage(matrix: ImageMatrix): boolean {
	return matrix.every((row) => row.every((value) => value === 0));
}

export function areImagesEqual(img1: ImageMatrix, img2: ImageMatrix): boolean {
	for (let i = 0; i < 5; i++) {
		for (let j = 0; j < 5; j++) {
			if (img1[i][j] !== img2[i][j]) {
				return false;
			}
		}
	}
	return true;
}

/**
 * Encrypt and image based on a specific code.
 * The code is a 5 letter string, consisting of A or B
 * Each letter in the code corresponds to a column in the image. If the letter is A, the column is left as is. If the letter is B, the column is inverted (0s become 1s and 1s become 0s).
 * @param matrix ImageMatrix input image
 * @param code string code to encrypt the image with, 5 letter string, consisting of A or B
 */
export function encryptImage(matrix: ImageMatrix, code: string): ImageMatrix {
	if (code.length !== 5 || !/^[AB]{5}$/.test(code)) {
		throw new Error('Invalid code. Must be a 5 letter string, consisting of A or B.');
	}

	const encryptedMatrix: ImageMatrix = matrix.map((row) => [...row]) as ImageMatrix;

	for (let col = 0; col < 5; col++) {
		if (code[col] === 'B') {
			for (let row = 0; row < 5; row++) {
				encryptedMatrix[row][col] = encryptedMatrix[row][col] === 0 ? 1 : 0;
			}
		}
	}

	return removeImageCaption(encryptedMatrix);
}

/**
 * Clone an image matrix, removing any caption if present.
 * @param matrix ImageMatrix input image
 * @returns A new ImageMatrix that is a clone of the input, without any caption.
 */
export function cloneImage(matrix: ImageMatrix): ImageMatrix {
	const clonedMatrix: ImageMatrix = matrix.map((row) => [...row]) as ImageMatrix;
	return removeImageCaption(clonedMatrix);
}

// Common images
export const COMMON_IMAGES = Object.freeze({
	HAPPY: createImageWithCaption(
		[
			[0, 0, 0, 0, 0],
			[0, 1, 0, 1, 0],
			[0, 0, 0, 0, 0],
			[1, 0, 0, 0, 1],
			[0, 1, 1, 1, 0]
		],
		t('knownImages.HAPPY')
	),
	SAD: createImageWithCaption(
		[
			[0, 0, 0, 0, 0],
			[0, 1, 0, 1, 0],
			[0, 0, 0, 0, 0],
			[0, 1, 1, 1, 0],
			[1, 0, 0, 0, 1]
		],
		t('knownImages.SAD')
	),
	FULL: createImageWithCaption(
		[
			[1, 1, 1, 1, 1],
			[1, 1, 1, 1, 1],
			[1, 1, 1, 1, 1],
			[1, 1, 1, 1, 1],
			[1, 1, 1, 1, 1]
		],
		t('knownImages.FULL')
	),
	EMPTY: createImageWithCaption(
		[
			[0, 0, 0, 0, 0],
			[0, 0, 0, 0, 0],
			[0, 0, 0, 0, 0],
			[0, 0, 0, 0, 0],
			[0, 0, 0, 0, 0]
		],
		t('knownImages.EMPTY')
	),
	['1']: createImageWithCaption(
		[
			[0, 0, 1, 0, 0],
			[0, 1, 1, 0, 0],
			[0, 0, 1, 0, 0],
			[0, 0, 1, 0, 0],
			[0, 1, 1, 1, 0]
		],
		t('knownImages.1')
	),
	['2']: createImageWithCaption(
		[
			[1, 1, 1, 0, 0],
			[0, 0, 0, 1, 0],
			[0, 1, 1, 0, 0],
			[1, 0, 0, 0, 0],
			[1, 1, 1, 1, 0]
		],
		t('knownImages.2')
	),
	['3']: createImageWithCaption(
		[
			[1, 1, 1, 1, 0],
			[0, 0, 0, 1, 0],
			[0, 0, 1, 0, 0],
			[1, 0, 0, 1, 0],
			[0, 1, 1, 0, 0]
		],
		t('knownImages.3')
	),
	['4']: createImageWithCaption(
		[
			[0, 0, 1, 1, 0],
			[0, 1, 0, 1, 0],
			[1, 0, 0, 1, 0],
			[1, 1, 1, 1, 1],
			[0, 0, 0, 1, 0]
		],
		t('knownImages.4')
	),
	['5']: createImageWithCaption(
		[
			[1, 1, 1, 1, 1],
			[1, 0, 0, 0, 0],
			[1, 1, 1, 1, 0],
			[0, 0, 0, 0, 1],
			[1, 1, 1, 1, 0]
		],
		t('knownImages.5')
	),
	['6']: createImageWithCaption(
		[
			[0, 0, 0, 1, 0],
			[0, 0, 1, 0, 0],
			[0, 1, 1, 1, 0],
			[1, 0, 0, 0, 1],
			[0, 1, 1, 1, 0]
		],
		t('knownImages.6')
	),
	['7']: createImageWithCaption(
		[
			[1, 1, 1, 1, 1],
			[0, 0, 0, 1, 0],
			[0, 0, 1, 0, 0],
			[0, 1, 0, 0, 0],
			[1, 0, 0, 0, 0]
		],
		t('knownImages.7')
	),
	['8']: createImageWithCaption(
		[
			[0, 1, 1, 1, 0],
			[1, 0, 0, 0, 1],
			[0, 1, 1, 1, 0],
			[1, 0, 0, 0, 1],
			[0, 1, 1, 1, 0]
		],
		t('knownImages.8')
	),
	['9']: createImageWithCaption(
		[
			[0, 1, 1, 1, 0],
			[1, 0, 0, 0, 1],
			[0, 1, 1, 1, 0],
			[0, 0, 1, 0, 0],
			[0, 1, 0, 0, 0]
		],
		t('knownImages.9')
	),
	['0']: createImageWithCaption(
		[
			[0, 1, 1, 0, 0],
			[1, 0, 0, 1, 0],
			[1, 0, 0, 1, 0],
			[1, 0, 0, 1, 0],
			[0, 1, 1, 0, 0]
		],
		t('knownImages.0')
	),
	HEART: createImageWithCaption(
		[
			[0, 1, 0, 1, 0],
			[1, 1, 1, 1, 1],
			[1, 1, 1, 1, 1],
			[0, 1, 1, 1, 0],
			[0, 0, 1, 0, 0]
		],
		t('knownImages.HEART')
	),
	DUCK: createImageWithCaption(
		[
			[0, 1, 1, 0, 0],
			[1, 1, 1, 0, 0],
			[0, 1, 1, 1, 1],
			[0, 1, 1, 1, 0],
			[0, 0, 0, 0, 0]
		],
		t('knownImages.DUCK')
	),
	HOUSE: createImageWithCaption(
		[
			[0, 0, 1, 0, 0],
			[0, 1, 1, 1, 0],
			[1, 1, 1, 1, 1],
			[0, 1, 1, 1, 0],
			[0, 1, 1, 1, 0]
		],
		t('knownImages.HOUSE')
	),
	GHOST: createImageWithCaption(
		[
			[0, 1, 1, 1, 0],
			[1, 0, 1, 0, 1],
			[1, 1, 1, 1, 1],
			[1, 1, 1, 1, 1],
			[1, 0, 1, 0, 1]
		],
		t('knownImages.GHOST')
	),
	GIRAFFE: createImageWithCaption(
		[
			[1, 1, 0, 0, 0],
			[0, 1, 0, 0, 0],
			[0, 1, 0, 0, 0],
			[0, 1, 1, 1, 0],
			[0, 1, 0, 1, 0]
		],
		t('knownImages.GIRAFFE')
	),
	UMBRELLA: createImageWithCaption(
		[
			[0, 1, 1, 1, 0],
			[1, 1, 1, 1, 1],
			[0, 0, 1, 0, 0],
			[1, 0, 1, 0, 0],
			[1, 1, 1, 0, 0]
		],
		t('knownImages.UMBRELLA')
	),
	SNAKE: createImageWithCaption(
		[
			[1, 1, 0, 0, 0],
			[1, 1, 0, 1, 1],
			[0, 1, 0, 1, 0],
			[0, 1, 1, 1, 0],
			[0, 0, 0, 0, 0]
		],
		t('knownImages.SNAKE')
	),
	RABBIT: createImageWithCaption(
		[
			[1, 0, 1, 0, 0],
			[1, 0, 1, 0, 0],
			[1, 1, 1, 1, 0],
			[1, 1, 0, 1, 0],
			[1, 1, 1, 1, 0]
		],
		t('knownImages.RABBIT')
	),
	COW: createImageWithCaption(
		[
			[1, 0, 0, 0, 1],
			[1, 0, 0, 0, 1],
			[1, 1, 1, 1, 1],
			[0, 1, 1, 1, 0],
			[0, 0, 1, 0, 0]
		],
		t('knownImages.COW')
	),
	PITCHFORK: createImageWithCaption(
		[
			[1, 0, 1, 0, 1],
			[1, 0, 1, 0, 1],
			[1, 1, 1, 1, 1],
			[0, 0, 1, 0, 0],
			[0, 0, 1, 0, 0]
		],
		t('knownImages.PITCHFORK')
	),
	SWORD: createImageWithCaption(
		[
			[0, 0, 1, 0, 0],
			[0, 0, 1, 0, 0],
			[0, 0, 1, 0, 0],
			[0, 1, 1, 1, 0],
			[0, 0, 1, 0, 0]
		],
		t('knownImages.SWORD')
	),
	QUESTION_MARK: createImageWithCaption(
		[
			[0, 1, 1, 1, 0],
			[1, 0, 0, 0, 1],
			[0, 0, 1, 1, 0],
			[0, 0, 0, 0, 0],
			[0, 0, 1, 0, 0]
		],
		t('knownImages.QUESTION_MARK')
	)
});

registerOnWindow('COMMON_IMAGES', COMMON_IMAGES);
