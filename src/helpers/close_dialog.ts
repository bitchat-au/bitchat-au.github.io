/**
 * Svelte use directive that closes the nearest dialog when the button is clicked.
 * @param element The button element that is used to close the dialog.
 */
export function closeNearestDialog(element: HTMLButtonElement): void {
	const dialog = element.closest('dialog');
	element.command = "close";
	element.commandForElement = dialog as HTMLDialogElement;
}