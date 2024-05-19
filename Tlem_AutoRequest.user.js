// ==UserScript==
// @name         Tlem AutoRequest
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  try to take over the world!
// @author       ArturM
// @match        https://edu.t-lem.com/
// @updateURL    https://github.com/Rutra09/tlem_autoprompt/raw/master/Tlem_AutoPrompt2.user.js
// @downloadURL  https://github.com/Rutra09/tlem_autoprompt/raw/master/Tlem_AutoPrompt2.user.js
// @icon         https://www.google.com/s2/favicons?sz=64&domain=t-lem.com
// @require  https://gist.github.com/raw/2625891/waitForKeyElements.js
// @grant       GM_xmlhttpRequest
// @grant       GM_cookie
// ==/UserScript==

function getAnswer(id) {
    return new Promise((resolve, reject) => {
        GM_xmlhttpRequest({
            method: "GET",
            url: `http://tlem.arturm.me/getLesson?id=${id}`,
            onload: function (response) {
                resolve(response);
            }
        })
    })
}

function getLessonId() {
    return window.location.href.split(":")[1];
}

function getFileName() {
    let el = document.querySelectorAll("[id^=check_file_][id$=_cpp]")[0];
    return el.id.split("_")[2] + ".cpp";
}

function getFilesNames() {
    let els = document.querySelectorAll("[id^=check_file_][id$=_cpp]");
    let names = [];
    for (let i = 0; i < els.length; i++) {
        names.push(els[i].id.split("_")[2] + ".cpp");
    }
    return names;
}

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function sendFakedAnswer(code) {    
    let act = {
        id: "lekcja",
        module: "lekcja",
        params: ["compile", getLessonId(), [{
            name: getFileName(),
            code: encodeURIComponent(code)
        }]],
        last_ping_time: 0,
        ping_count: randomInt(1, 40),
    }
    for(var i =0; i < code.length; i++){
        act["params"][3]["deltaTime"] += randomInt(1, 10);
        act["params"][3]["deltaClick"] += randomInt(1, 2);
        act["params"][3]["deltaKeys"] += randomInt(1, 2);
        break;
    }
    let data  = new URLSearchParams();
    data.append("act", JSON.stringify(act));
    

    fetch("https://edu.t-lem.com/", {
        "credentials": "include",
        "headers": {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:125.0) Gecko/20100101 Firefox/125.0",
            "Accept": "application/json, text/javascript, */*; q=0.01",
            "Accept-Language": "pl,en-US;q=0.7,en;q=0.3",
            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
            "X-Requested-With": "XMLHttpRequest",
            "Sec-Fetch-Dest": "empty",
            "Sec-Fetch-Mode": "cors",
            "Sec-Fetch-Site": "same-origin"
        },
        "referrer": "https://edu.t-lem.com/",
        "body": data,
        "method": "POST",
        "mode": "cors"
    });
}

function loadGUI() {

}

function lessonDetector() {

}

function init() {
    loadGUI();
}

(function() {
    'use strict';
    init();
})();