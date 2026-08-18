import { showPrompt } from '../services/dialog_manager.svelte';
import { registerOnWindow } from './window';

export async function confirm(
	title: string,
	text: string,
	options: { showCancelButton?: boolean; cancelText?: string; confirmText?: string } = {}
): Promise<boolean> {
	const result = await showPrompt('GenericConfirmation', {
		title,
		text,
		showCancelButton: options.showCancelButton,
		cancelText: options.cancelText,
		confirmText: options.confirmText
	});

	return result.type === 'success' && result.data;
}

export async function alert(
	title: string,
	text: string,
	options: { confirmText?: string } = {}
): Promise<void> {
	await showPrompt('GenericConfirmation', {
		title,
		text,
		showCancelButton: false,
		confirmText: options.confirmText
	});
}

registerOnWindow('confirm', confirm);
registerOnWindow('alert', alert);