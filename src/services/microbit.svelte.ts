import { Features, features } from "./features.svelte";

const filters = [
    { usbVendorId: 0x0d28, usbProductId: 0x0204 },
    { usbVendorId: 0x0d28, usbProductId: 0x0206 } // BBC micro:bit
];

const newImages: string[] = [];

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

    private newMessageList: [[boolean, string], [boolean, string], [boolean, string], [boolean, string], [boolean, string], [string, string]] = [[false, ""], [false, ""], [false, ""], [false, ""], [false, ""], ["", ""]];
    // private lastMessageStats: string[] = ["", "", ""];
    private lastMessageStats: { receiver: string, sender: string, message: string[] } = { receiver: "", sender: "", message: ["", "", "", "", ""] };
    private lastMessage: string = "";
    private lastResetTime: number = new Date().getTime() / 1000;
    private messageIndex: number = 0;
    private messageLog: string[] = [];

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
        console.log("checking " + newUser)
        let isNew = true;

        for (let i = 0; i < this.knownMicrobits.length; i++) {
            if (this.knownMicrobits[i].name == newUser) {
                isNew = false;
            }
        }

        if (isNew) {
            let mbIndex = this.knownMicrobits.length
            this.messageIndex += 1;
            this.knownMicrobits.push({ name: newUser, index: mbIndex });
            localStorage.setItem("knownMicrobits", JSON.stringify(this.knownMicrobits));

            console.log("Show image icon!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
            // createBlockId(mbIndex);
        }
        console.log(this.knownMicrobits)
    }

    public checkMessage(message: string) {
        //console.log("nm = " + message.toString())
        //console.log("lm = " + lastMessage.toString())
        if (message.startsWith("debug") || message.startsWith("echo")) {
            console.log(message);
            
        }

        if (this.lastMessage != "" && message.toString().match(this.lastMessage.toString()) && this.lastMessage != "lc") {
            console.log("Damn")
            return;

        }
        this.lastMessage = message;
        let messageCode = message.split("_")[0];

        

        if (messageCode == "nu") { // new user
            let mbID = message.split("_")[2]
            if (mbID.length == 5) {

                this.checkForNewUser(mbID);
            }
        }
        if (messageCode == "nm") { // new message
            // "nm_" + senderId + "_" + str(recipientName) + "_" + packedImage + ("_" + encryptionCode if encryptable else "")
            const messageParts = message.split("_");
            
            let messageSender = messageParts[1];
            let messageReceiver = messageParts[2];
            let messageImage = unpackImage(messageParts[3]);

            console.log("New message received", messageImage);
            console.log("complete")
    
            let messageString = messageImage.map(row => row.join(''));

            let timeDifference = new Date().getTime() / 1000 - this.lastResetTime
            //console.log(timeDifference)


            if (timeDifference > 12) {
                this.lastResetTime = new Date().getTime() / 1000;
                console.log(timeDifference)
                console.log("checking")
                this.lastMessageStats = { receiver: messageReceiver, sender: messageSender, message: messageString };

                let messageAsString = "";
                for (let i = 0; i < messageString.length; i++) {
                    if (i > 0) {
                        messageAsString += "-"
                    }
                    messageAsString += messageString[i]
                }
                let messageForLog = messageSender + "_" + messageReceiver + "_" + messageAsString
                this.messageLog.push(messageForLog)
                localStorage.setItem("messageLog", JSON.stringify(this.messageLog));

                console.log({messageSender, messageReceiver, messageString});
                

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
                    this.writeToMB("ready");
                    setTimeout(() => this.resetValues(), 2000);
                }
            }
        }
        if (messageCode == "mbc") { // microBit count
            //console.log(knownMicrobits.length + " _ vs _ " + message.split("_")[1])
            if (this.knownMicrobits.length != Number(message.split("_")[1])) {
                console.log("something went wrong")
                this.writeToMB("count");
            }

        }

        if (messageCode == "lc") { // microBit count
            //console.log(this.knownMicrobits.length + " _ vs _ " + message.split("_")[1])
            console.log("Lost connection!")
            this.writeToMB("start");
            this.rebuildConnection()

        }
    }

    public rebuildConnection() {
        console.log("rebuilding")
        for (let i = 0; i < this.knownMicrobits.length; i++) {
            this.writeToMB("known_" + this.knownMicrobits[i].name)
        }
        if (newImages.length > 0) {
            for (let i = 0; i < newImages.length; i++) {
                this.writeToMB("knownImg_" + packImageString(newImages[i]))
            }
        }
        if (features.isActive(Features.Encryption)) {
            this.writeToMB("yesEncrypt")
        }
        if (features.isActive(Features.Router)) {
            this.writeToMB("yesRecipient")
        }
    }

    public resetValues() {
        for (let i = 0; i < 5; i++) {
            this.newMessageList[i][0] = false;
            this.newMessageList[i][1] = "";
        }
        this.newMessageList[5][0] = "";
        this.newMessageList[5][1] = "";
        this.lastResetTime = new Date().getTime() / 1000;
    }

    /**
     * Send a string to the micro:bit a-b-b-a-a
     * If the connection has not been established by the start of the program, we establish it here.
     * @param {str} message   The message to transfer to the microbit
     */
    async writeToMB(message: string) {
        //event.preventDefault();
        if (!this.port || !this.writer) {
            console.error("Port is not initialized");
            return;
        }
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
        this.writeToMB("newImg_" + packImageString(image));
    }
}

export const microbitService = MicrobitService.instance;
(window as any).microbitService = microbitService;

const packImageString = (imgString: string): string => packImage(imgString.split(":").map(row => row.split("").map(Number)))

function packImage(matrix: number[][]): string {
    return matrix.map(row => {
        const val = parseInt(row.join(''), 2);
        return val <= 25 ? String.fromCharCode(val + 65) : (val - 26).toString();
    }).join('');
}

function unpackImage(payload: string): number[][] {
    return payload.split('').map(char => {
        const val = /[0-5]/.test(char) ? parseInt(char, 10) + 26 : char.charCodeAt(0) - 65;
        const binaryString = val.toString(2).padStart(5, '0');
        return binaryString.split('').map(bit => parseInt(bit, 10));
    });
}
