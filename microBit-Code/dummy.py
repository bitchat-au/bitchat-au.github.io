radioChannel = 1        # all microbits in a group should be on the same radio channel

# Imports go at the top
from microbit import *
import machine
import struct
import radio
import random
import music
import time

idNumber = "0"
messageNumber = 0
recipientIndex = 0
knownRecipients = 0
knownRecipientList = []
encryptable = False
autoEncryptable = False
allowRecipient = False
outputMessage = []
wrongMessage = False
pitchList = [6,8,10,12]
lastRecordedMessage = 0
resetMicrobitTime = False

ledImages = [[[0,0,0,0,0],[0,1,0,1,0],[0,0,0,0,0],[1,0,0,0,1],[0,1,1,1,0]], 
            [[0,0,0,0,0],[0,1,0,1,0],[0,0,0,0,0],[0,1,1,1,0],[1,0,0,0,1]]];

sendImages = [[[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,1,0,0]],
             [[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,1,0,0],[0,1,1,1,0]],
             [[0,0,0,0,0],[0,0,0,0,0],[0,0,1,0,0],[0,1,1,1,0],[1,0,1,0,1]],
             [[0,0,0,0,0],[0,0,1,0,0],[0,1,1,1,0],[1,0,1,0,1],[0,0,1,0,0]],
             [[0,0,1,0,0],[0,1,1,1,0],[1,0,1,0,1],[0,0,1,0,0],[0,0,1,0,0]],
             [[0,1,1,1,0],[1,0,1,0,1],[0,0,1,0,0],[0,0,1,0,0],[0,0,0,0,0]],
             [[1,0,1,0,1],[0,0,1,0,0],[0,0,1,0,0],[0,0,0,0,0],[0,0,0,0,0]],
             [[0,0,1,0,0],[0,0,1,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0]],
             [[0,0,1,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0]]]

###################################################
## Received message structure
###################################################
messageConstructIndex = [False, False, False, False, False]
messageConstruct = ["", "", "", "", ""]
messageComplete = False
messageSender = 0
messageRecipient = ""
codeString = ""
packedReceivedImage = ""

###################################################
## micro:bit states:
###################################################
known = False
lastKnownPing = 0
constructingMessage = False
choosingContent = False
choosingRecipient = False
encryptingMessage = False
sendingMessage = False
readyToSend = False
code = []
shouldBeep = False

###################################################
## Setup for the radio:
###################################################
radio.config(group=radioChannel, data_rate=radio.RATE_1MBIT, queue=10, channel=42)
radio.on()

###################################################
## Setup for actual ID
###################################################
def microbit_friendly_name():
    length = 5
    letters = 5
    codebook = [['z', 'v', 'g', 'p', 't'],['u', 'o', 'i', 'e', 'a'],['z', 'v', 'g', 'p', 't'],['u', 'o', 'i', 'e', 'a'],['z', 'v', 'g', 'p', 't']]
    name = []

    # Derive our name from the nrf51822's unique ID
    _, n = struct.unpack("II", machine.unique_id())
    ld = 1;
    d = letters;

    for i in range(0, length):
        h = (n % d) // ld;
        n -= h;
        d *= letters;
        ld *= letters;
        name.insert(0, codebook[i][h]);

    return "".join(name);
id = str(microbit_friendly_name())

###################################################
## Assisting functions
###################################################

# Function to produce the correct message format with id
def sendMessage(message):
    radio.send(id + "_" + str(message))

def setImage(imageIndex, imageList):
    imageString = ""
    for i in range(5):
        for j in range(5):
            if imageList == outputMessage:
                imageString = imageString + str(imageList[i][j]*9)
            else:
                imageString = imageString + str(imageList[imageIndex][i][j]*9)
        if i is not 4:
            imageString = imageString + ":"
    return imageString

def matrixToImage(matrix):
    rows = ["".join(str(int(x) * 9) for x in row) for row in matrix]
    return ":".join(rows)

def setRecipients():
    knownRecipientList = []
    for i in range(knownRecipients):
        if i is not int(idNumber):
            knownRecipientList.append(i)
    return knownRecipientList

def sendAnimation():
    for i in range(len(sendImages)):
        display.show(Image(setImage(i, sendImages)))
        sleep(100)
    display.clear()
    sleep(100)

def createEncryption(messageList):
    for j in range(5): # Kolonne
        if int(code[j])>0: # hvis koden siger jeg skal flippe
            for k in range(5): # række
                if messageList[k][j] > 0:
                    messageList[k][j] = 0
                else:
                    messageList[k][j] = 1
    return messageList
                    
def encryptImage(imageList):
    sleep(500)
    for j in range(5): # Kolonne
        for l in range(5):
            display.set_pixel(j,l,0)
        for k in range(5): # række
            ledStrength = int(imageList[k][j])
            if ledStrength<9:
                ledStrength = ledStrength*9
            display.set_pixel(j,k,ledStrength)
        sleep(500)

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

