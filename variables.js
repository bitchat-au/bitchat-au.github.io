let lightGreenColor = "#74BF04";
let darkGreenColor = "#488C03";
let lightRedColor = "#D90D0D"
let darkRedColor = "#731212"
let lightColor = lightGreenColor

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

const features = [  ["serverButton", "Se Server", "server"],                        //0
                    ["translaterButton", "Se Oversætter", "translate"],             //1
                    ["builderButton", "Tilføj Billede-byggeren", "build"],          //2
                    ["changeRecipientButton", "Tilføj modtager", "changeReciever"], //3
                    ["recipientButton", "Automatiser modtager", "receiver"],        //4
                    ["encryptButton", "Tillad Kryptering", "encrypt"],              //5
                    ["autoEncryptButton", "Automatiser Kryptering", "autoEncrypt"], //6
                    ["breakButton", "Tilføj Kode-knækkeren", "break"],               //7
                    ["hackingButton", "Tillad Hacking", "hack"]];                   //8

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
