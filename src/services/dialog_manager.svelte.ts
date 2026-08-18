import type { Component } from 'svelte';
import RouterModal from '../lib/Dialogs/RouterModal.svelte';
import HackerModal from '../lib/Dialogs/HackerModal.svelte';
import { registerOnWindow } from '../helpers/window';
import GenericConfirmation from '../lib/Dialogs/GenericConfirmation.svelte';

type DialogResult<T> =
	{ type: 'error'; error: string } | { type: 'success'; data: T } | { type: 'closed' };

export interface DialogProps<Data, Return> {
	data: Data;
	id: string;
	onError: (err: string) => void;
	onResult: (res: Return) => void;
	onClose: () => void;
}

interface OpenDialog<K extends AvailableDialogs = AvailableDialogs> {
	dialogRef: K;
	id: string;
	data: InferDialogData<K>;
	timeout: ReturnType<typeof setTimeout> | null;
}

type DialogOptions = {
	timeout?: number;
};

type RegisteredDialogs = typeof registeredDialogs;
type AvailableDialogs = keyof RegisteredDialogs;
type InferDialogData<K extends AvailableDialogs> = DialogPropsOf<K>['data'];
type InferDialogReturn<K extends AvailableDialogs> = DialogPropsOf<K>['return'];

type DialogPropsOf<K extends AvailableDialogs> =
	RegisteredDialogs[K] extends Component<DialogProps<infer Data, infer Return>>
		? { data: Data; return: Return }
		: never;

export const registeredDialogs = {
	RouterModal,
	HackerModal,
	GenericConfirmation
};

export const openDialogs: Array<OpenDialog> = $state([]);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const promises: Record<string, { resolve: (res: any) => void; reject: (err: Error) => void }> = {};

export function showPrompt<K extends AvailableDialogs>(
	component: K,
	data: InferDialogData<K>,
	options: DialogOptions = {}
): Promise<DialogResult<InferDialogReturn<K>>> {
	const dialog: OpenDialog<K> = {
		id: Math.random().toString(),
		dialogRef: component,
		data,
		timeout: options.timeout
			? setTimeout(() => {
					resolveDialog(dialog, { type: 'closed' });
				}, options.timeout)
			: null
	};

	openDialogs.push(dialog);

	return new Promise((resolve, reject) => {
		const promiseRef = { resolve, reject };
		promises[dialog.id] = promiseRef;
	});
}

export function resolveDialog<K extends AvailableDialogs>(
	dialog: OpenDialog<K>,
	result: DialogResult<InferDialogReturn<K>>
): void {
	const promiseRef = promises[dialog.id];
	if (!promiseRef) {
		console.error(`No promise found for dialog with id ${dialog.id}`);
		return;
	}

	if (result.type === 'error') {
		promiseRef.reject(new Error(result.error));
	} else {
		promiseRef.resolve(result);
	}

	delete promises[dialog.id];

	clearTimeout(dialog.timeout || undefined);
	const index = openDialogs.findIndex((d) => d.id === dialog.id);
	if (index !== -1) {
		openDialogs.splice(index, 1);
	}
}

export function unpackDialogResult<T>(result: DialogResult<T>): T | undefined {
	if (result.type === 'success') {
		return result.data;
	}

	return undefined;
}

if (import.meta.env.DEV) {
	registerOnWindow('dialogManager', { openDialogs, showPrompt, resolveDialog });
}
