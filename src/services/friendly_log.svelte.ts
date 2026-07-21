import type { ImageMatrix } from "./microbit.svelte";

export enum LogType {
    Device,
    Message
}

export interface FriendLogs {
    [LogType.Device]: [deviceName: string, event: 'join'],
    [LogType.Message]: [senderName: string, recipientName: string, message: ImageMatrix, encrypted: boolean]
}

type LogEntry<K extends keyof FriendLogs = keyof FriendLogs> = {
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

    private _logs: LogEntry[] = $state([]);
    public get logs() {
        return this._logs;
    }

    private constructor() { }

    public addLog<K extends keyof FriendLogs>(type: K, ...args: FriendLogs[K]): void {
        this._logs.push({ type, message: args });
    }

    public formatLogEntry(entry: LogEntry): string {
        switch (entry.type) {
            case LogType.Device:
                return "unimplemented";
            case LogType.Message:
                const [senderName, recipientName, message, encrypted] = entry.message as FriendLogs[LogType.Message];
                const messageAsString = message.map(row => row.join('')).join(":");
                return `[${senderName}]-->[${recipientName}]---${messageAsString} ${encrypted ? "🔑" : ""}`;
            default:
                const logType: never = entry.type;
                throw new Error(`Unhandled log type: ${logType}`);
        }
    }
}

export const friendlyLogService = FriendlyLogService.instance;
