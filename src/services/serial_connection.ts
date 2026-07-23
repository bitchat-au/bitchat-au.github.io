export class MicrobitSerialConnection {
    private static BAUD_RATE = 9600;
    private static USB_FILTERS = [
        { usbVendorId: 0x0d28, usbProductId: 0x0204 },
        { usbVendorId: 0x0d28, usbProductId: 0x0206 } // BBC micro:bit
    ];

    private port?: SerialPort;
    private writer?: WritableStreamDefaultWriter;
    private reader?: ReadableStreamDefaultReader;

    private messageListeners: Array<(msg: string) => void> = [];

    private partialMessage = "";

    constructor() {

    }

    public subscribe(callback: (msg: string) => void) {
        this.messageListeners.push(callback);
    }

    private emitMessage(message: string) {
        this.messageListeners.forEach(cur => cur(message));
    }

    public async connect() {
        this.port = await navigator.serial.requestPort({ filters: MicrobitSerialConnection.USB_FILTERS });

        if (!this.port) {
            throw new Error("No port selected");
        }

        await this.port.open({ baudRate: MicrobitSerialConnection.BAUD_RATE });

        if (!this.port.readable) {
            throw new Error("Port is not readable");
        }

        if (!this.port.writable) {
            throw new Error("Port is not writable");
        }

        this.writer = this.port.writable.getWriter();
        this.reader = this.port.readable.getReader();

        this.readLoop();
    }

    public async readLoop() {
        if (!this.reader) {
            console.error("Reader is not initialized");
            return;
        }

        while (true) {
            const { value, done } = await this.reader.read();
            if (done) {
                this.reader.releaseLock();
                break;
            }

            if (!value) {
                continue;
            }
            
            const messageChunk = new TextDecoder().decode(value);
            if (messageChunk === "#") {
                // This signifies the start of a new message, therefore clean the partial message
                this.partialMessage = "";
                continue;
            }

            if (messageChunk === "&") {
                // This signifies the ned of the message, emit the collected message
                this.emitMessage(this.partialMessage);
                continue;
            }

            // If the message wasnt either the start or end characters, push the message to the partialMessage
            this.partialMessage += messageChunk;
        }
    }

    public async write(message: string) {
        if (!this.writer) {
            console.error("Write is not initialized");
            return;
        }

        // All messages sent starts with "__" and ends with "_" to allow the micro:bit to decode the message along with relevant meta data
        const data = new TextEncoder().encode("__" + message + "_" + '\n');
        await this.writer.write(data); 
    } 
}