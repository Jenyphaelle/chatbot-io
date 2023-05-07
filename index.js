'use strict';

class Message {
  constructor(text, author, isBot){
    this.text = text;
    this.author = author;
    this.isBot = isBot
  }
}

class User {
  constructor(name){
    this.name = name;
  }

  addChatEntry(input) {
    const messagesContainer = document.getElementById("messages");

    let divMessageContainer = document.createElement("div");
    divMessageContainer.classList.add("msg");
    divMessageContainer.classList.add("right-msg");

    let divImg = document.createElement("div");
    divImg.classList.add("msg-img");
    divImg.classList.add("me");

    let divBubble = document.createElement("div");
    divBubble.classList.add("msg-bubble");

    let divInfo = document.createElement("div");
    divInfo.classList.add("msg-info");

    let divName = document.createElement("div");
    divName.classList.add("msg-info-name");
    divName.innerHTML = this.name;

    let divTime = document.createElement("div");
    divTime.classList.add("msg-info-time");
    divTime.innerHTML =  new Date().toLocaleTimeString('en-US', { hour12: false, hour: "numeric", minute: "numeric"})

    let divText = document.createElement("div");
    divText.classList.add("msg-text");
    divText.innerHTML = input;

    divMessageContainer.appendChild(divImg);
    divMessageContainer.appendChild(divBubble);
    divBubble.appendChild(divInfo);
    divBubble.appendChild(divText)
    divInfo.appendChild(divName);
    divInfo.appendChild(divTime);

    messagesContainer.appendChild(divMessageContainer);
    scrollToLastMessage();
    messagesHistory.push(new Message(input, this, false));
    localStorage.removeItem("messagesHistory");
    localStorage.setItem("messagesHistory", JSON.stringify(messagesHistory));
  }
}

class Bot {
  constructor(name, commands, avatar) {
    this.name = name;
    this.commands = commands;
    this.avatar = avatar;
  }

  isBotCommand(command){
    for (let x = 0; x < this.commands.length; x++) {
      if (this.commands[x]["cmd"] == command) {
        return true;
      }
   }
  return false;
  }


  addChatEntry(message) {
    const messagesContainer = document.getElementById("messages");

    let divMessageContainer = document.createElement("div");
    divMessageContainer.classList.add("msg");
    divMessageContainer.classList.add("left-msg");

    let divImg = document.createElement("div");
    divImg.classList.add("msg-img");
    divImg.classList.add("bot" + this.name);

    let divBubble = document.createElement("div");
    divBubble.classList.add("msg-bubble");

    let divInfo = document.createElement("div");
    divInfo.classList.add("msg-info");

    let divName = document.createElement("div");
    divName.classList.add("msg-info-name");
    divName.innerHTML = this.name;

    let divTime = document.createElement("div");
    divTime.classList.add("msg-info-time");

    divTime.innerHTML =  new Date().toLocaleTimeString('en-US', { hour12: false, hour: "numeric", minute: "numeric"})

    let divText = document.createElement("div");
    divText.classList.add("msg-text");
    divText.innerHTML = "est en train d'écrire...";

    divMessageContainer.appendChild(divImg);
    divMessageContainer.appendChild(divBubble);
    divBubble.appendChild(divInfo);
    divBubble.appendChild(divText)
    divInfo.appendChild(divName);
    divInfo.appendChild(divTime);

    messagesContainer.appendChild(divMessageContainer);


    setTimeout(() => {
      divText.innerHTML = `${message}`;
    }, 2000); 

    scrollToLastMessage();

    messagesHistory.push(new Message(message, this, true));
    localStorage.removeItem("messagesHistory");
    localStorage.setItem("messagesHistory", JSON.stringify(messagesHistory));

  }
  

  async askToBot(arrayInput) {
    let answer;
    let command = arrayInput[0];

    switch (command) {
      case "/help":
        answer = this.listAllCommands();
        break;
      case "/bonjour":
        answer = this.sayHello();
        break;
      case "/holidays":
        console.log(arrayInput);
        if(arrayInput.length != 2 || arrayInput[1] == null || arrayInput[1].length < 4){
          answer = "Cette commande nécessite un unique paramètre : l'année en 4 chiffres. <br> Veuillez reformuler votre demande. <br> Exemple : /holidays 2023";
        }else{
          answer = await this.getHolidays(arrayInput[1]);
        }
        break;
      case "/cats":
        answer = this.getCatFact();
        break;
      case "/bored":
        answer = this.getActivity();
        break;
      default:
        break;
    }
    return answer;
  }


  sayHello() {
    return salutations[Math.floor(Math.random() * salutations.length)];
  }

  async getHolidays(year){
    let url = "https://calendrier.api.gouv.fr/jours-feries/metropole/";
    url += year;
    url += ".json";

    let response = await this.launchRequest(url);
    return this.formatHolidays(response);
  }

  async launchRequest(url) {
    const response = await fetch(url);
    const jsonData = await response.json();
    return jsonData;
  }

  formatHolidays(holidays){
    let result = "Voici la liste des jours fériés pour l'annee : <br>";
    for (var day in holidays) {
      result += day + " : " + holidays[day] + "<br>";
    }
    return result;
  }

