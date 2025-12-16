for(let i=0; i<features.length;i++){
    addFeatureToggle(features[i][0], features[i][1], features[i][2])
}

document.getElementById("trafficButton").addEventListener("click", e=>{
    document.getElementById("trafficContent").classList.toggle("hidden")
    if(!document.getElementById("imageBuilderContent").classList.contains("hidden")){
        document.getElementById("imageBuilderContent").classList.toggle("hidden")
    }
    if(!document.getElementById("exhaustContent").classList.contains("hidden")){
        document.getElementById("exhaustContent").classList.toggle("hidden")
    }
})

document.getElementById("imageButton").addEventListener("click", e=>{
    document.getElementById("imageBuilderContent").classList.toggle("hidden")
    if(!document.getElementById("trafficContent").classList.contains("hidden")){
        document.getElementById("trafficContent").classList.toggle("hidden")
    }
    if(!document.getElementById("exhaustContent").classList.contains("hidden")){
        document.getElementById("exhaustContent").classList.toggle("hidden")
    }
})

document.getElementById("exhaustButton").addEventListener("click", e=>{
    document.getElementById("exhaustContent").classList.toggle("hidden")
    if(!document.getElementById("imageBuilderContent").classList.contains("hidden")){
        document.getElementById("imageBuilderContent").classList.toggle("hidden")
    }
    if(!document.getElementById("trafficContent").classList.contains("hidden")){
        document.getElementById("trafficContent").classList.toggle("hidden")
    }
})

document.getElementById("inspectFeaturesButton").addEventListener("click", e=>{
    document.getElementById("featureContainer").classList.toggle("hidden")
    if(!document.getElementById("tableContainer").classList.contains("hidden")){
        document.getElementById("tableContainer").classList.toggle("hidden")
    }
})

document.getElementById("includeNewFeature").addEventListener("click", e=>{
    document.getElementById("featurePopUp").classList.toggle("hidden")
})

document.getElementById("closeFeaturePopup").addEventListener("click", e=>{
    document.getElementById("featureInput").value = "";
    document.getElementById("featurePopUp").classList.toggle("hidden")
})

document.getElementById("inspectIdsButton").addEventListener("click", e=>{
    document.getElementById("tableContainer").classList.toggle("hidden")
    if(!document.getElementById("featureContainer").classList.contains("hidden")){
        document.getElementById("featureContainer").classList.toggle("hidden")
    }
})

document.getElementById("addFeaturePopup").addEventListener("click", e=>{
    let featureCode = document.getElementById("featureInput").value;
    detectFeatureRequest(featureCode);
})

document.getElementById("featureInput").addEventListener("keypress", e=>{
    if(e.key == "Enter"){
        let featureCode = document.getElementById("featureInput").value;
        detectFeatureRequest(featureCode);
    }
})

function detectFeatureRequest(featureCode){
    document.getElementById("featurePopUp").classList.toggle("hidden")
    document.getElementById("featureInput").value = "";
    switch(featureCode.toLowerCase()){
        case "server":
            document.getElementById(features[0][2] + "Toggle").classList.toggle("hidden");
            document.getElementById("serverSpace").classList.toggle("hidden")
            document.getElementById("trafficButton").classList.toggle("hidden")
            break;
        case "oversæt":
            document.getElementById(features[1][2] + "Toggle").classList.toggle("hidden");
            document.getElementById("translaterSpace").classList.toggle("hidden")
            break;
        case "oversat":
            document.getElementById(features[1][2] + "Toggle").classList.toggle("hidden");
            document.getElementById("imageButton").classList.toggle("hidden")
            break;
        case "byg":
            document.getElementById(features[2][2] + "Toggle").classList.toggle("hidden");
            document.getElementById("imageButton").classList.toggle("hidden")
            break;
        case "modtager":
            allowRecipient = true;
            writeToMB("yesRecipient")
            document.getElementById(features[3][2] + "Toggle").classList.toggle("hidden");
            document.getElementById(features[4][2] + "Toggle").classList.toggle("hidden");
            document.getElementById(features[4][0]).classList.toggle("toggleActive");
            document.getElementById(features[4][0] + "Inner").classList.toggle("toggleInnerActive");
            break;
        case "krypter":
            allowEncryption = true;
            writeToMB("yesEncrypt")
            document.getElementById(features[5][2] + "Toggle").classList.toggle("hidden");
            document.getElementById(features[6][2] + "Toggle").classList.toggle("hidden");
            document.getElementById(features[6][0]).classList.toggle("toggleActive");
            document.getElementById(features[6][0] + "Inner").classList.toggle("toggleInnerActive");
            break;
        case "knak":
            document.getElementById(features[7][2] + "Toggle").classList.toggle("hidden");
            document.getElementById("exhaustButton").classList.toggle("hidden")
            break;
        case "knæk":
            document.getElementById(features[7][2] + "Toggle").classList.toggle("hidden");
            document.getElementById("exhaustButton").classList.toggle("hidden")
            break;
        case "hack":
            allowHacking = true;
            document.getElementById(features[8][2] + "Toggle").classList.toggle("hidden");
            document.querySelector(':root').style.setProperty('--light-color', lightRedColor)
            document.querySelector(':root').style.setProperty('--dark-color', darkRedColor)
            document.body.style.backgroundColor = "RGB(120, 0, 0, 0.5)";
            lightColor = lightRedColor
            break;
        case "pakke1":
            activatePackage1()
    }
}

