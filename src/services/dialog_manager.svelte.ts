import type { Component } from "svelte";
import RouterModal from "../lib/Dialogs/RouterModal.svelte";

type DialogResult<T extends unknown> =
    { type: "error", error: string } |
    { type: "success", data: T } |
    { type: "closed" }

export interface DialogProps<Data extends unknown, Return extends unknown> {
    data: Data;
    id: string;
    onError: (err: string) => void;
    onResult: (res: Return) => void;
    onClose: () => void
}

interface OpenDialog<K extends AvailableDialogs = AvailableDialogs> {
    dialogRef: K;
    id: string;
    data: InferDialogData<K>;
    promiseResolve: (res: DialogResult<InferDialogReturn<K>>) => void;
    promiseReject: (err: Error) => void;
}

type RegisteredDialogs = typeof registeredDialogs;
type AvailableDialogs = keyof RegisteredDialogs;
type InferDialogData<K extends AvailableDialogs> = DialogPropsOf<K>["data"];
type InferDialogReturn<K extends AvailableDialogs> = DialogPropsOf<K>["return"];

type DialogPropsOf<K extends AvailableDialogs> =
    RegisteredDialogs[K] extends Component<DialogProps<infer Data, infer Return>>
        ? { data: Data; return: Return }
        : never;

export const registeredDialogs = {
    RouterModal
}

export const openDialogs: Array<OpenDialog> = $state([]);

export function showPrompt<K extends AvailableDialogs>(component: K, data: InferDialogData<K>): Promise<DialogResult<InferDialogReturn<K>>> {
    return new Promise((resolve, reject) => {
        const openDialog: OpenDialog<K> = {
            id: Math.random().toString(),
            dialogRef: component,
            data,
            promiseResolve: resolve,
            promiseReject: reject
        }
        
        openDialogs.push(openDialog);
    });
}

export function resolveDialog<K extends AvailableDialogs>(
    dialog: OpenDialog<K>,
    result: DialogResult<InferDialogReturn<K>>
): void {
        dialog.promiseResolve(result);

    const index = openDialogs.indexOf(dialog);
    if (index !== -1) {
        openDialogs.splice(index, 1);
    }
}

if (import.meta.env.DEV) {
    (window as any).dialogManager = { openDialogs, showPrompt, resolveDialog };
}