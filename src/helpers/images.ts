export type ImageMatrix = [[number, number, number, number, number], [number, number, number, number, number], [number, number, number, number, number], [number, number, number, number, number], [number, number, number, number, number]];

// Common images
export const COMMON_IMAGES = Object.freeze({
    HAPPY: [
        [0, 0, 0, 0, 0],
        [0, 1, 0, 1, 0],
        [0, 0, 0, 0, 0],
        [1, 0, 0, 0, 1],
        [0, 1, 1, 1, 0]
    ] as ImageMatrix,
    SAD: [
        [0, 0, 0, 0, 0],
        [0, 1, 0, 1, 0],
        [0, 0, 0, 0, 0],
        [0, 1, 1, 1, 0],
        [1, 0, 0, 0, 1]
    ] as ImageMatrix,
    ["1"]: [
        [0, 0, 1, 0, 0],
        [0, 1, 1, 0, 0],
        [0, 0, 1, 0, 0],
        [0, 0, 1, 0, 0],
        [0, 1, 1, 1, 0]
    ] as ImageMatrix,
    ["2"]: [
        [1, 1, 1, 0, 0],
        [0, 0, 0, 1, 0],
        [0, 1, 1, 0, 0],
        [1, 0, 0, 0, 0],
        [1, 1, 1, 1, 0]
    ] as ImageMatrix,
    ["3"]: [
        [1, 1, 1, 1, 0],
        [0, 0, 0, 1, 0],
        [0, 0, 1, 0, 0],
        [1, 0, 0, 1, 0],
        [0, 1, 1, 0, 0]
    ] as ImageMatrix,
    ["4"]: [
        [0, 0, 1, 1, 0],
        [0, 1, 0, 1, 0],
        [1, 0, 0, 1, 0],
        [1, 1, 1, 1, 1],
        [0, 0, 0, 1, 0]
    ] as ImageMatrix,
    ["5"]: [
        [1, 1, 1, 1, 1],
        [1, 0, 0, 0, 0],
        [1, 1, 1, 1, 0],
        [0, 0, 0, 0, 1],
        [1, 1, 1, 1, 0]
    ] as ImageMatrix,
    ["6"]: [
        [0, 0, 0, 1, 0],
        [0, 0, 1, 0, 0],
        [0, 1, 1, 1, 0],
        [1, 0, 0, 0, 1],
        [0, 1, 1, 1, 0]
    ] as ImageMatrix,
    ["7"]: [
        [1, 1, 1, 1, 1],
        [0, 0, 0, 1, 0],
        [0, 0, 1, 0, 0],
        [0, 1, 0, 0, 0],
        [1, 0, 0, 0, 0]
    ] as ImageMatrix,
    ["8"]: [
        [0, 1, 1, 1, 0],
        [1, 0, 0, 0, 1],
        [0, 1, 1, 1, 0],
        [1, 0, 0, 0, 1],
        [0, 1, 1, 1, 0]
    ] as ImageMatrix,
    ["9"]: [
        [0, 1, 1, 1, 0],
        [1, 0, 0, 0, 1],
        [0, 1, 1, 1, 0],
        [0, 0, 1, 0, 0],
        [0, 1, 0, 0, 0]
    ] as ImageMatrix,
    ["0"]: [
        [0, 1, 1, 0, 0],
        [1, 0, 0, 1, 0],
        [1, 0, 0, 1, 0],
        [1, 0, 0, 1, 0],
        [0, 1, 1, 0, 0]
    ] as ImageMatrix
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
