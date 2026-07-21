import { Features, features } from "./features.svelte";
import { friendlyLogService, LogType } from "./friendly_log.svelte";

const filters = [
    { usbVendorId: 0x0d28, usbProductId: 0x0204 },
    { usbVendorId: 0x0d28, usbProductId: 0x0206 } // BBC micro:bit
];

const newImages: string[] = [];

type BooleanInt = 0 | 1;
interface MessagesToMicrobit {
    nmComp: [],
    sendMessage: [senderName: string, recipientName: string, packedImage: string],
    newImg: [packedImage: string],
    known: [microbitName: string],
    knownImg: [packedImage: string],
    settings: [encryptable: BooleanInt, autoEncryptable: BooleanInt, allowRecipient: BooleanInt, shouldBeep: BooleanInt],
    forgetAll: [],
    start: [],
    count: []
}
export type ImageMatrix = [[number, number, number, number, number], [number, number, number, number, number], [number, number, number, number, number], [number, number, number, number, number], [number, number, number, number, number]];

class MicrobitService {
    private static _instance: MicrobitService;
    public static get instance(): MicrobitService {
        if (!MicrobitService._instance) {
            MicrobitService._instance = new MicrobitService();
        }
        return MicrobitService._instance;
    }

    private port?: SerialPort;
    private writer?: WritableStreamDefaultWriter;
    private reader?: ReadableStreamDefaultReader;

    private alreadyKnown: boolean = false;
    private knownMicrobits: Array<{ name: string, index: number }> = [];
    private messageConstruct: string[] = [];

    private lastMessage: string = "";
    private messageLog: string[] = [];
    private logService = friendlyLogService;

    private constructor() { }

    public async connect() {
        console.log("looking for port")
        this.port = await navigator.serial.requestPort({ filters });

        if (!this.port) {
            console.error("No port selected");
            return;
        }

        await this.port.open({ baudRate: 9600 });

        if (!this.port.readable || !this.port.writable) {
            console.error("Port is not readable or writable");
            return;
        }

        this.writer = this.port.writable.getWriter();
        this.reader = this.port.readable.getReader();
        this.readLoop();
        if (this.alreadyKnown) {
            this.checkMessage("lc")
        }
    }

    async readLoop() {
        if (!this.reader) {
            console.error("Reader is not initialized");
            return;
        }

        while (true) {
            const { value, done } = await this.reader.read();
            if (value) {
                let collectedInput = new TextDecoder().decode(value);
                if (collectedInput == "#") {
                    // Clean list of collected characters
                    while (this.messageConstruct.length > 0) {
                        this.messageConstruct.pop();
                    }
                }
                else if (collectedInput == "&") {
                    // Construct a message from the list of collected characters
                    let output = this.messageConstruct.toString().split(",").join("")
                    // Now we check what is in the message we have constructed
                    this.checkMessage(output)
                }
                else {
                    // Add to list of collected characters
                    this.messageConstruct.push(collectedInput)
                }
            }
            if (done) {
                this.reader.releaseLock();
                break;
            }
        }
    }

    private checkForNewUser(newUser: string) {
        let exists = !!this.knownMicrobits.find(mb => mb.name === newUser);
        if (exists) return;

        let mbIndex = this.knownMicrobits.length
        this.knownMicrobits.push({ name: newUser, index: mbIndex });
        localStorage.setItem("knownMicrobits", JSON.stringify(this.knownMicrobits));

        console.error("Show image icon!!!!!!!!!!!!!!!!!!!!");
        // createBlockId(mbIndex);
        console.log("Known microbits:", this.knownMicrobits)
    }

    public checkMessage(message: string) {
        //console.log("nm = " + message.toString())
        //console.log("lm = " + lastMessage.toString())
        if (message.startsWith("debug") || message.startsWith("echo")) {
            console.debug(message);

            return;
        }

        if (this.lastMessage != "" && message.toString().match(this.lastMessage.toString()) && this.lastMessage != "lc") {
            console.log("Damn")
            return;

        }

        this.lastMessage = message;
        let messageCode = message.split("_")[0];

        switch (messageCode) {
            case "nu":
                let mbID = message.split("_")[2]
                this.checkForNewUser(mbID);
                this.logService.addLog(LogType.Device, mbID, 'join');
                break;
            case "nm":
                this.handleNewMessage(message);
                break;
            case "mbc":
                if (this.knownMicrobits.length != Number(message.split("_")[1])) {
                    console.log("microbit count mismatch, rebuilding connection")
                    this.writeToMB("count");
                }
                break;
            case "lc":
                console.log("Lost connection!")
                this.writeToMB("start");
                this.rebuildConnection();
                break;
            default:
                console.log("Unknown message: " + message);
                break;
        }
    }

