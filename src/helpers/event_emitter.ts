// Generic type for an event map where each key has a listener signature
export type EventMap = Record<string, (...args: unknown[]) => void>;

class EventEmitter<T extends EventMap> {
	events: { [K in keyof T]?: T[K][] } = {};

	public addEventListener<K extends keyof T>(event: K | K[], listener: T[K]): this {
		if (Array.isArray(event)) {
			for (const ev of event) {
				this.addEventListener(ev, listener);
			}
			return this;
		}
		if (!this.events[event]) {
			this.events[event] = [];
		}
		this.events[event].push(listener);

		return this;
	}

	public removeEventListener<K extends keyof T>(event: K | K[], listener: T[K]): this {
		if (Array.isArray(event)) {
			for (const ev of event) {
				this.removeEventListener(ev, listener);
			}
			return this;
		}
		const listeners = this.events[event];
		if (!listeners) return this;
		this.events[event] = listeners.filter((l) => l !== listener);

		return this;
	}

	protected emit<K extends keyof T>(event: K, ...args: Parameters<T[K]>): void {
		const listeners = this.events[event];
		if (!listeners) return;
		for (const listener of listeners) {
			listener(...args);
		}
	}
}

export default EventEmitter;
