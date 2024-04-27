


// ==UserScript==
// @name         Tlem AutoPrompt v2
// @namespace    http://tampermonkey.net/
// @version      2.1
// @description  try to take over the world!
// @author       ArturM
// @match        https://edu.t-lem.com/
// @updateURL    https://github.com/Rutra09/tlem_autoprompt/raw/master/Tlem_AutoPrompt2.user.js
// @downloadURL  https://github.com/Rutra09/tlem_autoprompt/raw/master/Tlem_AutoPrompt2.user.js
// @icon         https://www.google.com/s2/favicons?sz=64&domain=t-lem.com
// @require  https://gist.github.com/raw/2625891/waitForKeyElements.js
// @grant       GM_xmlhttpRequest
// ==/UserScript==
class Prompt {
    title = "";
    content = "";
    buttons = [];
    constructor(title, content, buttons) {
        this.title = title;
        this.content = content;
        this.buttons = buttons;
    }
    static promptContentHeader = "W poniższym cytacie otrzymasz zadanie. Masz odpowiadać samymy gotowym kodem. \n\"";
    static promptHolderStyle = `position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0,0,0,0.5); z-index: 9998;`;
    static h1Style = `font-size: 1.5em; margin: 0;`;
    static pStyle = `margin: 0;`;
    // can be scrolled
    static style = `position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); background-color: white; padding: 20px; box-shadow: 0 4px 8px rgba(0,0,0,0.2); z-index: 9999; border-radius: 10px; max-height: 80%; overflow-y: auto;`;
}

class Button {
    text = "";
    action = () => { };
    customStyle = false;
    constructor(text, action, customStyle = false) {
        this.text = text;
        this.action = action;
        this.customStyle = customStyle;
    }
    static buttonsGroupStyle = `display: flex; justify-content: space-around; align-items: center;`;
    static style = `padding: 10px; margin: 10px; border-radius: 5px; background-color: #007bff; color: white; border: none; cursor: pointer;`;
}

function addFloatingButton() {
    let floatingButton = document.createElement("button");
    let svg = '<svg xmlns="http://www.w3.org/2000/svg" class="ionicon" viewBox="0 0 512 512"><path d="M160 164s1.44-33 33.54-59.46C212.6 88.83 235.49 84.28 256 84c18.73-.23 35.47 2.94 45.48 7.82C318.59 100.2 352 120.6 352 164c0 45.67-29.18 66.37-62.35 89.18S248 298.36 248 324" fill="none" stroke="currentColor" stroke-linecap="round" stroke-miterlimit="10" stroke-width="40"/><circle fill="currentColor" cx="248" cy="399.99" r="32"/></svg>'
    floatingButton.innerHTML = svg;
    floatingButton.style.cssText = `position: fixed; bottom: 20px; width: 50px; left: 50%; padding: 2px; border-radius: 50%; background-color: rgb(0, 123, 255); color: white; border: medium; cursor: pointer; transform: translateX(-50%);height: 50px;`;
    document.body.appendChild(floatingButton);
    floatingButton.addEventListener("click", function () {
        console.log(getLessonID());
        newLesson();
    });
}

function getLessonID() {
    let url = window.location.href;
    let lessonID = url.split(":")[2];
    return lessonID;
}

function onContentNauka() {
    'use strict';
    waitForKeyElements("lekcja_next", function (element) {
        element.addEventListener("click", newLesson);
    });
    addFloatingButton();
    //newLesson();
}

function determineLessonTypes() {
    return new Promise((resolve, reject) => {

        let lessonTypes = []

        let activeLekcja = document.querySelectorAll("#lekcja-items > *.active");
        activeLekcja.forEach(function (element) {
            let lessonType = element.id.split("-")[1].slice("t_".length);
            lessonTypes.push(lessonType);
        });
        resolve(lessonTypes);

    });
}

function newLesson() {
    console.log("newLesson");
    determineLessonTypes().then((lessonTypes) => {
        console.log(lessonTypes);
        switch (lessonTypes[0]) {
            case "wiki":
                alert("Nie ma jeszcze obsługi dla lekcji typu wiki");
                break;
            case "quiz":
                handleQuiz();
                break;
            case "code":
                handleCode();
                break;
            case "video":
                alert("Nie ma jeszcze obsługi dla lekcji typu video");
                break;
            case "sql":
                alert("Nie ma jeszcze obsługi dla lekcji typu sql");
                break;
            default:
                alert("Nieznany typ lekcji");
                break;
        }
    });
}

