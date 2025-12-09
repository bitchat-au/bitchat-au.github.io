createInputActivity("IB", "inputArea", "outputArea");
createInputActivity("HB", "inputAreaHack", "outputAreaHack")
displayKnownImages();

document.getElementById("finishImageButton").addEventListener("click", e=>{
    if(!messageValid("IB")){
        alert("Et eller flere af tallene er ikke 0 eller 1");
        return;
    }
    let outputArray = []
    for(let i=0; i<5; i++){
        let rowarray = []
        for(let j=0; j<5; j++){
            rowarray.push(Number(document.getElementById("IBinput" + i + "," + j).innerText))
            document.getElementById("IBinput" + i + "," + j).innerText = "0";
            document.getElementById("IBfield" + i + "," + j).style.backgroundColor = "white";
            if(document.getElementById("IBinput" + i + "," + j).classList.contains("activeField")){
                document.getElementById("IBinput" + i + "," + j).classList.remove("activeField")
            }
        }
        outputArray.push(rowarray);
    }
    localImages.push(outputArray);
    createIcon(outputArray,document.getElementById("knownImages"));
    console.log(outputArray);
    let messageString = "";
    for(let i=0; i<5; i++){
        for(let j=0; j<5; j++){
            messageString += outputArray[i][j];
        }
        if(i<4){
            messageString += ":"
        }
    }
    console.log(messageString);

    newImages.push(messageString)
    console.log(newImages)
    writeToMB("newImg_" + messageString)
})

function displayKnownImages(){
    for(let i=0; i<localImages.length; i++){
        createIcon(localImages[i],document.getElementById("knownImages"))
    }
}

function createInputActivity(prefix, inputId, outputId){
    let newIconTable = document.createElement("table");
    newIconTable.classList.add("icon")
    for(let i=0; i<5; i++){
        let rowindex = document.createElement("p")
        let rowNumber = i+1
        rowindex.innerText = rowNumber;
        rowindex.classList.add("inputSupport");
        rowindex.classList.add("rowNumber")
        document.getElementById(inputId).appendChild(rowindex);
        let newRowEdge = document.createElement("tr");
        for(let j=0; j<5; j++){
            let newField = document.createElement("td");
            newField.classList.add("imageBuilderField")
            newField.setAttribute("id", prefix + "field" + i + "," + j)
            newField.style.backgroundColor ="white"
            newField.addEventListener("mouseover", e=>{
                document.getElementById(prefix + "input" + i + "," + j).style.backgroundColor= lightColor; 
            })
            newField.addEventListener("mouseout", e=>{
                document.getElementById(prefix + "input" + i + "," + j).style.backgroundColor= "white"; 
            })
            newRowEdge.appendChild(newField);

            let newInput = document.createElement("p")
            newInput.setAttribute("id", prefix + "input" + i + "," + j)
            newInput.innerText = "0"
            newInput.classList.add("inputField")
            newInput.style.backgroundColor ="white"
            newInput.addEventListener("click",e=>{
                newInput.classList.toggle("activeField")
                if(newInput.classList.contains("activeField")){
                    document.getElementById(prefix + "input" + i + "," + j).innerText = "1"
                    document.getElementById(prefix + "field" + i + "," + j).style.backgroundColor = lightColor;
                    document.getElementById(prefix + "input" + i + "," + j).style.backgroundColor= "white"; 

                }
                else{
                    document.getElementById(prefix + "input" + i + "," + j).innerText = "0"
                    document.getElementById(prefix + "field" + i + "," + j).style.backgroundColor = "white";
                    document.getElementById(prefix + "input" + i + "," + j).style.backgroundColor= "white"; 
                }
            })
            document.getElementById(inputId).appendChild(newInput);
        }
        newIconTable.appendChild(newRowEdge);
        if(i<4){
            let breakPoint = document.createElement("p")
            breakPoint.innerText = ":"
            breakPoint.classList.add("inputSupport");
            breakPoint.classList.add("breakPoint")
            document.getElementById(inputId).appendChild(breakPoint);
        }
    }
    document.getElementById(outputId).appendChild(newIconTable);
}

function messageValid(prefix){
    let validity = true;
    for(let i=0; i<5; i++){
        for(let j=0; j<5; j++){
            if(document.getElementById(prefix + "input" + i + "," + j).innerText != 1 && document.getElementById(prefix + "input" + i + "," + j).innerText != 0){
                validity = false;
            } 
        }
    }
    return validity;
}
