function checkForNewUser(newUser){
    console.log("checking " + newUser)
    let isNew = true;
    if(knownMicrobits.length <1){
        console.log("no known micro:bits")
        isNew = true
    } else{
      for(let i = 0; i<knownMicrobits.length; i++){
        if(knownMicrobits[i][0] == newUser){
            isNew = false;
        }
      }
    }
    if(isNew){
        let mbIndex = knownMicrobits.length
        messageIndex+=1;
        knownMicrobits.push([newUser,mbIndex]);
        createBlockId(mbIndex);
    }
    console.log(knownMicrobits)
}

function createIcon(imageContent, endLocation){
    let newIconTable = document.createElement("table");
    newIconTable.classList.add("icon")
    for(let i=0; i<5;i++){
        let newRowEdge = document.createElement("tr");
        for(let j=0; j<5; j++){
            let newField = document.createElement("td");
            newField.classList.add("field")
            //console.log(imageList[imageId][i][j]);
            if(imageContent[i][j]>0){
                newField.classList.add("active")
            }
            newRowEdge.appendChild(newField);
        }
        newIconTable.appendChild(newRowEdge);
    }
    endLocation.appendChild(newIconTable);
}

function printMessage(sender, recipient, message){
    let recipientNumber = getUserNumber(recipient);
    let senderNumber = getUserNumber(sender);
    let reconstructedMessage = reconstructMessage(message);
    createBlockMessage(senderNumber, recipientNumber, reconstructedMessage)
    messageIndex+=1;
}

function getUserNumber(userName){
    let userNumber = 0
    for(let i=0; i<knownMicrobits.length;i++){
        if(knownMicrobits[i][0] == userName){
            userNumber = i;
        }
    }
    return userNumber;
}

function reconstructMessage(inputMessage){
    let reconstructedMessage = []
    for(let i=0; i<inputMessage.length; i++){
        reconstructedMessage.push(stringToList(inputMessage[i]))
    }
    return reconstructedMessage;
}

function stringToList(inputString){
    let tempArray = inputString.split('');
    for(let i=0; i<tempArray.length; i++){
        tempArray[i] = Number(tempArray[i]);
    }
    return tempArray;
}

function createBlockMessage(senderNumber, recipientNumber,content){
    let messageBlock = document.createElement("div");
    messageBlock.classList.add("flexBetween");
    messageBlock.setAttribute("id", "messageBlock" + messageIndex)
    createIcon(ledNumber[senderNumber], messageBlock);
    let firstTextElement = document.createElement("p");
    firstTextElement.innerText = "Sendte";
    messageBlock.appendChild(firstTextElement);
    createIcon(content, messageBlock);
    if(allowRecipient){
        let secondtextElement = document.createElement("p");
        secondtextElement.innerText = "Til";
        messageBlock.appendChild(secondtextElement);
        createIcon(ledNumber[recipientNumber], messageBlock);
    }
    messageBlock.style.display = "none";

    
    let messagePrint = document.createElement("p");
    messagePrint.setAttribute("id", "messagePrint" + messageIndex);
    messagePrint.classList.add("terminalEntry");
    let messageTag = document.createElement("span");
    messageTag.innerText = "NyBesked--"
    let messageSender = document.createElement("span");
    messageSender.innerText = "s.id[" + (knownMicrobits[senderNumber][0]) +"]--"
    let messageRecipient = document.createElement("span");
    messageRecipient.innerText = "m.id[" + (knownMicrobits[recipientNumber][0]) +"]--"
    let messageContent = document.createElement("span");
    let contentString = "";
    for(let i=0; i<5;i++){
        if(i>0){
            contentString += ":";
        }

        for(let j=0; j<5; j++){
            if(Number(content[i][j])>0){
                contentString += "1"
            } else {
                contentString += content[i][j];
            }
        }
    }
    messageContent.innerText = contentString;
    messagePrint.appendChild(messageTag);
    messagePrint.appendChild(messageSender);
    if(allowRecipient){
        messagePrint.appendChild(messageRecipient);
    }
    messagePrint.appendChild(messageContent);
    if(allowHacking){
        let hashcodeString = document.createElement("span");
        hashcodeString.innerText = "--hash." + hashCode;
        messagePrint.appendChild(hashcodeString);
    }
    messagePrint.addEventListener("mouseenter", e=>{
        messageBoard.style.display = "block";
        messageBlock.style.display = "flex";
    })
    messagePrint.addEventListener("mouseleave", e=>{
        messageBoard.style.display = "none";
        messageBlock.style.display = "none";
    })

    messageBoard.appendChild(messageBlock)
    serverSpace.appendChild(messagePrint);
}

function createBlockId(idNumber){
    let messageBlock = document.createElement("div");
    messageBlock.setAttribute("id", "idBlock" + messageIndex);
    console.log(idNumber)
    createIcon(ledNumber[idNumber], messageBlock);
    messageBlock.style.display = "none";

    let messagePrint = document.createElement("p");
    messagePrint.setAttribute("id", "messagePrint" + messageIndex);
    messagePrint.classList.add("terminalEntry");
    let messageTag = document.createElement("span");
    messageTag.innerText = "NyForbindelse--";
    let messageId = document.createElement("span");
    messageId.innerText = "id[" + (knownMicrobits[idNumber][0]) +"]";
    messagePrint.appendChild(messageTag);
    messagePrint.appendChild(messageId);
    messagePrint.addEventListener("mouseenter", e=>{
        knownConnections.style.display = "block";
        messageBlock.style.display = "block";
    })
    messagePrint.addEventListener("mouseleave", e=>{
        knownConnections.style.display = "none";
        messageBlock.style.display = "none";
    })

    knownConnections.appendChild(messageBlock)
    serverSpace.appendChild(messagePrint);

    let tableRow = document.createElement("tr")
    let iconField = document.createElement("td")
    iconField.classList.add("centerallign")
    createIcon(ledNumber[idNumber], iconField)
    let nameField = document.createElement("td")
    nameField.innerText = knownMicrobits[idNumber][0]
    nameField.classList.add("tableName")

    tableRow.appendChild(iconField)
    tableRow.appendChild(nameField)
    document.getElementById("recipientTable").appendChild(tableRow)
}
