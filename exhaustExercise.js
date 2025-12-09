var imageToEncrypt = 0;
var encryptionCode = []
var attemptCode = []
var attempts = 0;

document.getElementById("exhaustStart").addEventListener("click", e=>{
    console.log("start")
    if(document.getElementById("exhaustCheck").classList.contains("hidden")){
        document.getElementById("exhaustCheck").classList.toggle("hidden")
    }
    document.getElementById("exhaustResults").innerHTML = ""
    document.getElementById("exhaustInputArea").innerHTML = ""
    document.getElementById("exhaustImageArea").innerHTML = ""
    createExhaustActivity();
})

document.getElementById("exhaustCheck").addEventListener("click", e=>{
    resetExhaustImage();
    encryptExhaustActivity();
    for(let i=0; i<5; i++){
        if(attemptCode[i]>0){
            flipColumn(i)
        }
    }
    attempts ++;
    document.getElementById("exhaustResults").innerHTML = ""
    let outputMessage = document.createElement("p");
    outputMessage.setAttribute("id", "exhaustResultText")
    let correctCode = true
    for(let i=0; i<5; i++){
        if(encryptionCode[i] != attemptCode[i]){
            correctCode = false
        }        
    }
    if(correctCode){
        outputMessage.innerText = "Koden er korrekt"
        outputMessage.style.backgroundColor = lightGreenColor
    } else {
        outputMessage.innerText = "Koden er forkert"
        outputMessage.style.backgroundColor = lightRedColor

    }
    let outputAttempts = document.createElement("p");
    outputAttempts.innerText = attempts + " tjek";
    document.getElementById("exhaustResults").appendChild(outputMessage);
    document.getElementById("exhaustResults").appendChild(outputAttempts);
})

function createEncryptedImage(){
    imageToEncrypt = Math.floor(Math.random()*ledImages.length)
    encryptionCode = []
    attempts = 0;
    attemptCode = [0,0,0,0,0]
    for(let i=0; i<5; i++){
        encryptionCode.push(Math.floor(Math.random() * 2))
    }
}

function createExhaustActivity(){
    createEncryptedImage()
    let newInputTable = document.createElement("table");
    newInputTable.setAttribute("id", "exhaustTable")
    let inputRowEdge = document.createElement("tr");
    for(let i=0; i<5; i++){
        let inputContainer = document.createElement("th")
        let inputBox = document.createElement("p");
        inputBox.classList.add("exhaustInput");
        inputBox.innerText = "A"
        inputBox.addEventListener("click", e=>{
            if(attemptCode[i]>0){
                attemptCode[i] = 0
                inputBox.innerText = "A"
            } else{
                attemptCode[i] = 1
                inputBox.innerText = "B"
            }
        })
        inputContainer.appendChild(inputBox)
        inputRowEdge.append(inputContainer)
    }
    newInputTable.appendChild(inputRowEdge)
    document.getElementById("exhaustInputArea").appendChild(newInputTable)
    let newIconTable = document.createElement("table");
    for(let i=0; i<5; i++){
        let newRowEdge = document.createElement("tr");
        for(let j=0; j<5; j++){
            let newField = document.createElement("td");
            newField.classList.add("exhaustField")
            newField.setAttribute("id", "exhaust" + "field" + i + "," + j)
            if(ledImages[imageToEncrypt][i][j]>0){
                newField.classList.add("exhaustActive")
            }
            newRowEdge.appendChild(newField);
        }
        newIconTable.appendChild(newRowEdge);
    }
    document.getElementById("exhaustImageArea").appendChild(newIconTable);
    encryptExhaustActivity();
}

function encryptExhaustActivity(){
    for(let i=0; i<5; i++){
        if(encryptionCode[i]>0){
            flipColumn(i) 
        }
    }
}

function flipColumn(columnNumber){
    for(let j=0; j<5; j++){
        document.getElementById("exhaust" + "field" + j + "," + columnNumber).classList.toggle("exhaustActive")
    }
}

function resetExhaustImage(){
    for(let i=0; i<5; i++){
        for(let j=0; j<5; j++){
            if(ledImages[imageToEncrypt][i][j]>0){
                if(!document.getElementById("exhaust" + "field" + i + "," + j).classList.contains("exhaustActive")){
                    document.getElementById("exhaust" + "field" + i + "," + j).classList.toggle("exhaustActive")
                }    
            } else {
                if(document.getElementById("exhaust" + "field" + i + "," + j).classList.contains("exhaustActive")){
                    document.getElementById("exhaust" + "field" + i + "," + j).classList.toggle("exhaustActive")
                }  
            }
            
        }    
    }
}