def checkRadio():
    global outputMessage, codeString, readyToSend, encryptingMessage, choosingContent

    radioMessage = radio.receive()
    if radioMessage:
        if id in radioMessage:
            display.clear()
            display.show(int(idNumber)+1)
            outputMessage = []
            codeString = ""

            # Reset states
            readyToSend = False
            encryptingMessage = False
            choosingContent = False

        if "settings" in radioMessage or "known" in radioMessage or "newImg" in radioMessage:
            machine.reset()

###################################################
## Loop
###################################################
# Code in a 'while True:' loop repeats forever
while True:
    # Listen for radio input
    message = radio.receive()
    if message:
        if id in message:
            known = True
            if "number" in message:
                idNumber = message.split("_")[2]
                knownRecipients = int(message.split("_")[3])
                display.show(int(idNumber)+1)
            if "receive" in message:
                messageComponents = message.split("_")

                packedReceivedImage = str(messageComponents[2])
                messageSender = int(messageComponents[3])
                codeString = messageComponents[4] if encryptable else ""

                messageComplete = True
            if "repeat" in message:
                repeatIndex = int(message.split("_")[2])
                sendMessage("send_" + messageRecipient + "_" + str(repeatIndex) + "_" + messageConstruct[repeatIndex] + ("_" + codeString if encryptable else ""))
            if "wrong" in message:
                wrongMessage = True
        if "reintroduce" in message:
            known = False
            lastKnownPing = time.ticks_ms() - ((10 - int(idNumber)) * 100) # Offset the time so that the micro:bits don't all respond at once, and so that the micro:bits with the lowest id respond first
            idNumber = "0"
            display.clear()
        if "known" in message:
            knownRecipients = int(message.split("_")[1])
        if "newImg" in message:


            imageIndex = int(message.split("_")[1]) + 2 # +2 is the offset for the two default images
            packedNewImage = message.split("_")[2]

            ledImages.append(unpackImage(packedNewImage))
        if "settings" in message:
            encryptable = message.split("_")[1] == "1"
            autoEncryptable = message.split("_")[2] == "1"
            allowRecipient = message.split("_")[3] == "1"
            shouldBeep = message.split("_")[4] == "1"

        if "complete" in message:
            outputMessage = [[],[],[],[],[]]
        if "receive" in message and not allowRecipient:
            messageComponents = message.split("_")

            packedReceivedImage = str(messageComponents[2])
            messageSender = int(messageComponents[3])

            if encryptable:
                codeString = messageComponents[4]

            if messageSender != int(idNumber):
                messageComplete = True


    # When a full message has been received
    if messageComplete:
        if shouldBeep:
            for i, pitch in enumerate(pitchList):
                if wrongMessage:
                    music.pitch(pitchList[(len(pitchList)-1)-i]*100)
                else:
                    music.pitch(pitch*100)
                sleep(150)
            music.stop()
        
        outputMessage = unpackImage(packedReceivedImage)
        code = list(codeString)

        display.show(Image(matrixToImage(outputMessage)))

        sleep(int(idNumber) * 50) # Offset the time so that the micro:bits don't all respond at once, and so that the micro:bits with the lowest id respond first
        sendMessage("complete")
        
        if encryptable:
            inputPress = 0
            analysisInProgress = True
            if autoEncryptable:
                analysisInProgress = False
            correctInput = True
            while analysisInProgress:
                a_pressed = button_a.was_pressed()
                b_pressed = button_b.was_pressed()

                if a_pressed and int(code[inputPress]) > 1:
                    correctInput = False
                    analysisInProgress = False

                if b_pressed and int(code[inputPress]) < 1:
                    correctInput = False
                    analysisInProgress = False

                if a_pressed or b_pressed:
                    display.show("A" if a_pressed else "B")
                    sleep(500)
                    display.clear()

                    inputPress +=1
                    for i in range(inputPress):
                        if int(code[i])>0:
                            for j in range(5):
                                display.set_pixel(i,j,9)
                        else:
                            display.set_pixel(i,2,9)
                
                if inputPress > 4:
                    analysisInProgress = False

            if correctInput:
                outputMessage = createEncryption(outputMessage)
                encryptImage(outputMessage)
                sleep(4000)
                display.show(Image.ARROW_W)
                sleep(1000)
                display.show(int(messageSender)+1)
                resetMicrobitTime = True
            else:
                display.clear()
                display.show(Image.NO)
                sleep(2000)
                resetMicrobitTime = True
        else:
            sleep(4000)
            display.show(Image.ARROW_W)
            sleep(1000)
            display.show(int(messageSender)+1)
            resetMicrobitTime = True

    if resetMicrobitTime:
        sleep(2000)
        display.clear()
        display.show(int(idNumber)+1)
        outputMessage = []
        code = []
        wrongMessage = False
        codeString = ""
        messageSender = 0
        packedReceivedImage = []
        messageComplete = False
        lastRecordedMessage = time.ticks_ms()
        resetMicrobitTime = False
    
    if not known and time.ticks_ms() - lastKnownPing > 1000:
        sendMessage("hello")
        lastKnownPing = time.ticks_ms()

    # When starting a new message
    if pin_logo.is_touched():
        outputMessage = []
        code = []
        display.show(Image('99999:''99099:''90909:''90009:''99999'))   # show envelope image
        sleep(1000)
        display.show(Image(setImage(0, ledImages)))
        choosingContent = True;

    while choosingContent:
        checkRadio()
                
        if button_a.was_pressed():
            messageNumber -= 1

            if messageNumber < 0:
                messageNumber = len(ledImages)-1

            display.show(Image(setImage(messageNumber, ledImages)))
            print(messageNumber)

        if button_b.was_pressed():
            messageNumber += 1
            if messageNumber > len(ledImages)-1:
                messageNumber = 0

            display.show(Image(setImage(messageNumber, ledImages)))
            print(messageNumber)

        if pin_logo.is_touched():
            outputMessage = [[],[],[],[],[]]
            for i in range(5):
                for j in range(5):
                    outputMessage[i].append(ledImages[messageNumber][i][j])
            if encryptable:
                display.show(Image('00000:''09000:''90999:''09009:''00000'))
                sleep(1000)
                display.clear()
                encryptingMessage = True
                choosingContent = False
            elif allowRecipient:
                display.show(Image.ARROW_E)
                sleep(1000)
                knownRecipientList = setRecipients()
                display.show(knownRecipientList[0]+1)
                choosingRecipient = True
                choosingContent = False
            else:
                sendingMessage = True
                choosingContent = False

    while encryptingMessage:
        checkRadio()
            
        if button_a.was_pressed():
            if len(code)<1:
                display.clear()
            display.clear()
            display.show("A")
            sleep(500)
            display.clear()
            code.append("0")
            for i, char in enumerate(code):
                if int(char)>0:
                    for j in range(5):
                        display.set_pixel(i,j,9)
                else:
                    display.set_pixel(i,2,9)
        
        if button_b.was_pressed():
            if len(code)<1:
                display.clear()
            display.clear()
            display.show("B")
            sleep(500)
            display.clear()
            code.append("1")
            for i, char in enumerate(code):
                if int(char)>0:
                    for j in range(5):
                        display.set_pixel(i,j,9)
                else:
                    display.set_pixel(i,2,9)

        if autoEncryptable:
            for i in range(5):
                code.append(str(random.randint(0,1)))

        if len(code)>4:
            display.clear()
            for i in range(3):
                for j in range(5):
                    for k in range(5):
                        if random.randint(0,1)>0:
                            display.set_pixel(k,j,9)
                        else:
                            display.set_pixel(k,j,0)
                sleep(500)
            outputMessage = createEncryption(outputMessage)
            display.clear()
            display.show(Image(setImage(messageNumber, ledImages)))
            encryptImage(outputMessage)
            codeString = ""
            for i in range(5):
                codeString += code[i]
            code = []
            readyToSend = True
    
            while readyToSend:
                checkRadio()
                        
                if pin_logo.is_touched():
                    display.show(Image.ARROW_E)
                    sleep(1000)
                    if allowRecipient:
                        knownRecipientList = setRecipients()
                        display.show(knownRecipientList[0]+1)
                        choosingRecipient = True
                    else:
                        sendingMessage = True
                    encryptingMessage = False
                    readyToSend = False
                        
    while choosingRecipient:
        checkRadio()
                
        if button_a.was_pressed():
            recipientIndex -= 1

            if recipientIndex < 0:
                recipientIndex = len(knownRecipientList)-1

            display.show(knownRecipientList[recipientIndex]+1)

        if button_b.was_pressed():
            recipientIndex += 1
            if recipientIndex > len(knownRecipientList)-1:
                recipientIndex = 0

            display.show(knownRecipientList[recipientIndex]+1)

        if pin_logo.is_touched():
            sendingMessage = True
            choosingRecipient = False

    while sendingMessage:
        sendAnimation()
        sleep(500)

        messageRecipient = str(knownRecipientList[recipientIndex]) if allowRecipient else "-1"
        sendMessage("send_" + messageRecipient + "_" + str(packImage(outputMessage)) + ("_" + codeString if encryptable else ""))

        recipientIndex = 0
        messageNumber = 0
        display.show(int(idNumber)+1)
        sendingMessage = False
