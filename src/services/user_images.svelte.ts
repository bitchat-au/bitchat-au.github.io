import { areImagesEqual, type ImageMatrix } from "../helpers/images";

export let userImages: ImageMatrix[] = $state(loadFromLocalStorage() ?? []);

export function addUserImage(image: ImageMatrix) {
    const exists = userImages.some(img => areImagesEqual(img, image));
    if (exists) return false;
    
    userImages.push(image);
    saveToLocalStorage();
    return true;
}

export function removeUserImage(image: ImageMatrix) {
    const index = userImages.findIndex(img => areImagesEqual(img, image));
    if (index !== -1) {
        userImages.splice(index, 1);
        saveToLocalStorage();
        return true;
    }

    return false;
}

function saveToLocalStorage() {
    localStorage.setItem("userImages", JSON.stringify(userImages));
}

function loadFromLocalStorage() {
    const storedImages = localStorage.getItem("userImages");
    if (storedImages) {
        return JSON.parse(storedImages);
    }
}
