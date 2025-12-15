radioChannel = 1

# Imports go at the top
from microbit import *
import radio
uart.init()


knownMicrobits = []         # list of active micro:bits
generatedImages = []        # Images created by students
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
encryptionCode = ""
receiveFromKnown = []

###################################################
## Setup for the radio:
###################################################
radio.config(group=radioChannel, power=7)
radio.on()
radiostart = False

###################################################
## Assisting functions
###################################################

# Function to produce the correct message format for the computer
def writeToComputer(message):
    print("#" + str(message) + "&")

def updateState(code, state):
    for i in range(3):
        radio.send(code + "_" + state)


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
            if 'count' in uartmessage:        # Get update on number of known micro:bits by the computer
                for i in range(len(knownMicrobits)):
                    writeToComputer("nu_" + str(i) + "_" + str(knownMicrobits[i]).split("'")[1])
            if 'nmComp' in uartmessage:      # If all of the message has been received
                uartOver = True
            if 'ready' in uartmessage:
                sendOnPermitted = True
                if not allowRecipient:
                    receiveFromKnown = []
                    for i in range(len(knownMicrobits)):
                        receiveFromKnown.append([knownMicrobits[i], False])
                uartOver = True
            if 'newImg' in uartmessage:
                imageIndex = len(generatedImages)
                generatedImages.append(["","","","",""])
                for i in range(5):
                    generatedImages[imageIndex][i] = uartmessage.split("_")[3].split(":")[i]
                for j in range(5):
                    radio.send("newImg_" + str(imageIndex) + "_" + str(j) + "_" + generatedImages[imageIndex][j])
            if 'known' in uartmessage:
                knownMicrobits.append([uartmessage.split("_")[3]])
            if 'knownImg' in uartmessage:
                imageIndex = len(generatedImages)
                generatedImages.append(["","","","",""])
                for i in range(5):
                    generatedImages[imageIndex][i] = uartmessage.split("_")[3].split(":")[i]
            if 'yesEncrypt' in uartmessage:
                encryptable = True
                updateState("encrypt", "1")
            if 'noEncrypt' in uartmessage:
                encryptable = False
                updateState("encrypt", "0")
            if 'yesAutoEncrypt' in uartmessage:
                autoEncryptable = True
                updateState("autoEncrypt", "1")
            if 'noAutoEncrypt' in uartmessage:
                autoEncryptable = False
                updateState("autoEncrypt", "0")
            if 'yesRecipient' in uartmessage:
                allowRecipient = True
                updateState("recipient", "1")
            if 'noRecipient' in uartmessage:
                allowRecipient = False
                updateState("recipient", "0")
            if 'replaceM' in uartmessage:
                for i in range(5):
                    messageConstruct[i] = uartmessage.split("_")[3].split(":")[i]
                sendOnPermitted = True
                for i in range(3):
                    radio.send(recipientName + "_wrong")
            if 'replaceR' in uartmessage:
                recipientName = uartmessage.split("_")[3]
                sendOnPermitted = True
            
        # Listen for radio input
        message = radio.receive()
        if message:
            if "hello" in message:
                microbitID = str(message.split("_")[0])     # get the id of the microbit
                # Check if microbit is already known by system
                microbitIndex = 0
                microbitUnknown = True
                for i in range(len(knownMicrobits)):
                    if knownMicrobits[i][0] == microbitID:      # If known, update the value locally
                        microbitIndex = i
                        microbitUnknown = False
                        for j in range(3):
                            radio.send(str(microbitID) + "_number_" + str(microbitIndex) + "_" + str(len(knownMicrobits)))
                if microbitUnknown:     # If this is a new microbit
                    microbitIndex = len(knownMicrobits)
                    knownMicrobits.append([microbitID])   # We add the microbit information locally
                    # Finally, we update the computer with any new information
                    writeToComputer("nu_" + str(microbitIndex) + "_" + microbitID)   # nu: new user
                    writeToComputer("mbc_" + str(len(knownMicrobits)))   # mbc: micro:bit count
                    for i in range(3):
                        radio.send("known_" + str(len(knownMicrobits)))
                for i in range(len(generatedImages)):
                    for j in range(5):
                        radio.send("newImg_" + str(i) + "_" + str(j) + "_" + generatedImages[i][j])
                for i in range(3):
                    if encryptable:
                        radio.send("encrypt_1")
                    else:
                        radio.send("encrypt_0")
                    if autoEncryptable:
                        radio.send("autoEncrypt_1")
                    else:
                        radio.send("autoEncrypt_0")
                    if allowRecipient:
                        radio.send("recipient_1")
                    else:
                        radio.send("recipient_0")
            if "send" in message:
                # [0] = id; [1] = message code; [2] = recipient id; [3] = message index; [4] = message bite; [5] = code
                senderId = str(message.split("_")[0])
                recipientId = int(message.split("_")[2])
                recipientName = str(knownMicrobits[recipientId]).split("'")[1]
                messageIndex = int(message.split("_")[3])
                messageBit = message.split("_")[4]
                if encryptable:
                    encryptionCode = message.split("_")[5]
                if messageUnderConstruction:
                    if senderName == senderId:
                        if not messageConstructIndex[messageIndex]:
                            if len(messageBit)>0:
                                display.show("!")
                                sleep(200)
                                display.clear()
                                messageConstructIndex[messageIndex] = True
                                messageConstruct[messageIndex] = messageBit
                    messageComplete = True
                    for i in range(5):
                        if not messageConstructIndex[i]:
                            messageComplete = False
                    if not messageComplete:
                        if not uartOver:
                            for i in range(5):
                                if not messageConstructIndex[i]:
                                    radio.send(senderName + "_repeat_" + str(i))                
                if not messageUnderConstruction:
                    messageUnderConstruction = True
                    senderName = senderId
                    messageConstructIndex[messageIndex] = True
                    messageConstruct[messageIndex] = messageBit
            if "complete" in message:
                senderId = str(message.split("_")[0])
                allReceived = False
                if not allowRecipient:
                    for i in range(len(receiveFromKnown)):
                        if senderId == receiveFromKnown[i][0]:
                            receiveFromKnown[i][1] = True
                    allReceived = True
                    for i in range(len(receiveFromKnown)):
                        if not receiveFromKnown[i][1]:
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
            if "lostImg" in message:
                senderId = str(message.split("_")[0])
                imageIndex = int(message.split("_")[2])
                for j in range(5):
                    radio.send("newImg_" + str(imageIndex) + "_" + str(j) + "_" + generatedImages[imageIndex][j])


        
        if messageComplete:
            if not uartOver:
                for i in range(5):
                    writeToComputer("nm_" + senderName + "_" + str(recipientName) + "_" + str(i) + "_" + str(messageConstruct[i]))   # nm: new message
                writeToComputer("mbc_" + str(len(knownMicrobits)))

        if sendOnPermitted:
            senderNumber = 0
            for i in range(len(knownMicrobits)):
                if knownMicrobits[i][0] == senderName:
                    senderNumber = i
            for i in range(5):
                if encryptable:
                    radio.send(str(recipientName) + "_receive_" + str(i) + "_" + str(messageConstruct[i]) + "_" + str(senderNumber) + "_" + encryptionCode)
                else:                
                    radio.send(str(recipientName) + "_receive_" + str(i) + "_" + str(messageConstruct[i]) + "_" + str(senderNumber))
