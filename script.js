// values to establich serial connection with the microbit
let port;
let writer;
let reader;

/** 
 * Listening for any interaction with the button on the computer interface
 * If a connection has not yet been established, this button will intiate a connection
 * If a connection has been established, this button will simply ask for any information from the microbit
*/
document.getElementById("startbutton").addEventListener("click",event=>{
  document.getElementById("startbutton").classList.add("disabledButton");
  document.getElementById("trafficButton").classList.remove("disabledButton");
  document.getElementById("imageButton").classList.remove("disabledButton");
  document.getElementById("exhaustButton").classList.remove("disabledButton");
  writeToMB("start");
});

let lastMessage = "";




/**
 * Send a string to the micro:bit a-b-b-a-a
 * If the connection has not been established by the start of the program, we establish it here.
 * @param {str} message   The message to transfer to the microbit
 */
async function writeToMB(message){
  //event.preventDefault();
  if (!port) {
    console.log("looking for port")
    port = await navigator.serial.requestPort();
    await port.open({ baudRate: 9600 });
    writer = port.writable.getWriter();
    reader = port.readable.getReader();
    readLoop();
  }
  // All messages sent starts with "__" and ends with "_" to allow the micro:bit to decode the message along with relevant meta data
  const data = new TextEncoder().encode("__" + message + "_" + '\n');
  await writer.write(data);
}

/**
 * Read the serial input from the microbit. The function only reads one character at a time, which are stored in the global messageConstruct array.
 * All messages are constructed by starting with a "#"" and ending with a "&" - looking for these characters allows us to identify when a complete message has been sent.
*/
async function readLoop() {
  while (true) {
    const { value, done } = await reader.read();
    if (value) {
        let collectedInput = new TextDecoder().decode(value);
        if(collectedInput == "#"){
            // Clean list of collected characters
            while (messageConstruct.length > 0) {
                messageConstruct.pop();
            }
        }
        else if(collectedInput == "&"){
            // Construct a message from the list of collected characters
            let output = messageConstruct.toString().split(",").join("")
            // Now we check what is in the message we have constructed
            checkMessage(output)
        }
        else{
            // Add to list of collected characters
            messageConstruct.push(collectedInput)
        }
    }
    if (done) {
      reader.releaseLock();
      break;
    }
  }
}

/**
 * Function to check the received message
 */
function checkMessage(message){
  //console.log("nm = " + message.toString())
  //console.log("lm = " + lastMessage.toString())
  if(lastMessage != "" && message.toString().match(lastMessage.toString()) && lastMessage != "lc"){
      console.log("Damn")
      return;
      
    }
  lastMessage = message;
  let messageCode = message.split("_")[0];
  if(messageCode == "nu"){ // new user
    let mbID = message.split("_")[2]
    if(mbID.length == 5){

      checkForNewUser(mbID);
    }
  }
  if(messageCode == "nm"){ // new message
    let messageSender = message.split("_")[1]
    let messageReceiver = message.split("_")[2]
    let messageIndex = Number(message.split("_")[3])
    let messageBit = message.split("_")[4]
    // Check if message is under construction, and if this message is similar
    if(newMessageList[5][0] == ""){
      console.log("starting")
      newMessageList[5][0] = messageSender;
      newMessageList[5][1] = messageReceiver;
      if(!newMessageList[messageIndex][0]){
        newMessageList[messageIndex][0] = true;
        newMessageList[messageIndex][1] = messageBit;
      }
    }
    if(allowRecipient){
      if(newMessageList[5][0] == messageSender){
        if(!newMessageList[messageIndex][0]){
          newMessageList[messageIndex][0] = true;
          newMessageList[messageIndex][1] = messageBit;
        }
      }
    } else {
      if(newMessageList[5][0] == messageSender || newMessageList[5][0] == messageReceiver){
        if(!newMessageList[messageIndex][0]){
          //console.log("Wohoo!! _ " + messageIndex)
          newMessageList[messageIndex][0] = true;
          newMessageList[messageIndex][1] = messageBit;
        }
      }
    }
    
    let completedMessage = true;
    for(let i=0; i<5; i++){
      if(!newMessageList[i][0]){
        completedMessage = false;
      }
    }


    if(completedMessage){
      console.log("complete")
      let messageString = [];
      for(let i=0; i<5; i++){
        messageString.push(newMessageList[i][1]);
        newMessageList[i][0] = false;
        newMessageList[i][1] = "";
      }
      newMessageList[5][0] = "";
      newMessageList[5][1] = "";
      let correctCounter = 0;
      if(messageSender == lastMessageStats[0]){
        correctCounter +=1;
        //console.log(correctCounter + " sender error")
      }
      if(messageReceiver == lastMessageStats[1]){
        correctCounter +=1;
        //console.log(correctCounter + " receiver error")

      }
      for(let i=0; i<messageString.length;i++){
        if(messageString[i] == lastMessageStats[2][i]){
          correctCounter +=1
          //console.log(correctCounter + " message error")
        }
      }

      let timeDifference = new Date().getTime()/1000 - lastResetTime
      //console.log(timeDifference)


      if(timeDifference>12){
        lastResetTime = new Date().getTime()/1000;
        console.log(timeDifference)
        console.log("checking")
        lastMessageStats = [messageSender, messageReceiver, messageString];
        if(allowHacking){
          document.getElementById("hackingSpace").classList.toggle("hidden")
          writeToMB("nmComp");
          setUpHacking(messageSender, messageReceiver, messageString)
        } else if(allowRecipient && !autoRecipient){
          console.log("let it start!")
          writeToMB("nmComp");
          document.getElementById("changeSpace").classList.toggle("hidden")
          setUpChanger(messageSender, messageReceiver, messageString)
        } else {
          printMessage(messageSender, messageReceiver, messageString);
          writeToMB("ready");
          setTimeout(resetValues, 2000);
        }        
      }
    }
  }
  if(messageCode == "mbc"){ // microBit count
    //console.log(knownMicrobits.length + " _ vs _ " + message.split("_")[1])
    if(knownMicrobits.length != Number(message.split("_")[1])){
      console.log("something went wrong")
      writeToMB("count");
    }

  }

  if(messageCode == "lc"){ // microBit count
    //console.log(knownMicrobits.length + " _ vs _ " + message.split("_")[1])
    console.log("Lost connection!")
    writeToMB("start");
    for(let i=0; i<knownMicrobits.length; i++){
      writeToMB("known_" + knownMicrobits[i][0])
    }
    if(newImages.length > 0){
      for(let i=0; i<newImages.length; i++){
        writeToMB("knownImg_" + newImages[i])
        console.log(newImages[i])
      }
    }
    if(allowEncryption){
      writeToMB("yesEncrypt")
    }
    if(allowRecipient){
      writeToMB("yesRecipient")
    }

  }
}

function resetValues(){
  for(let i=0; i<5; i++){
    newMessageList[i][0] = false;
    newMessageList[i][1] = "";
  }
  newMessageList[5][0] = "";
  newMessageList[5][1] = "";
  lastResetTime = new Date().getTime()/1000;
}
