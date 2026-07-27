import type { ImageMatrix } from "../helpers/images";

export enum LogType {
    Device,
    Message
}

export interface FriendLogs {
    [LogType.Device]: [deviceName: string, event: 'join'],
    [LogType.Message]: [senderName: string, recipientName: string, message: ImageMatrix, encrypted: boolean]
}

export type LogEntry<K extends keyof FriendLogs = keyof FriendLogs> = {
    type: K;
    message: FriendLogs[K];
};

class FriendlyLogService {
    private static _instance: FriendlyLogService;
    public static get instance(): FriendlyLogService {
        if (!FriendlyLogService._instance) {
            FriendlyLogService._instance = new FriendlyLogService();
        }
        return FriendlyLogService._instance;
    }

    private static LOG_STORAGE_KEY = "friendlyLogs";

    private _logs: LogEntry[] = $state(this.loadLogsFromLocalStorage());
    public get logs() {
        return this._logs;
    }

    private constructor() { }

    public addLog<K extends keyof FriendLogs>(type: K, ...args: FriendLogs[K]): void {
        this._logs.push({ type, message: args });
        this.saveLogsToLocalStorage();
    }

    private saveLogsToLocalStorage(): void {
        localStorage.setItem(FriendlyLogService.LOG_STORAGE_KEY, JSON.stringify(this._logs));
    }

    private loadLogsFromLocalStorage(): LogEntry[] {
        const logsJson = localStorage.getItem(FriendlyLogService.LOG_STORAGE_KEY);
        if (logsJson) {
            try {
                const parsedLogs: LogEntry[] = JSON.parse(logsJson);
                return parsedLogs;
            } catch (error) {
                console.error("Failed to parse logs from local storage:", error);
            }
        }

        return [];
    }

    public clearLogs(): void {
        this._logs.length = 0;
        localStorage.removeItem(FriendlyLogService.LOG_STORAGE_KEY);
    }
}

export const friendlyLogService = FriendlyLogService.instance;
