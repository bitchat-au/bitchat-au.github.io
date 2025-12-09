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

###################################################
## micro:bit states:
###################################################
known = False
constructingMessage = False
choosingContent = False
choosingRecipient = False
encryptingMessage = False
sendingMessage = False
readyToSend = False
code = []

###################################################
## Setup for the radio:
###################################################
radio.config(group=radioChannel)
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
                messageIndex = int(message.split("_")[2])
                messageSender = int(message.split("_")[4])
                if encryptable:
                    codeString = message.split("_")[5]
                if time.ticks_ms()-lastRecordedMessage>3000:
                    for i in range(5):
                        messageConstructIndex[i] = False
                        messageConstruct[i] = ""
                    lastRecordedMessage = time.ticks_ms()
                if not messageConstruct[messageIndex] == str(message.split("_")[3]):
                    messageConstructIndex[messageIndex] = True
                    messageConstruct[messageIndex] = str(message.split("_")[3])
                messageComplete = True                
                for i in range(5):
                    if not messageConstructIndex[i]:
                        messageComplete = False
            if "repeat" in message:
                repeatIndex = int(message.split("_")[2])
                if encryptable:
                    sendMessage("send_" + messageRecipient + "_" + str(repeatIndex) + "_" + messageConstruct[repeatIndex] + "_" + codeString)
                else:
                    sendMessage("send_" + messageRecipient + "_" + str(repeatIndex) + "_" + messageConstruct[repeatIndex])
            if "wrong" in message:
                wrongMessage = True
        if "known" in message:
            knownRecipients = int(message.split("_")[1])
        if "newImg" in message:
            messageIndex = int(message.split("_")[1])+2
            imageIndex = int(message.split("_")[2])
            imagebit = message.split("_")[3]
            if messageIndex == len(ledImages) or messageIndex > len(ledImages):
                ledImages.append([[],[],[],[],[]]) 
            imagebitAsList = list(imagebit)
            for i in range(5):
                ledImages[messageIndex][imageIndex].append(int(imagebitAsList[i]))
        if "encrypt" in message:
            if int(message.split("_")[1])>0:
                encryptable = True
            else:
                encryptable = False
        if "autoEncrypt" in message:
            if int(message.split("_")[1])>0:
                autoEncryptable = True
            else:
                autoEncryptable = False
        if "recipient" in message:
            if int(message.split("_")[1])>0:
                allowRecipient = True
            else:
                allowRecipient = False
        if "complete" in message:
            outputMessage = [[],[],[],[],[]]
        if not allowRecipient:
            if "receive" in message:
                messageIndex = int(message.split("_")[2])
                messageSender = int(message.split("_")[4])
                if encryptable:
                    codeString = message.split("_")[5]
                if time.ticks_ms()-lastRecordedMessage>3000:
                    lastRecordedMessage = time.ticks_ms()
                    for i in range(5):
                        messageConstructIndex[i] = False
                        messageConstruct[i] = ""
                if not messageConstructIndex[messageIndex] or not messageConstruct[messageIndex] == str(message.split("_")[3]):
                    messageConstructIndex[messageIndex] = True
                    messageConstruct[messageIndex] = str(message.split("_")[3])
                messageComplete = True                
                for i in range(5):
                    if not messageConstructIndex[i]:
                        messageComplete = False

    # When a full message has been received
    if messageComplete:
        for i in range(len(pitchList)):
            if wrongMessage:
                music.pitch(pitchList[(len(pitchList)-1)-i]*100)
            else:
                music.pitch(pitchList[i]*100)
            sleep(150)
        music.stop()
            
        outputMessage = [[],[],[],[],[]]
        code = list(codeString)
        for i in range(3):
            sendMessage("complete")
        messageString = ""
        for i in range(5):
            messageString += messageConstruct[i]
            imagebitAsList = list(messageConstruct[i])
            for j in range(5):
                outputMessage[i].append(int(imagebitAsList[j]))
            if i<4:
                messageString += ":"
        display.show(Image(messageString))
        if encryptable:
            inputPress = 0
            analysisInProgress = True
            if autoEncryptable:
                    analysisInProgress = False
            correctInput = True
            while analysisInProgress:
                if button_a.was_pressed():
                    display.show("A")
                    sleep(500)
                    display.clear()
                    if int(code[inputPress])>1:
                        correctInput = False
                        analysisInProgress = False
                    inputPress +=1
                    for i in range(inputPress):
                        if int(code[i])>0:
                            for j in range(5):
                                display.set_pixel(i,j,9)
                        else:
                            display.set_pixel(i,2,9)
                if button_b.was_pressed():
                    display.show("B")
                    sleep(500)
                    display.clear()
                    if int(code[inputPress])<1:
                        correctInput = False
                        analysisInProgress = False
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
        messageComplete = False
        for i in range(5):
            messageConstructIndex[i] = False
            messageConstruct[i] = ""
        lastRecordedMessage = time.ticks_ms()
        resetMicrobitTime = False
    
    if not known:
        sendMessage("hello")

    # When starting a new message
    if pin_logo.is_touched():
        outputMessage = []
        code = []
        display.show(Image('99999:''99099:''90909:''90009:''99999'))   # show envelope image
        sleep(1000)
        display.show(Image(setImage(0, ledImages)))
        choosingContent = True;

    while choosingContent:
        message = radio.receive()
        if message:
            if id in message:
                display.clear()
                display.show(int(idNumber)+1)
                choosingContent = False
            if "encrypt" in message or "known" in message or "newImg" in message:
                machine.reset()
                
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
        message = radio.receive()
        if message:
            if id in message:
                display.clear()
                display.show(int(idNumber)+1)
                outputMessage = []
                code = []
                encryptingMessage = False
            if "encrypt" in message or "known" in message or "newImg" in message:
                machine.reset()
            
        if button_a.was_pressed():
            if len(code)<1:
                display.clear()
            display.clear()
            display.show("A")
            sleep(500)
            display.clear()
            code.append("0")
            for i in range(len(code)):
                if int(code[i])>0:
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
            for i in range(len(code)):
                if int(code[i])>0:
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
                message = radio.receive()
                if message:
                    if id in message:
                        display.clear()
                        display.show(int(idNumber)+1)
                        outputMessage = []
                        codeString = ""
                        readyToSend = False
                        encryptingMessage = False
                    if "encrypt" in message or "known" in message or "newImg" in message:
                        machine.reset()
                        
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
        message = radio.receive()
        if message:
            if id in message:
                display.clear()
                display.show(int(idNumber)+1)
                outputMessage = []
                codeString = ""
                readyToSend = False
                encryptingMessage = False
            if "encrypt" in message or "known" in message or "newImg" in message:
                machine.reset()
                
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
        messageString = setImage(0, outputMessage)
        if allowRecipient:
            messageRecipient = str(knownRecipientList[recipientIndex])
        else:
            messageRecipient = "0"
        for i in range(5):
            tempMessage = str(messageString.split(":")[i])
            if encryptable:
                sendMessage("send_" + messageRecipient + "_" + str(i) + "_" + tempMessage + "_" + codeString)
            else:
                sendMessage("send_" + messageRecipient + "_" + str(i) + "_" + tempMessage)
        recipientIndex = 0
        messageNumber = 0
        display.show(int(idNumber)+1)
        sendingMessage = False
