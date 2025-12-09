function setUpHacking(messageSender, messageReceiver, messageString){
    document.getElementById("hackSender").innerText = (getUserNumber(messageSender)+1);
    document.getElementById("hachReciever").innerText = (getUserNumber(messageReceiver)+1);

    let messageContent = reconstructMessage(messageString);
    let hashcodeString = ""
    for(let i=0; i<5; i++){
        let hashCodeRow = 0;
        for(let j=0; j<5; j++){
            if(messageContent[i][j]>0){
                document.getElementById("HB" + "input" + i + "," + j).classList.add("activeField");
                document.getElementById("HB" + "field" + i + "," + j).style.backgroundColor = lightColor;
                document.getElementById("HB" + "input" + i + "," + j).innerText = "1"; 
                hashCodeRow +=1;
            }
        }
        hashcodeString += hashCodeRow;
    }
    hashCode = hashcodeString;
}

document.getElementById("updateHackButton").addEventListener("click", e=>{
    if(!messageValid("HB")){
        alert("Et eller flere af tallene er ikke 0 eller 1");
        return;
    }
    let outputArray = []
    for(let i=0; i<5; i++){
        let rowarray = []
        for(let j=0; j<5; j++){
            rowarray.push(Number(document.getElementById("HB" + "input" + i + "," + j).innerText))
            document.getElementById("HB" + "input" + i + "," + j).innerText = "0";
            document.getElementById("HB" + "field" + i + "," + j).style.backgroundColor = "white";
        }
        outputArray.push(rowarray);
    }

    let mbMessageString = "";
    for(let i=0; i<5; i++){
        for(let j=0; j<5; j++){
            let outputValue = outputArray[i][j]*9;
            mbMessageString += outputValue;
        }
        if(i<4){
            mbMessageString += ":"
        }
    }

    document.getElementById("hackingSpace").classList.toggle("hidden")
    writeToMB("replaceM_" + mbMessageString);
    createBlockMessage(getUserNumber(lastMessageStats[0]), getUserNumber(lastMessageStats[1]), outputArray)
    setTimeout(resetValues, 2000);
})

document.getElementById("noUpdateHackButton").addEventListener("click", e=>{
    document.getElementById("hackingSpace").classList.toggle("hidden")    
    writeToMB("ready");
    createBlockMessage(getUserNumber(lastMessageStats[0]), getUserNumber(lastMessageStats[1]), lastMessageStats[2])
    setTimeout(resetValues, 2000);
    for(let i=0; i<5; i++){
        for(let j=0; j<5; j++){
            document.getElementById("HB" + "input" + i + "," + j).value = "0";
            document.getElementById("HB" + "field" + i + "," + j).style.backgroundColor = "white";
        }
    }
})