    private handleNewMessage(message: string) {
        // "nm_" + senderId + "_" + str(recipientName) + "_" + packedImage + ("_" + encryptionCode if encryptable else "")
        const messageParts = message.split("_");

        let messageSender = messageParts[1];
        let messageReceiver = messageParts[2];
        let messageImage = unpackImage(messageParts[3]);
        let encryptionCode = messageParts[4] || null;

        console.log("New message received", messageImage);

        this.logService.addLog(LogType.Message, messageSender, messageReceiver, messageImage, !!encryptionCode);
        console.log({ messageSender, messageReceiver, messageImage });

        if (features.isActive(Features.Hacker)) {
            console.log("Show hacking menu!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
            this.writeToMB("nmComp");
            // setUpHacking(messageSender, messageReceiver, messageString)
        } else if (features.isActive(Features.Router) && !features.isActive(Features.AutoRouter)) {
            console.log("let it start!")
            this.writeToMB("nmComp");
            console.log("Show routing menu!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
            // setUpChanger(messageSender, messageReceiver, messageString)
        } else {
            console.log("Show message in log!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
            this.writeToMB("sendMessage", messageSender, messageReceiver, packImage(messageImage));
        }
    }

    public rebuildConnection() {
        console.log("rebuilding")

        console.log({
            knownMicrobits: this.knownMicrobits,
            knownImages: newImages,
            encryption: features.isActive(Features.Encryption),
            router: features.isActive(Features.Router)
        });


        for (let i = 0; i < this.knownMicrobits.length; i++) {
            this.writeToMB("known", this.knownMicrobits[i].name)
        }
        if (this.knownMicrobits.length == 0) {
            this.writeToMB("forgetAll");
        }

        for (let i = 0; i < newImages.length; i++) {
            this.writeToMB("knownImg", packImageString(newImages[i]))
        }

        this.writeToMB(
            "settings",
            features.isActive(Features.Encryption) ? 1 : 0,
            features.isActive(Features.AutoEncryption) ? 1 : 0,
            features.isActive(Features.Router) ? 1 : 0,
            1
        );
    }

    /**
     * Send a string to the micro:bit
     * If the connection has not been established yet, it will log an error and return.
     * @param type The type of message to send, e.g. "newImg"
     * @param args The arguments to send with the message, e.g. the image string
     */
    async writeToMB<T extends keyof MessagesToMicrobit>(type: T, ...args: MessagesToMicrobit[T]) {
        //event.preventDefault();
        if (!this.port || !this.writer) {
            console.error("Port is not initialized");
            return;
        }

        const message = type + "_" + args.join("_");

        // All messages sent starts with "__" and ends with "_" to allow the micro:bit to decode the message along with relevant meta data
        const data = new TextEncoder().encode("__" + message + "_" + '\n');
        await this.writer.write(data);
    }

    /**
     * Should convert the input string to a binary string, to be able to send eveything in one message.
     * The micro:bit will then convert the binary back to an image and display it.
     * @param image Image string e.g. "1000101010001000101010001" (10001  01010  00100  01010  10001)
     */
    async writeImageToMB(image: string) {
        this.writeToMB("newImg", packImageString(image));
    }
}

export const microbitService = MicrobitService.instance;
(window as any).microbitService = microbitService;

const packImageString = (imgString: string): string => {
    const rows = imgString.split(":");
    if (rows.length !== 5) {
        throw new Error("Invalid image string. Must have 5 rows.");
    }

    // Validate each row to ensure it has exactly 5 characters and only contains '0' or '1'
    if (rows.some(row => row.length !== 5 || !/^[01]{5}$/.test(row))) {
        throw new Error("Invalid image string. Each row must have 5 characters of 0s and 1s.");
    }

    const matrix = imgString.split(":").map(row => row.split("").map(Number)) as ImageMatrix;
    return packImage(matrix);
}

function packImage(matrix: ImageMatrix): string {
    return matrix.map(row => {
        const val = parseInt(row.join(''), 2);
        return val <= 25 ? String.fromCharCode(val + 65) : (val - 26).toString();
    }).join('');
}

function unpackImage(payload: string): ImageMatrix {
    if (payload.length !== 5) {
        throw new Error("Invalid payload length. Must be 5 characters.");
    }

    if (!/^[A-Z0-5]{5}$/.test(payload)) {
        throw new Error("Invalid payload characters. Must be A-Z or 0-5.");
    }

    return payload.split('').map(char => {
        const val = /[0-5]/.test(char) ? parseInt(char, 10) + 26 : char.charCodeAt(0) - 65;
        const binaryString = val.toString(2).padStart(5, '0');
        return binaryString.split('').map(bit => parseInt(bit, 10));
    }) as ImageMatrix;
}