function activatePackage1(){
    detectFeatureRequest("server")
    detectFeatureRequest("oversæt")
    detectFeatureRequest("byg")
    detectFeatureRequest("modtager")
    autoRecipient = true
    document.getElementById("recipientButton").classList.toggle("toggleActive")
    document.getElementById("recipientButtonInner").classList.toggle("toggleInnerActive")
    if(!document.getElementById("featurePopUp").classList.contains("hidden")){
        document.getElementById("featurePopUp").classList.toggle("hidden")
    }
}

function addFeatureToggle(toggleId, toggleName, functionality){
    let toggleContainer = document.createElement("div");
    toggleContainer.classList.add("toggleButton");
    toggleContainer.classList.add("hidden");
    if(functionality == features[4][2] || functionality == features[6][2]){
        toggleContainer.classList.add("subToggle");
    }
    toggleContainer.setAttribute("id", functionality + "Toggle")
    let toggleText = document.createElement("p");
    toggleText.classList.add("toggleText");
    toggleText.innerText = toggleName;
    let buttonOuter = document.createElement("div");
    buttonOuter.setAttribute("id", toggleId);
    buttonOuter.classList.add("switch");
    buttonOuter.classList.add("toggleActive");
    let buttonInner = document.createElement("div");
    buttonInner.setAttribute("id", toggleId + "Inner")
    buttonInner.classList.add("switchInner");
    buttonInner.classList.add("toggleInnerActive");

    toggleContainer.appendChild(buttonOuter)
    buttonOuter.appendChild(buttonInner)
    toggleContainer.appendChild(toggleText)

    buttonOuter.addEventListener("click", e=>{
        buttonOuter.classList.toggle("toggleActive")
        buttonInner.classList.toggle("toggleInnerActive")

        switch(functionality) {
            case features[0][2]:    // Server button
                document.getElementById("serverSpace").classList.toggle("hidden")
                document.getElementById("trafficButton").classList.toggle("hidden")
                break;
            case features[1][2]:    // Translater button
                document.getElementById("translaterSpace").classList.toggle("hidden")
                break;
            case features[2][2]:    // Builder button
                document.getElementById("imageButton").classList.toggle("hidden")
                break;
            case features[3][2]:    // Recipient button
                if(allowRecipient){
                    allowRecipient = false
                    writeToMB("noRecipient")
                } else {
                    allowRecipient = true
                    writeToMB("yesRecipient")
                }
                break;
            case features[4][2]:    // Autorecipient button
                if(allowRecipient){
                    if(autoRecipient){
                        autoRecipient = false
                    } else {
                        autoRecipient = true
                    }
                } else {
                    buttonOuter.classList.toggle("toggleActive")
                    buttonInner.classList.toggle("toggleInnerActive")
                }
                break;
            case features[5][2]:    // Encrypt button
                if(allowEncryption){
                    allowEncryption = false
                    writeToMB("noEncrypt")
                    if(autoEncryption){
                        autoEncryption = false;
                        document.getElementById(features[6][0]).classList.toggle("toggleActive")
                        document.getElementById(features[6][0] + "Inner").classList.toggle("toggleInnerActive")
                    }
                } else {
                    if(allowHacking){
                        allowHacking = false
                        document.querySelector(':root').style.setProperty('--light-color', '#74BF04')
                        document.querySelector(':root').style.setProperty('--dark-color', '#488C03')
                        document.body.style.backgroundColor = "white";
                        lightColor = "#74BF04"
                        darkColor = "#488C03"
                        document.getElementById(features[7][0]).classList.toggle("toggleActive")
                        document.getElementById(features[7][0] + "Inner").classList.toggle("toggleInnerActive")
                    }
                    allowEncryption = true
                    writeToMB("yesEncrypt")
                }
                break;
            case features[6][2]:    // Autoencrypt button
                if(allowEncryption){
                    if(autoEncryption){
                        autoEncryption = false
                        writeToMB("noAutoEncrypt")
                    } else {
                        autoEncryption = true
                        writeToMB("yesAutoEncrypt")
                    }
                } else {
                    buttonOuter.classList.toggle("toggleActive")
                    buttonInner.classList.toggle("toggleInnerActive")
                }
                break;
            case features[7][2]:    // breaker button
                document.getElementById("exhaustButton").classList.toggle("hidden")
                break;
            case features[8][2]:    // Hack button
                if(allowHacking){
                    allowHacking = false
                    console.log("disable hacking")
                    document.querySelector(':root').style.setProperty('--light-color', lightGreenColor)
                    document.querySelector(':root').style.setProperty('--dark-color', darkGreenColor)
                    document.body.style.backgroundColor = "white";
                    lightColor = lightGreenColor
                } else {
                    if(allowEncryption){
                        allowEncryption = false
                        writeToMB("noEncrypt")
                        document.getElementById(features[4][0]).classList.toggle("toggleActive")
                        document.getElementById(features[4][0] + "Inner").classList.toggle("toggleInnerActive")
                    }
                    allowHacking = true
                    console.log("enable hacking")
                    document.querySelector(':root').style.setProperty('--light-color', lightRedColor)
                    document.querySelector(':root').style.setProperty('--dark-color', darkRedColor)
                    document.body.style.backgroundColor = "RGB(120, 0, 0, 0.5)";
                    lightColor = lightRedColor
                }
            
            }
    })

    document.getElementById("featureContainer").appendChild(toggleContainer);
}
