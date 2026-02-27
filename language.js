// Text from Index file
const inspectFeaturesButtonLnText = ["Feature oversigt", "Feature overview"];
const inspectIdsButtonLnText = ["Bruger navne og id", "User names and id"];
const languageButtonLnText = ["🇬🇧", "🇩🇰"];
const includeNewFeatureLnText = ["Tilføj feature", "Add feature"];
const featurePopUpTextLnText = ["Indtast featurekode", "Input feature code"];
const addFeaturePopupLnText = ["Tilføj feature", "Add feature"];
const closeFeaturePopupLnText = ["Fortryd input", "Regret input"];
const recipientTableNameLnText = ["Navn", "Name"];
const recipientTableIdLnText = ["Id", "Id"];
const startbuttonLnText = ["Forbind micro:bit", "Connect micro:bit"];
const trafficButtonLnText = ["Besked-trafikken", "Message traffic"];
const imageButtonLnText = ["Billede-byggeren", "Image builder"];
const exhaustButtonLnText = ["Kode-knækkeren", "Code breaker"];
const finishImageButtonLnText = ["Gem billede", "Save image"];
const knownMicrobitsTitleLnText = ["Forbundet til serveren:", "Connected to the server:"];
const messageBoardTitleLnText = ["Besked sendt:", "Message sent:"];
const serverSpaceTitleLnText = ["Bit:chat Server", "Bit:chat Server"];
const exhaustOriginLocalLnText = ["Brug egne billeder", "Use own images"];
const exhaustOriginRandomLnText = ["Brug tilfældige billeder", "Use random images"];
const exhaustStartLnText = ["Lav et nyt krypteret billede", "Create a new encrypted image"];
const exhaustCheckLnText = ["Tjek nøgle", "Check key"];
const hackingPopUpTitleLnText = ["Hack beskeder", "Hack messages"];
const hackingDescriptionPart1LnText = ["Lav om i beskeden fra", "Change the message from"];
const hackingDescriptionPart2LnText = ["til", "to"];
const noUpdateHackButtonLnText = ["Send videre uden ændringer", "Forward the message without changes"];
const updateHackButtonLnText = ["Gem ændringer", "Save changes"];
const changePopUpTitleLnText = ["Besked oversigt", "Message overview"];
const changeInformationPart1LnText = ["vil sende", "wants to send"];
const changeInformationPart2LnText = ["til", "to"];
const changeChooserTextLnText = ["Vælg modtager", "Choose recipient"];

const correctCodeBreakerLnText = ["Koden er korrekt", "The code is correct"];
const wrongCodeBreakerLnText = ["Koden er forkert", "The code is wrong"];
const codeBreakerAttemptsLnText = [" tjek", " checks"];

const imageBuilderAllertLnText = ["Et eller flere af tallene er ikke 0 eller 1", "One or more of the numbers is not 0 or 1"];

const translatorTextPart1LnText = ["sendte","sent"]
const translatorTextPart2LnText = ["til","to"]

const serverTextNewMessageLnText = ["NyBesked","NewMessage"]
const serverTextNewConnectionLnText = ["NyForbindelse","NewConnection"]
const serverTextSenderLnText = ["s.id","s.id"]
const serverTextRecipientLnText = ["m.id","r.id"]
const serverTextHashLnText = ["hash","hash"]

function updateLanguage(){
    document.getElementById("inspectFeaturesButton").innerText = inspectFeaturesButtonLnText[language]
    document.getElementById("inspectIdsButton").innerText = inspectIdsButtonLnText[language]
    document.getElementById("languageButton").innerText = languageButtonLnText[language]
    document.getElementById("includeNewFeature").innerText = includeNewFeatureLnText[language]
    document.getElementById("featurePopUpText").innerText = featurePopUpTextLnText[language]
    document.getElementById("addFeaturePopup").innerText = addFeaturePopupLnText[language]
    document.getElementById("closeFeaturePopup").innerText = closeFeaturePopupLnText[language]
    document.getElementById("recipientTableName").innerText = recipientTableNameLnText[language]
    document.getElementById("changeRecipientTableName").innerText = recipientTableNameLnText[language]
    document.getElementById("recipientTableId").innerText = recipientTableIdLnText[language]
    document.getElementById("changeRecipientTableId").innerText = recipientTableIdLnText[language]
    document.getElementById("startbutton").innerText = startbuttonLnText[language]
    document.getElementById("trafficButton").innerText = trafficButtonLnText[language]
    document.getElementById("imageButton").innerText = imageButtonLnText[language]
    document.getElementById("exhaustButton").innerText = exhaustButtonLnText[language]
    document.getElementById("finishImageButton").innerText = finishImageButtonLnText[language]
    document.getElementById("knownMicrobitsTitle").innerText = knownMicrobitsTitleLnText[language]
    document.getElementById("messageBoardTitle").innerText = messageBoardTitleLnText[language]
    document.getElementById("serverSpaceTitle").innerText = serverSpaceTitleLnText[language]
    document.getElementById("exhaustOriginLocalLabel").innerText = exhaustOriginLocalLnText[language]
    document.getElementById("exhaustOriginRandomLabel").innerText = exhaustOriginRandomLnText[language]
    document.getElementById("exhaustStart").innerText = exhaustStartLnText[language]
    document.getElementById("exhaustCheck").innerText = exhaustCheckLnText[language]
    document.getElementById("hackingPopUpTitle").innerText = hackingPopUpTitleLnText[language]
    document.getElementById("hackingDescriptionPart1").innerText = hackingDescriptionPart1LnText[language]
    document.getElementById("hackingDescriptionPart2").innerText = hackingDescriptionPart2LnText[language]
    document.getElementById("noUpdateHackButton").innerText = noUpdateHackButtonLnText[language]
    document.getElementById("updateHackButton").innerText = updateHackButtonLnText[language]
    document.getElementById("changePopUpTitle").innerText = changePopUpTitleLnText[language]
    document.getElementById("changeInformationPart1").innerText = changeInformationPart1LnText[language]
    document.getElementById("changeInformationPart2").innerText = changeInformationPart2LnText[language]
    document.getElementById("changeChooserText").innerText = changeChooserTextLnText[language]
}

updateLanguage()

document.getElementById("languageButton").addEventListener("click", e=>{
    if(language<1){
        language = 1;
    } else {
        language = 0;
    }
    setFeatureLanguage()
    for(let i=0; i<features.length; i++){
        document.getElementById(features[i][0] + "Name").innerText = features[i][1]
    }
    updateLanguage()
})
