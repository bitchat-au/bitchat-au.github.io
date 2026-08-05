export function registerOnWindow(key: string, value: unknown): void {
	if (!import.meta.env.DEV) {
		return;
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	(window as any)[key] = value;
}
