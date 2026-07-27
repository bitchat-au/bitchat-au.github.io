import { COMMON_IMAGES, packImage, packImageString, unpackImage, type ImageMatrix } from "../helpers/images";
import { dialogManager } from "./dialog_manager.svelte";
import { Features, features } from "./features.svelte";
import { friendlyLogService, LogType } from "./friendly_log.svelte";
import { MicrobitSerialConnection } from "./serial_connection";

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

class MicrobitService {
    private static _instance: MicrobitService;
    public static get instance(): MicrobitService {
        if (!MicrobitService._instance) {
            MicrobitService._instance = new MicrobitService();
        }
        return MicrobitService._instance;
    }

    private microbitSerial: MicrobitSerialConnection = new MicrobitSerialConnection();

    private alreadyKnown: boolean = false;
    public knownMicrobits: Array<{ name: string, index: number, image: ImageMatrix }> = $state([]);

    private logService = friendlyLogService;

    private constructor() { }

    public async connect() {
        await this.microbitSerial.connect();
        this.microbitSerial.subscribe(this.checkMessage.bind(this));
        if (this.alreadyKnown) {
            this.checkMessage("lc")
        }
    }

    private checkForNewUser(newUser: string) {
        let exists = !!this.knownMicrobits.find(mb => mb.name === newUser);
        if (exists) return;

        let mbIndex = this.knownMicrobits.length
        this.knownMicrobits.push({ name: newUser, index: mbIndex, image: COMMON_IMAGES[mbIndex + 1 as unknown as keyof typeof COMMON_IMAGES] });
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

    private async handleNewMessage(message: string) {
        // "nm_" + senderId + "_" + str(recipientName) + "_" + packedImage + ("_" + encryptionCode if encryptable else "")
        const messageParts = message.split("_");

        let sender = messageParts[1];
        let receiver = messageParts[2];
        let messageImage = unpackImage(messageParts[3]);
        let encryptionCode = messageParts[4] || null;

        console.log("New message received", messageImage);

        this.logService.addLog(LogType.Message, sender, receiver, messageImage, !!encryptionCode);
        console.log({ sender, receiver, messageImage });

        if (features.isActive(Features.Hacker)) {
            console.log("Show hacking menu!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
            this.writeToMB("nmComp");
            // setUpHacking(messageSender, messageReceiver, messageString)
        } else if (features.isActive(Features.Router) && !features.isActive(Features.AutoRouter)) {
            this.writeToMB("nmComp");
            const result = await dialogManager.showPrompt("RouterModal", {
                sender,
                requestedReceiver: receiver,
                message: messageImage
            });

            if (result.type != "success") {
                console.log("Router modal closed without sending message");
                return;
            }

            // Update the receiver to the new receiver selected in the router modal
            receiver = result.data.newReceiver;

            console.log("Router modal result:", result);
        }

        this.writeToMB("sendMessage", sender, receiver, packImage(messageImage));
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

        this.broadcastSettings();
    }

    /**
     * Send a string to the micro:bit
     * If the connection has not been established yet, it will log an error and return.
     * @param type The type of message to send, e.g. "newImg"
     * @param args The arguments to send with the message, e.g. the image string
     */
    async writeToMB<T extends keyof MessagesToMicrobit>(type: T, ...args: MessagesToMicrobit[T]) {
        const message = type + "_" + args.join("_");
        await this.microbitSerial.write(message);
    }

    /**
     * Should convert the input string to a binary string, to be able to send eveything in one message.
     * The micro:bit will then convert the binary back to an image and display it.
     * @param image Image string e.g. "1000101010001000101010001" (10001  01010  00100  01010  10001)
     */
    async writeImageToMB(image: string) {
        this.writeToMB("newImg", packImageString(image));
    }

    public broadcastSettings() {
        this.writeToMB(
            "settings",
            features.enabledFeatures.has(Features.Encryption) ? 1 : 0,
            features.enabledFeatures.has(Features.AutoEncryption) ? 1 : 0,
            features.enabledFeatures.has(Features.Router) ? 1 : 0,
            features.enabledFeatures.has(Features.Beep) ? 1 : 0
        );
    }
}

export const microbitService = MicrobitService.instance;
(window as any).microbitService = microbitService;
