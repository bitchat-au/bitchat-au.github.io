export type ImageMatrix = [[number, number, number, number, number], [number, number, number, number, number], [number, number, number, number, number], [number, number, number, number, number], [number, number, number, number, number]];
export type ImageMatrixWithCaption = ImageMatrix & { [CAPTION_KEY]: string };

const CAPTION_KEY = "__a11y_caption__";

const createImageWithCaption = (matrix: ImageMatrix, caption: string): ImageMatrixWithCaption => {
    Object.defineProperty(matrix, CAPTION_KEY, {
        value: caption,
        writable: false,
        enumerable: false,
        configurable: false
    });
    return matrix as ImageMatrixWithCaption;
}

// Common images
export const COMMON_IMAGES = Object.freeze({
    HAPPY: createImageWithCaption([
        [0, 0, 0, 0, 0],
        [0, 1, 0, 1, 0],
        [0, 0, 0, 0, 0],
        [1, 0, 0, 0, 1],
        [0, 1, 1, 1, 0]
    ], "Happy face"),
    SAD: createImageWithCaption([
        [0, 0, 0, 0, 0],
        [0, 1, 0, 1, 0],
        [0, 0, 0, 0, 0],
        [0, 1, 1, 1, 0],
        [1, 0, 0, 0, 1]
    ], "Sad face"),
    FULL: createImageWithCaption([
        [1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1]
    ], "5 by 5 image fully filled"),
    EMPTY: createImageWithCaption([
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0]
    ], "5 by 5 image empty"),
    ["1"]: createImageWithCaption([
        [0, 0, 1, 0, 0],
        [0, 1, 1, 0, 0],
        [0, 0, 1, 0, 0],
        [0, 0, 1, 0, 0],
        [0, 1, 1, 1, 0]
    ], "Digit 1"),
    ["2"]: createImageWithCaption([
        [1, 1, 1, 0, 0],
        [0, 0, 0, 1, 0],
        [0, 1, 1, 0, 0],
        [1, 0, 0, 0, 0],
        [1, 1, 1, 1, 0]
    ], "Digit 2"),
    ["3"]: createImageWithCaption([
        [1, 1, 1, 1, 0],
        [0, 0, 0, 1, 0],
        [0, 0, 1, 0, 0],
        [1, 0, 0, 1, 0],
        [0, 1, 1, 0, 0]
    ], "Digit 3"),
    ["4"]: createImageWithCaption([
        [0, 0, 1, 1, 0],
        [0, 1, 0, 1, 0],
        [1, 0, 0, 1, 0],
        [1, 1, 1, 1, 1],
        [0, 0, 0, 1, 0]
    ], "Digit 4"),
    ["5"]: createImageWithCaption([
        [1, 1, 1, 1, 1],
        [1, 0, 0, 0, 0],
        [1, 1, 1, 1, 0],
        [0, 0, 0, 0, 1],
        [1, 1, 1, 1, 0]
    ], "Digit 5"),
    ["6"]: createImageWithCaption([
        [0, 0, 0, 1, 0],
        [0, 0, 1, 0, 0],
        [0, 1, 1, 1, 0],
        [1, 0, 0, 0, 1],
        [0, 1, 1, 1, 0]
    ], "Digit 6"),
    ["7"]: createImageWithCaption([
        [1, 1, 1, 1, 1],
        [0, 0, 0, 1, 0],
        [0, 0, 1, 0, 0],
        [0, 1, 0, 0, 0],
        [1, 0, 0, 0, 0]
    ], "Digit 7"),
    ["8"]: createImageWithCaption([
        [0, 1, 1, 1, 0],
        [1, 0, 0, 0, 1],
        [0, 1, 1, 1, 0],
        [1, 0, 0, 0, 1],
        [0, 1, 1, 1, 0]
    ], "Digit 8"),
    ["9"]: createImageWithCaption([
        [0, 1, 1, 1, 0],
        [1, 0, 0, 0, 1],
        [0, 1, 1, 1, 0],
        [0, 0, 1, 0, 0],
        [0, 1, 0, 0, 0]
    ], "Digit 9"),
    ["0"]: createImageWithCaption([
        [0, 1, 1, 0, 0],
        [1, 0, 0, 1, 0],
        [1, 0, 0, 1, 0],
        [1, 0, 0, 1, 0],
        [0, 1, 1, 0, 0]
    ], "Digit 0")
})

export const packImageString = (imgString: string): string => {
    const rows = imgString.split(":");
    if (rows.length !== 5) {
        throw new Error("Invalid image string. Must have 5 rows.");
    }

    // Validate each row to ensure it has exactly 5 characters and only contains '0' or '1'
    if (rows.some(row => row.length !== 5 || !/^[01]{5}$/.test(row))) {
        throw new Error("Invalid image string. Each row must have 5 characters of 0s and 1s.");
    }

    const matrix = imgString.split(":").map(row => row.split("").map(Number)) as ImageMatrix;
    return packImage(matrix);
}

export function packImage(matrix: ImageMatrix): string {
    return matrix.map(row => {
        const val = parseInt(row.join(''), 2);
        return val <= 25 ? String.fromCharCode(val + 65) : (val - 26).toString();
    }).join('');
}

export function unpackImage(payload: string): ImageMatrix {
    if (payload.length !== 5) {
        throw new Error("Invalid payload length. Must be 5 characters.");
    }

    if (!/^[A-Z0-5]{5}$/.test(payload)) {
        throw new Error("Invalid payload characters. Must be A-Z or 0-5.");
    }

    return payload.split('').map(char => {
        const val = /[0-5]/.test(char) ? parseInt(char, 10) + 26 : char.charCodeAt(0) - 65;
        const binaryString = val.toString(2).padStart(5, '0');
        return binaryString.split('').map(bit => parseInt(bit, 10));
    }) as ImageMatrix;
}

export const getImageCaption = (matrix: ImageMatrix | undefined | null): string | undefined => {
    if (matrix && matrix.hasOwnProperty(CAPTION_KEY)) {
        return (matrix as ImageMatrixWithCaption)[CAPTION_KEY];
    }
    return undefined;
}