  listAllCommands(){
    let result = "Voici la liste des commandes auxquelles je peux répondre. <br>";
    for (var i = 0; i < this.commands.length; i++) {
      result += this.commands[i]["cmd"];
      if(this.commands[i].hasOwnProperty("params")){
        for (var x = 0; x < this.commands[i]["params"].length; x++) {
          result += " " + this.commands[i]["params"][x];
        }
      }
      result += " " + this.commands[i]["desc"] + "<br>";
    }
    return result;
  }

  async getCatFact(){
    let url = "https://meowfacts.herokuapp.com/?count=1";
    let response = await this.launchRequest(url);
    response = response["data"][0];
    return response;
  }

  async getActivity(){
    let url = "https://www.boredapi.com/api/activity";
    let response = await this.launchRequest(url);
    response = response["activity"] + "<br>" + response["link"];
    return response;
  }
}

const salutations = [
    "Bonjour",
    "Salut",
    "Hey",
    "Yo"
    ]

const bot1Commands = [
  {cmd : "/bonjour", desc : "Dit bonjour."},
  {cmd: "/help", desc: "Liste toutes les commandes disponibles."},
  {cmd: "/holidays", desc: "Liste tous les jours fériés de métropole Française pour l'année demandée.", params: ["&lt;annee&gt;"]}
]

const bot2Commands = [
  {cmd : "/bonjour", desc : "Dit bonjour."},
  {cmd: "/help", desc: "Liste toutes les commandes disponibles."},
  {cmd: "/cats", desc: "Donne un fait sur les chats, en anglais."}
]


const bot3Commands = [
  {cmd : "/bonjour", desc : "Dit bonjour."},
  {cmd: "/help", desc: "Liste toutes les commandes disponibles."},
  {cmd: "/bored", desc: "Donne une activité à faire quand on s'ennuie, en anglais."}
]

const bots = [
  new Bot("Georges", bot1Commands, "bot1.png"),
  new Bot("Charles", bot2Commands, "bot2.png"),
  new Bot("Bernard", bot3Commands, "bot3.png")
  ];

const user = new User("Moi");

let messagesHistory = [];


document.addEventListener("DOMContentLoaded", () => {
  displayHistory();
  const inputField = document.getElementById("inputMessage");
  inputField.addEventListener("keydown", function(e) {
      if (e.code === "Enter") {
        sendMessage();
      }
  });
  localStorage.setItem("messagesHistory", {data:["Un message", "et un autre"]});
  //console.log(localStorage.getItem("messagesHistory"));
  buildBotList(bots);
});

async function sendMessage(){
  const inputField = document.getElementById("inputMessage");
  let input = inputField.value;
  inputField.value = "";

  if(input!= null && input.length > 0){
    user.addChatEntry(input);

    //Récupère la commande entrée par l'utilisateur
    const arrayUserQuery = input.toLowerCase().split(' ');

    let nbAnswers = 0;
    for (var i =  0; i < bots.length; i++) {
      const currentBot = bots[i];
      if(currentBot.isBotCommand(arrayUserQuery[0])){
        const answer = await currentBot.askToBot(arrayUserQuery);
        currentBot.addChatEntry(answer);
        nbAnswers ++;
      }else if (i == bots.length -1 && nbAnswers == 0) {
        addInfoMessage("Désolé, cette commande n'existe pas.");
      }
    }
  }
}

function addInfoMessage(message) {

  const container = document.getElementById("messages");

  let infoContainer = document.createElement('div');
  infoContainer.classList.add("info");
  let infoDiv = document.createElement("div");
  infoDiv.innerHTML = `${message}`;
  infoContainer.appendChild(infoDiv);
  container.appendChild(infoContainer);
}



function buildBotList(botsList){
  let divContainer = document.getElementById('botList');

  for (var i = 0; i < botsList.length; i++) {
    let currentBot = bots[i];
    let divBotContainer = document.createElement('li');
    divBotContainer.classList.add('clearfix');

    let botImg = document.createElement('img');
    botImg.src = currentBot.avatar;
    botImg.alt = "avatar";

    let divAbout = document.createElement('div');
    divAbout.classList.add('about');

    let divName = document.createElement('div');
    divName.classList.add("name");
    divName.innerHTML = currentBot.name;

    let divStatus = document.createElement('div');
    divStatus.classList.add("status");
    let statusIcon = document.createElement('i');
    statusIcon.classList.add("fa");
    statusIcon.classList.add("fa-circle");
    statusIcon.classList.add("online");

    divContainer.appendChild(divBotContainer);
    divBotContainer.appendChild(botImg);
    divBotContainer.appendChild(divAbout);
    divAbout.appendChild(divName);
    divAbout.appendChild(divStatus);
    divStatus.appendChild(statusIcon);
    divStatus.innerHTML += " en ligne";
  }
}

function scrollToLastMessage(){
  let objDiv = document.getElementById("messages");
  objDiv.scrollTop = objDiv.scrollHeight;
}

function displayHistory(){
  if (localStorage.getItem("messagesHistory") != null) {
    let localMessageHistory = JSON.parse(localStorage.getItem("messagesHistory"));
    localStorage.clear();
    for (var i = 0; i < localMessageHistory.length; i++) {
      let sender;
      console.log(localMessageHistory[i]["isBot"]);
      if(localMessageHistory[i]["isBot"] == true){
        let authorName = localMessageHistory[i]["author"]["name"];
        sender = bots.find(o => o.name === authorName);
      }else{
        sender = user;
      }
      sender.addChatEntry(localMessageHistory[i]["text"]);
    }
  }

  
}