function showPrompt(prompt) {
    let promptHolder = document.getElementById("prompt-holder");
    if (promptHolder) {
        promptHolder.remove();
    }
    if (prompt instanceof Prompt) {
        let promptDiv = document.createElement("div");
        promptDiv.style.cssText = Prompt.style;
        let h1 = document.createElement("h1");
        h1.style.cssText = Prompt.h1Style;
        h1.textContent = prompt.title;
        let p = document.createElement("p");
        p.style.cssText = Prompt.pStyle;
        p.textContent = prompt.content;
        let buttonsGroup = document.createElement("div");
        buttonsGroup.style.cssText = Button.buttonsGroupStyle;
        prompt.buttons.forEach(function (button) {
            let buttonElement = document.createElement("button");
            buttonElement.style.cssText = Button.style;
            if (button.customStyle) {
                buttonElement.style.cssText = button.customStyle;
            }
            buttonElement.textContent = button.text;
            buttonElement.onclick = button.action;
            buttonsGroup.appendChild(buttonElement);
        });
        promptDiv.appendChild(h1);
        promptDiv.appendChild(p);
        promptDiv.appendChild(buttonsGroup);
        let promptHolder = document.createElement("div");
        promptHolder.style.cssText = Prompt.promptHolderStyle;
        promptHolder.id = "prompt-holder";
        promptHolder.appendChild(promptDiv);
        document.body.appendChild(promptHolder);
    }
}

function handleQuiz() {
    alert("Już 28.04.2024 o 18:00");
}

function getExcerciseText() {
    let excerciseElements = document.querySelectorAll("#lekcja-t_tresc > div");
    let excerciseText = "";
    excerciseElements.forEach(function (element) {
        if (element.textContent.includes("Zadanie:")) {
            excerciseText = element.textContent;
        }
    });
    return excerciseText;
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(function () {
    }, function () {
        alert("Błąd kopiowania");
    });
}

function getSourceCode() {
    let fileData = [];
    document.querySelectorAll("[id^=\"tab_file_\"]").forEach(function (element) {
        document.querySelector("[href='#" + element.id + "']").click();
        let codeLayer = document.querySelector("#" + element.id).querySelector(".ace_layer.ace_text-layer");
        let fileName = element.id;
        let fileContent = "";
        let codeLines = codeLayer.querySelectorAll('.ace_line');
        for (let line of codeLines) {
            fileContent += line.textContent + '\n';
        }
        fileData.push({ fileName: fileName, fileContent: fileContent });
    });
    console.log(fileData);
    return fileData;

}



function replaceAll(str, find, replace) {
    return str.replace(new RegExp(find, 'g'), replace);
}

function handleCode() {
    let excerciseText = getExcerciseText();
    let promptContent = `${Prompt.promptContentHeader}${excerciseText}`
    let sourceCodeFiles = getSourceCode();
    sourceCodeFiles.forEach(function (file) {
        promptContent += `\n\`\`\`${file.fileName}\n${file.fileContent}\n\`\`\``;
    });
    let prompt = new Prompt("Prompt Dla AI", promptContent, [new Button("Kopiuj", function (ev) {
        copyToClipboard(promptContent);
        ev.target.textContent = "Skopiowano";
        ev.target.style.backgroundColor = "green";
        setTimeout(() => {
            ev.target.textContent = "Kopiuj";
            ev.target.style.backgroundColor = "#007bff";
        }, 3000);
    }),
    new Button("Sprawdź w bazie", function () {
        let lessonID = getLessonID();
        let url = `http://tlem.arturm.me/getLesson/?id=${lessonID}`;
        GM_xmlhttpRequest({
            method: "GET",
            url: url,
            onload: function (response) {
               if(response.responseText === "No data for this lesson") {
                   alert("Brak danych w bazie");
               } else {
                console.log(response.responseText); 
                    let data = JSON.parse(response.responseText);
                    console.log(data);
                    let actualPrompt = document.getElementById("prompt-holder").querySelector("p");
                    for (let key in data) {
                        let div = document.createElement("div");
                        let h2 = document.createElement("h3");
                        // the break line is not working
                        h2.innerHTML = key.replace("\n", "<br>");
                        h2.style.cssText = "margin: 0;background-color: #007bff;color: white;padding: 10px;cursor: pointer;";
                        div.appendChild(h2);
                        let p = document.createElement("p");
                        let splitedContent = data[key].split("\\n");
                        splitedContent.forEach(function (line) {
                            let code = document.createElement("span");
                            code.textContent = line;
                            p.appendChild(code);
                            p.appendChild(document.createElement("br"));
                        });
                        p.style.cssText = "margin: 0;padding: 10px; background-color: grey; color: white;";
                        div.appendChild(p);
                        div.style.cssText = "margin: 10px; border: 1px solid #007bff; border-radius: 5px;";
                        actualPrompt.appendChild(div);
                    }

               }
                
            }
        });
    }),
        ,
    new Button("X", function () { document.getElementById("prompt-holder").remove() }, "background-color: red;color: white; border: none; height: min-content; padding: 10px; border-radius: 5px; cursor: pointer;")]);
    showPrompt(prompt);
}



(function () {
    'use strict';
    waitForKeyElements("#lekcja-t_wiki", onContentNauka, true);

})();