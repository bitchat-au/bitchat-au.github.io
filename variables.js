let lightGreenColor = "#74BF04";
let darkGreenColor = "#488C03";
let lightRedColor = "#D90D0D"
let darkRedColor = "#731212"
let lightColor = lightGreenColor

var language = 0 // 0 = Danish, 1 = English

document.querySelector(':root').style.setProperty('--light-color', lightGreenColor)
document.querySelector(':root').style.setProperty('--dark-color', darkGreenColor)

let allowRecipient = false;
let autoRecipient = false
let allowEncryption = false;
let autoEncryption = false;
let allowHacking = false;

let lastResetTime = new Date().getTime()/1000;

const knownConnections = document.getElementById("knownMicrobits");
const messageBoard = document.getElementById("messageBoard");
const serverSpace = document.getElementById("serverSpace");
let messageIndex = 0;
let hashCode = ""

let messageConstruct = [];  // array to construct messages from the microbit

// locally store any information received from the microbit
let knownMicrobits = []; // [0] are the actual microbit names, [1] are the assigned numerical id's

let newMessageList = [[false, ""],[false, ""],[false, ""],[false, ""],[false, ""], ["", ""]];
let lastMessageStats = ["", "", ""];

let newImages = []

var features = [  ["serverButton", "", "server"],                       //0
                    ["translaterButton", "", "translate"],              //1
                    ["builderButton", "", "build"],                     //2
                    ["changeRecipientButton", "", "changeReciever"],    //3
                    ["recipientButton", "", "receiver"],                //4
                    ["encryptButton", "", "encrypt"],                   //5
                    ["autoEncryptButton", "", "autoEncrypt"],           //6
                    ["breakButton", "", "break"],                       //7
                    ["hackingButton", "", "hack"]];                     //8

function setFeatureLanguage(){
  if(language<1){
      features[0][1] = "Se Server";
      features[1][1] = "Se Oversætter";
      features[2][1] = "Tilføj Billede-byggeren";
      features[3][1] = "Tilføj modtager";
      features[4][1] = "Automatiser modtager";
      features[5][1] = "Tillad Kryptering";
      features[6][1] = "Automatiser Kryptering";
      features[7][1] = "Tilføj Kode-knækkeren";
      features[8][1] = "Tillad Hacking";
  } else{
      features[0][1] = "See Server";
      features[1][1] = "See translator";
      features[2][1] = "Add the Image builder";
      features[3][1] = "Add recipient";
      features[4][1] = "Auto recipient";
      features[5][1] = "Allow Encryption";
      features[6][1] = "Auto Encryption";
      features[7][1] = "Add Code breaker";
      features[8][1] = "Allow Hacking";
  }
}

const localImages = [[[0,0,0,0,0],[0,1,0,1,0],[0,0,0,0,0],[1,0,0,0,1],[0,1,1,1,0]], 
                    [[0,0,0,0,0],[0,1,0,1,0],[0,0,0,0,0],[0,1,1,1,0],[1,0,0,0,1]]];

const ledNumber = [[[0,0,1,0,0],[0,1,1,0,0],[0,0,1,0,0],[0,0,1,0,0],[0,1,1,1,0]], // 1
                  [[1,1,1,0,0],[0,0,0,1,0],[0,1,1,0,0],[1,0,0,0,0],[1,1,1,1,0]], // 2
                  [[1,1,1,1,0],[0,0,0,1,0],[0,0,1,0,0],[1,0,0,1,0],[0,1,1,0,0]], // 3
                  [[0,0,1,1,0],[0,1,0,1,0],[1,0,0,1,0],[1,1,1,1,1],[0,0,0,1,0]], // 4
                  [[1,1,1,1,1],[1,0,0,0,0],[1,1,1,1,0],[0,0,0,0,1],[1,1,1,1,0]], // 5
                  [[0,0,0,1,0],[0,0,1,0,0],[0,1,1,1,0],[1,0,0,0,1],[0,1,1,1,0]], // 6
                  [[1,1,1,1,1],[0,0,0,1,0],[0,0,1,0,0],[0,1,0,0,0],[1,0,0,0,0]], // 7
                  [[0,1,1,1,0],[1,0,0,0,1],[0,1,1,1,0],[1,0,0,0,1],[0,1,1,1,0]], // 8
                  [[0,1,1,1,0],[1,0,0,0,1],[0,1,1,1,0],[0,0,1,0,0],[0,1,0,0,0]]]; // 9

const ledImages = [[[0,1,0,1,0],[1,1,1,1,1],[1,1,1,1,1],[0,1,1,1,0],[0,0,1,0,0]], // heart
                  [[0,0,0,0,0],[0,1,0,1,0],[0,0,0,0,0],[1,0,0,0,1],[0,1,1,1,0]], // happy
                  [[0,0,0,0,0],[0,1,0,1,0],[0,0,0,0,0],[0,1,1,1,0],[1,0,0,0,1]], // sad
                  [[0,1,1,0,0],[1,1,1,0,0],[0,1,1,1,1],[0,1,1,1,0],[0,0,0,0,0]], // duck
                  [[0,0,1,0,0],[0,1,1,1,0],[1,1,1,1,1],[0,1,1,1,0],[0,1,1,1,0]], // house
                  [[0,1,1,1,0],[1,0,1,0,1],[1,1,1,1,1],[1,1,1,1,1],[1,0,1,0,1]], // ghost
                  [[1,1,0,0,0],[0,1,0,0,0],[0,1,0,0,0],[0,1,1,1,0],[0,1,0,1,0]], // giraffe
                  [[0,1,1,1,0],[1,1,1,1,1],[0,0,1,0,0],[1,0,1,0,0],[1,1,1,0,0]], // umbrella
                  [[1,1,0,0,0],[1,1,0,1,1],[0,1,0,1,0],[0,1,1,1,0],[0,0,0,0,0]], // snake
                  [[1,0,1,0,0],[1,0,1,0,0],[1,1,1,1,0],[1,1,0,1,0],[1,1,1,1,0]], // rabbit
                  [[1,0,0,0,1],[1,0,0,0,1],[1,1,1,1,1],[0,1,1,1,0],[0,0,1,0,0]], // cow
                  [[1,0,1,0,1],[1,0,1,0,1],[1,1,1,1,1],[0,0,1,0,0],[0,0,1,0,0]], // pitchfork
                  [[0,0,1,0,0],[0,0,1,0,0],[0,0,1,0,0],[0,1,1,1,0],[0,0,1,0,0]]]; // sword
