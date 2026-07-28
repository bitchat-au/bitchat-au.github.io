import { areImagesEqual, packImage, type ImageMatrix } from "../helpers/images";
import { microbitService } from "./microbit.svelte";

export let userImages: ImageMatrix[] = $state(loadFromLocalStorage() ?? []);

export function addUserImage(image: ImageMatrix) {
    const exists = userImages.some(img => areImagesEqual(img, image));
    if (exists) return;
    
    userImages.push(image);
    microbitService.writeImageToMB(image);
    saveToLocalStorage();
}

export function removeUserImage(image: ImageMatrix) {
    const index = userImages.findIndex(img => areImagesEqual(img, image));
    if (index !== -1) {
        userImages.splice(index, 1);
        microbitService.removeImageFromMB(image);
        saveToLocalStorage();
    }
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
