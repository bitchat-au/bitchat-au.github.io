import type { Component } from "svelte";
import RouterModal from "../lib/components/RouterModal.svelte";

type DialogResult<T extends unknown> =
    { type: "error", error: string } |
    { type: "success", data: T } |
    { type: "closed" }

export interface DialogProps<T extends unknown, R extends unknown> {
    data: T;
    dialogRef: string;
    onError: (err: string) => void;
    onResult: (res: R) => void;
    onClose: () => void
}

interface OpenDialog<K extends AvailableDialogs = AvailableDialogs> {
    dialogRef: string;
    Component: RegisteredDialogs[K];
    data: InferDialogData<K>;
    promiseResolve: (res: DialogResult<InferDialogReturn<K>>) => void;
    promiseReject: (err: Error) => void;
}

type RegisteredDialogs = typeof DialogManager.registeredDialogs;
type AvailableDialogs = keyof RegisteredDialogs;
type InferDialogData<K extends AvailableDialogs> = RegisteredDialogs[K] extends Component<DialogProps<infer Data, unknown>> ? Data : never;
type InferDialogReturn<K extends AvailableDialogs> = RegisteredDialogs[K] extends Component<DialogProps<unknown, infer Return>> ? Return : never;

export class DialogManager {
    private static _instance: DialogManager;
    public static get instance(): DialogManager {
        if (!DialogManager._instance) {
            DialogManager._instance = new DialogManager();
        }
        return DialogManager._instance;
    }

    public static registeredDialogs = {
        RouterModal
    }

    public openDialogs: Array<OpenDialog> = $state([]);

    private constructor() { }

    public showPrompt<K extends AvailableDialogs>(component: K, data: InferDialogData<K>): Promise<DialogResult<InferDialogReturn<K>>> {
        return new Promise((resolve, reject) => {
            const openDialog: OpenDialog<K> = {
                dialogRef: Math.random().toString(),
                Component: DialogManager.registeredDialogs[component],
                data,
                promiseResolve: resolve,
                promiseReject: reject
            }
            
            this.openDialogs.push(openDialog);
        });
    }

    public resolveDialog<K extends AvailableDialogs>(dialog: OpenDialog<K>, result: DialogResult<InferDialogReturn<K>>): void {
        dialog.promiseResolve(result);

        const index = this.openDialogs.indexOf(dialog);
        if (index !== -1) {
            this.openDialogs.splice(index, 1);
        }
    }
}

export const dialogManager = DialogManager.instance;
(window as any).dialogManager = dialogManager;