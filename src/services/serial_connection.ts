import { t } from '@i18n';
import EventEmitter, { type EventMap } from '../helpers/event_emitter';
import { FriendlyError } from '../helpers/friendly_error';

type Events = EventMap & {
	message: (msg: string) => void;
	connected: () => void;
	disconnected: () => void;
};

export class MicrobitSerialConnection extends EventEmitter<Events> {
	private static BAUD_RATE = 9600;
	private static USB_FILTERS = [
		{ usbVendorId: 0x0d28, usbProductId: 0x0204 },
		{ usbVendorId: 0x0d28, usbProductId: 0x0206 } // BBC micro:bit
	];

	private port?: SerialPort;
	private writer?: WritableStreamDefaultWriter;
	private reader?: ReadableStreamDefaultReader;

	private partialMessage = '';

	constructor() {
		super();
	}

	public async connect() {
		try {
			this.port = await navigator.serial.requestPort({
				filters: MicrobitSerialConnection.USB_FILTERS
			});
		} catch (error) {
			if (error instanceof DOMException && error.name === 'NotFoundError') {
				throw FriendlyError.fromError(error, t('serial.noPortSelectedError'));
			}
		}

		if (!this.port) {
			throw FriendlyError.fromError(new Error('No port selected'), t('serial.noPortSelectedError'));
		}

		this.port.addEventListener('disconnect', () => this.emit('disconnected'));
		this.port.addEventListener('connect', () => {
			// The connect event is not fired the first time we connect to the port
			// But only on subsequent connections, such as when the micro:bit is unplugged and plugged back in.
			this.openPort();
			console.log('Micro:bit reconnected');
		});

		await this.openPort();
	}

	public async disconnect() {
		if (this.reader) {
			await this.reader.cancel();
			this.reader = undefined;
		}

		if (this.writer) {
			await this.writer.close();
			this.writer = undefined;
		}

		if (this.port) {
			await this.port.close();
			this.port = undefined;
		}

		this.emit('disconnected');
	}

	private async openPort() {
		if (!this.port) {
			throw FriendlyError.fromError(new Error('No port selected'), t('serial.noPortSelectedError'));
		}

		await this.port.open({ baudRate: MicrobitSerialConnection.BAUD_RATE });

		if (!this.port.readable) {
			throw FriendlyError.fromError(new Error('Port is not readable'), t('serial.noPortReadableError'));
		}

		if (!this.port.writable) {
			throw FriendlyError.fromError(new Error('Port is not writable'), t('serial.noPortWritableError'));
		}

		this.writer = this.port.writable.getWriter();
		this.reader = this.port.readable.getReader();

		this.emit('connected');
		this.readLoop();
	}

	public async readLoop() {
		if (!this.reader) {
			return;
		}

		while (true) {
			const { value, done } = await this.reader.read();
			if (done) {
				this.reader.releaseLock();
				this.reader = undefined;
				break;
			}

			if (!value) {
				continue;
			}

			const messageChunk = new TextDecoder().decode(value);
			messageChunk.split('').forEach((character) => this.handleCharacter(character));
		}
	}

	private handleCharacter(character: string) {
		if (character === '#') {
			// This signifies the start of a new message, therefore clean the partial message
			this.partialMessage = '';
			return;
		}

		if (character === '&') {
			// This signifies the ned of the message, emit the collected message
			this.emit('message', this.partialMessage);
			return;
		}

		// If the message wasnt either the start or end characters, push the message to the partialMessage
		this.partialMessage += character;
	}

	public async write(message: string) {
		if (!this.writer) {
			console.error('Write is not initialized');
			return;
		}

		// All messages sent starts with "__" and ends with "_" to allow the micro:bit to decode the message along with relevant meta data
		const data = new TextEncoder().encode('__' + message + '_' + '\n');
		await this.writer.write(data);
	}
}
