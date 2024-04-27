// ==UserScript==
// @name         Tlem AutoPrompt
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       ArturM
// @match        https://edu.t-lem.com/
// @updateURL    https://github.com/Rutra09/tlem_autoprompt/raw/master/Tlem_AutoPrompt.user.js
// @downloadURL  https://github.com/Rutra09/tlem_autoprompt/raw/master/Tlem_AutoPrompt.user.js
// @require  https://gist.github.com/raw/2625891/waitForKeyElements.js
// @icon         https://www.google.com/s2/favicons?sz=64&domain=t-lem.com
// @grant        none
// ==/UserScript==

let isFoundText = false;
let interval;
let Gtext;
function getAllTextFromElement(element) {
    let text = "";
    if (element.nodeType === 3) {
        text += element.textContent;
    } else {
        for (let child of element.childNodes) {
            text += getAllTextFromElement(child);
        }
    }
    return text;
}

function copyToClipboard() {
    let textToCopy = document.getElementById('prompt-text');
    navigator.clipboard.writeText(textToCopy.textContent);

}

function prepareAndShowPrompt(text, fileData) {
    let prompt;
    prompt = "W poniższym cytacie otrzymasz zadanie. Masz odpowiadać samymy gotowym kodem. \n\"";
    prompt += text;
    for (let file of fileData) {
        prompt += "```" + file.name + "\n" + file.content + "```\n";
    }
    prompt += "\""
    if (document.getElementById("prompt-container")) {
        document.getElementById("prompt-container").remove();
    }
    let promptContainer = document.createElement('div');
    promptContainer.id = 'prompt-container';
    promptContainer.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: white;
    padding: 20px;
    box-shadow: 0 4px 8px rgba(0,0,0,0.2);
    z-index: 9999;`;

    let promptText = document.createElement('p');
    promptText.id = 'prompt-text';
    promptText.textContent = prompt;

    let closeButton = document.createElement('button');
    closeButton.id = 'close-button';
    closeButton.textContent = 'X';
    closeButton.onclick = function () {
        promptContainer.remove();
    };
    let copyButton = document.createElement('button');
    copyButton.id = 'copy-button';
    copyButton.textContent = 'Kopiuj';
    copyButton.style.margin = "0 10px"
    copyButton.onclick = copyToClipboard; // Dodajemy kliknięcie przycisku
    let regenerateButton = document.createElement('button');
    regenerateButton.id = 'regenerate-button';
    regenerateButton.textContent = 'Regeneruj';
    regenerateButton.onclick = runDaShit; // Funkcja wywoływana przy kliknięciu



    promptContainer.appendChild(promptText);
    promptContainer.appendChild(closeButton);
    promptContainer.appendChild(copyButton);
    promptContainer.appendChild(regenerateButton);
    document.body.appendChild(promptContainer);


}

function runDaShit() {
    'use strict';

    let el = document.getElementById("lekcja-t_tresc");
    //check for the type of the lesson


    let text = getAllTextFromElement(el)
    let files = document.querySelectorAll('[id^="tab_file_"]');
    if (!(text === "")) {
        clearInterval(interval);
        Gtext = text;
        isFoundText = true;
        let fileData = [];
        for (let file of files) {
            document.querySelector("[href='#" + file.id + "']").click();
        }
        setTimeout(() => {
            for (let file of files) {
                let fileName = file.id; // Dostosuj do rzeczywistej nazwy pliku
                let fileContent = "";
                let codeLayer = file.querySelector('.ace_layer.ace_text-layer');

                if (codeLayer) {
                    // Iteruj po wierszach kodu
                    let codeLines = codeLayer.querySelectorAll('.ace_line');
                    for (let line of codeLines) {
                        fileContent += line.textContent + '\n'; // Dodaj koniec linii
                    }
                }
                fileData.push({ name: fileName, content: fileContent });
            }
            prepareAndShowPrompt(Gtext, fileData);
        }, 250)
    }
}

function timeoutedShit() {
    setTimeout(runDaShit, 1000)
}

function onTaskReady() {
    'use strict';
    let element = document.getElementById("lekcja-t_tresc");
    interval = setInterval(runDaShit, 100);
    let nextButton = document.getElementById("lekcja_next");
    if (nextButton) {
        nextButton.addEventListener('click', timeoutedShit);
    }
}


(function () {
    'use strict';
    waitForKeyElements("#lekcja-t_tresc", onTaskReady, true);
})();
