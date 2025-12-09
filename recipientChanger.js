function setUpChanger(messageSender, messageReceiver, messageString){
    console.log("starting changer")

    changeRecipientNumber = getUserNumber(messageReceiver);
    changesenderNumber = getUserNumber(messageSender);
    //let reconstructedMessage = reconstructMessage(messageString);

    //changeRecipientNumber = 0
    //changesenderNumber = 2
    let reconstructedMessage = [[0,0,0,0,0],[0,1,0,1,0],[0,0,0,0,0],[1,0,0,0,1],[0,1,1,1,0]]

    createIcon(ledNumber[changesenderNumber], document.getElementById("changeSender"));
    createIcon(reconstructedMessage, document.getElementById("changeMessage"));
    createIcon(ledNumber[changeRecipientNumber], document.getElementById("changeRecipient"));

    for(let i=0; i<knownMicrobits.length; i++){
        let tableRow = document.createElement("tr")
        let iconField = document.createElement("td")
        iconField.classList.add("centerallign")
        createIcon(ledNumber[i], iconField)
        let nameField = document.createElement("td")
        nameField.innerText = knownMicrobits[i][0]
        nameField.classList.add("tableName")

        tableRow.appendChild(iconField)
        tableRow.appendChild(nameField)
        document.getElementById("changeRecipientTable").appendChild(tableRow)
    }

    for(let i=0; i<knownMicrobits.length; i++){
        let addressName = document.createElement("p")
        addressName.innerText = "id[" + knownMicrobits[i][0] + "]"
        addressName.classList.add("addressChoice")
        document.getElementById("changeChooser").appendChild(addressName)

        addressName.addEventListener("click", e=>{
            writeToMB("replaceR_" + knownMicrobits[i][0]);
            createBlockMessage(getUserNumber(lastMessageStats[0]), i, lastMessageStats[2])
            resetChangeSpace();
        })
    }
}

function resetChangeSpace(){
    document.getElementById("changeSpace").classList.toggle("hidden")
    setTimeout(resetValues, 2000);
    document.getElementById("changeSender").innerHTML = "";
    document.getElementById("changeMessage").innerHTML = "";
    document.getElementById("changeRecipient").innerHTML = "";
    document.getElementById("changeChooser").innerHTML = "";
    document.getElementById("changeRecipientTable").innerHTML = "<tr><th>Navn</th><th>Id</th></tr>";
}
