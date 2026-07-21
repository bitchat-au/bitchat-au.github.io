radioChannel = 1

# Imports go at the top
from microbit import *
import radio
uart.init()


knownMicrobits = []         # list of active micro:bits
generatedImages = []        # Images created by students, packed images
#constructingImage = [[False, ""], [False, ""], [False, ""], [False, ""], [False, ""]]
display.show(Image.SQUARE_SMALL)
messageUnderConstruction = False
senderName = ""
recipientName = ""
messageConstructIndex = [False, False, False, False, False]
messageConstruct = ["", "", "", "", ""]
messageComplete = False
uartOver = False
sendOnPermitted = False
encryptable = False
autoEncryptable = False
allowRecipient = False
shouldBeep = False
encryptionCode = ""
receiveFromKnown = []
packedImage = ""

###################################################
## Setup for the radio:
###################################################
radio.config(group=radioChannel, power=7, data_rate=radio.RATE_1MBIT, queue=10, channel=42)
radio.on()
radiostart = False

###################################################
## Assisting functions
###################################################

# Function to produce the correct message format for the computer
def writeToComputer(message):
    print("#" + str(message) + "&")

def broadcastSettings():
    # settings_| isEncryptable |_| autoEncrypt |_| allowRecipient |_| shouldBeep |
    sendRadioMessage(
        "settings_" +
        ("1" if encryptable else "0") + "_" +
        ("1" if autoEncryptable else "0") + "_" +
        ("1" if allowRecipient else "0") + "_" +
        ("1" if shouldBeep else "0")
    )

def packImage(matrix):
    """Converts a 5x5 matrix into a 5-char alphanumeric string (A-Z, 0-5)."""
    return "".join(
        chr(v + 65) if v <= 25 else str(v - 26) 
        for v in (int("".join(map(str, row)), 2) for row in matrix)
    )

def unpackImage(payload):
    """Converts a 5-char alphanumeric string back into a 5x5 matrix."""
    return [
        [int(bit) for bit in "{:05b}".format(int(c) + 26 if c.isdigit() else ord(c) - 65)] 
        for c in payload
    ]

def sendRadioMessage(message):
    log("sm_" + message) # sm: send message
    radio.send(message)

def log(message):
    writeToComputer("debug_" + message) # debug: log message

writeToComputer("lc") # Lost connection
###################################################
## Loop
###################################################
while True:
    # Listen for input from computer before listening for radio input
    if uart.any():
        sleep(300)        # Give time for the full message to be received
        uartmessage = str(uart.readline())
        if 'start' in uartmessage:
            display.show(Image.SQUARE)
            radiostart = True

    while radiostart:
        # Listen for serial input
        if uart.any():
            sleep(300)        # Give time for the full message to be received
            uartmessage = str(uart.readline())
            if 'echo' in uartmessage:        # Echo the message back to the computer
                writeToComputer("echo_" + uartmessage.split("_")[3])
            if 'count' in uartmessage:        # Get update on number of known micro:bits by the computer
                for i, known in enumerate(knownMicrobits):
                    writeToComputer("nu_" + str(i) + "_" + str(known).split("'")[1])
            if 'nmComp' in uartmessage:      # If all of the message has been received
                uartOver = True
            if 'sendMessage' in uartmessage:
                senderName = uartmessage.split("_")[3]
                recipientName = uartmessage.split("_")[4]
                packedImage = uartmessage.split("_")[5]
                sendOnPermitted = True
                uartOver = True
            if 'newImg' in uartmessage:
                imageIndex = len(generatedImages)
                packedImage = uartmessage.split("_")[3]
                generatedImages.append(packedImage)

                sendRadioMessage("newImg_" + str(imageIndex) + "_" + packedImage)
            if 'known' in uartmessage:
                knownMicrobits.append([uartmessage.split("_")[3]])
            if 'knownImg' in uartmessage:
                imageIndex = len(generatedImages)
                generatedImages.append(uartmessage.split("_")[3])
            if 'settings' in uartmessage:
                encryptable = uartmessage.split("_")[3] == "1"
                autoEncryptable = uartmessage.split("_")[4] == "1"
                allowRecipient = uartmessage.split("_")[5] == "1"
                shouldBeep = uartmessage.split("_")[6] == "1"
                broadcastSettings()

            if 'forgetAll' in uartmessage:
                knownMicrobits = []
                generatedImages = []
                sendRadioMessage("reintroduce")
                writeToComputer("mbc_0")   # mbc: micro:bit count
            
        # Listen for radio input
        message = radio.receive()
        if message:
            log("rm_" + message) # rm: received message

            if "hello" in message:
                microbitID = str(message.split("_")[0])     # get the id of the microbit
                # Check if microbit is already known by system
                microbitIndex = 0
                microbitUnknown = True
                for i, microbit in enumerate(knownMicrobits):
                    if microbit[0] == microbitID:      # If known, update the value locally
                        microbitIndex = i
                        microbitUnknown = False
                        sendRadioMessage(str(microbitID) + "_number_" + str(microbitIndex) + "_" + str(len(knownMicrobits)))

                if microbitUnknown:     # If this is a new microbit
                    microbitIndex = len(knownMicrobits)
                    knownMicrobits.append([microbitID])   # We add the microbit information locally
                    # Finally, we update the computer with any new information
                    writeToComputer("nu_" + str(microbitIndex) + "_" + microbitID)   # nu: new user
                    writeToComputer("mbc_" + str(len(knownMicrobits)))   # mbc: micro:bit count
                    sendRadioMessage("known_" + str(len(knownMicrobits)))

                for i, generatedImage in enumerate(generatedImages):
                    sendRadioMessage("newImg_" + str(i) + "_" + generatedImage)

                broadcastSettings()

            if "send" in message:
                messageComponents = message.split("_")

                # [0] = id; [1] = message code; [2] = recipient id; [3] = packed image index; [4] = code

                senderId = str(messageComponents[0])
                senderName = senderId
                recipientId = int(messageComponents[2])
                recipientName = str(knownMicrobits[recipientId]).split("'")[1] if recipientId != -1 else "ALL"
                packedImage = str(messageComponents[3])
                receivedImage = unpackImage(str(messageComponents[3]))

                display.show("!")
                sleep(200)
                display.clear()

                if encryptable:
                    encryptionCode = messageComponents[4]
                
                writeToComputer("nm_" + senderId + "_" + str(recipientName) + "_" + packedImage + ("_" + encryptionCode if encryptable else ""))   # nm: new message
                writeToComputer("mbc_" + str(len(knownMicrobits)))
            if "complete" in message:
                senderId = str(message.split("_")[0])
                allReceived = False
                if not allowRecipient:
                    for i, receiveEntry in enumerate(receiveFromKnown):
                        if senderId == receiveEntry[0]:
                            receiveFromKnown[i][1] = True
                
                    allReceived = True

                    for i, receiveEntry in enumerate(receiveFromKnown):
                        if not receiveEntry[1]:
                            allReceived = False 
    
                if senderId == recipientName or allReceived:
                    senderName = ""
                    recipientName = ""
                    for i in range(5):
                        messageConstruct[i] = ""
                        messageConstructIndex[i] = False
                    messageComplete = False
                    messageUnderConstruction = False
                    sendOnPermitted = False
                uartOver = False

        if sendOnPermitted:
            senderNumber = 0
            for i, microbit in enumerate(knownMicrobits):
                if microbit[0] == senderName:
                    senderNumber = i
            
            sendRadioMessage(str(recipientName) + "_receive_" + packedImage + "_" + str(senderNumber) + ("_" + encryptionCode if encryptable else ""))
            sendOnPermitted = False
