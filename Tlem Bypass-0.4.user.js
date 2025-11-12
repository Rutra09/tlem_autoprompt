// ==UserScript==
// @name         Tlem Bypass
// @namespace    http://tampermonkey.net/
// @version      0.4
// @description  Bypass for T-lem exercises
// @author       ArturM
// @match        https://edu.t-lem.com/
// @updateURL    https://github.com/Rutra09/tlem_autoprompt/raw/master/Tlem_Bypass.user.js
// @downloadURL  https://github.com/Rutra09/tlem_autoprompt/raw/master/Tlem_Bypass.user.js
// @icon         https://www.google.com/s2/favicons?sz=64&domain=t-lem.com
// @grant        GM_xmlhttpRequest
// @connect      tlem.arturm.pl
// ==/UserScript==

(function() {
    'use strict';

    // Add styles for UI
    const style = document.createElement('style');
    style.textContent = `
        #bypass-container {
            position: fixed;
            bottom: 20px;
            right: 20px;
            background-color: #fff;
            border: 1px solid #ccc;
            padding: 10px;
            border-radius: 5px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            z-index: 10000;
        }
        #bypass-btn {
            background-color: #4CAF50;
            color: white;
            border: none;
            padding: 8px 16px;
            text-align: center;
            text-decoration: none;
            display: inline-block;
            font-size: 14px;
            margin: 4px 2px;
            cursor: pointer;
            border-radius: 4px;
        }
        #status-message {
            margin-top: 5px;
            font-size: 12px;
            color: #555;
        }
    `;
    document.head.appendChild(style);

    // Create UI
    const container = document.createElement('div');
    container.id = 'bypass-container';

    const button = document.createElement('button');
    button.id = 'bypass-btn';
    button.textContent = 'Execute Bypass';

    const statusMsg = document.createElement('div');
    statusMsg.id = 'status-message';
    statusMsg.textContent = 'Ready';

    container.appendChild(button);
    container.appendChild(statusMsg);

    // Function to get lesson ID from URL
    function getLessonId() {
        try {
            // First try to get it from the URL format with :
            let pathParts = window.location.href.split(':');
            if (pathParts.length > 2) {
                return pathParts[2];
            }

            // If that doesn't work, look for it in the page
            // This is a fallback method - might need adjusting based on actual page structure
            const urlParams = new URLSearchParams(window.location.search);
            const lessonId = urlParams.get('id');
            if (lessonId) {
                return lessonId;
            }

            // Another fallback - check if it's in the URL path
            const pathMatch = window.location.pathname.match(/\/lesson\/(\d+)/);
            if (pathMatch && pathMatch[1]) {
                return pathMatch[1];
            }

            // If we can't find it in the expected places, try to look for it in the page content
            // This might be different depending on the page structure
            const scriptTags = document.querySelectorAll('script');
            for (const script of scriptTags) {
                const content = script.textContent;
                const match = content.match(/lessonId['"]\s*:\s*['"](\\d+)['"]/i);
                if (match && match[1]) {
                    return match[1];
                }
            }

            return null;
        } catch (error) {
            console.error('Error getting lesson ID:', error);
            return null;
        }
    }

    // Function to generate random mouse movement events
    function generateRandomMouseEvents(count = 20) {
        const events = [];
        const startTimestamp = Date.now();

        for (let i = 0; i < count; i++) {
            const posX = Math.floor(Math.random() * 1500) + 500;
            const posY = Math.floor(Math.random() * 800) + 400;
            const timestamp = startTimestamp + Math.floor(Math.random() * 10000);

            events.push({
                eventType: "MOUSE",
                payload: {
                    posX: posX,
                    posY: posY,
                    buttonClicked: 0
                },
                timestamp: timestamp
            });
        }

        return events;
    }

    // Function to generate keyboard events based on the solution
    function generateKeyboardEvents(solution) {
        const keyCodes = {
            'a': 65,
            'b': 66,
            'c': 67,
            'd': 68,
            'e': 69,
            'f': 70,
            'g': 71,
            'h': 72,
            'i': 73,
            'j': 74,
            'k': 75,
            'l': 76,
            'm': 77,
            'n': 78,
            'o': 79,
            'p': 80,
            'q': 81,
            'r': 82,
            's': 83,
            't': 84,
            'u': 85,
            'v': 86,
            'w': 87,
            'x': 88,
            'y': 89,
            'z': 90,
            'A': 65,
            'B': 66,
            'C': 67,
            'D': 68,
            'E': 69,
            'F': 70,
            'G': 71,
            'H': 72,
            'I': 73,
            'J': 74,
            'K': 75,
            'L': 76,
            'M': 77,
            'N': 78,
            'O': 79,
            'P': 80,
            'Q': 81,
            'R': 82,
            'S': 83,
            'T': 84,
            'U': 85,
            'V': 86,
            'W': 87,
            'X': 88,
            'Y': 89,
            'Z': 90,
            '0': 48,
            '1': 49,
            '2': 50,
            '3': 51,
            '4': 52,
            '5': 53,
            '6': 54,
            '7': 55,
            '8': 56,
            '9': 57,
            ' ': 32,
            ';': 59,
            ',': 44,
            '.': 46,
            '/': 47,
            '\\': 92,
            '[': 91,
            ']': 93,
            '=': 61,
            '-': 45,
            '`': 96,
            "'": 39,
            '"': 222,
            '(': 57,
            ')': 48,
            '+': 43,
            '*': 42,
            '&': 55,
            '^': 54,
            '%': 53,
            '$': 52,
            '#': 51,
            '@': 50,
            '!': 49,
            '_': 95,
            '{': 123,
            '}': 125,
            '|': 124,
            ':': 58,
            '<': 60,
            '>': 62,
            '?': 63,
            '~': 126
        };

        // Clean the solution by removing unnecessary whitespace/returns
        const cleanSolution = solution.trim();

        // Convert solution to keyboard events
        const events = [];
        const startTimestamp = Date.now();

        // Add shift key press as first event (common when typing SQL)
        events.push({
            eventType: "KEYBOARD",
            payload: {
                key: "Shift",
                keyCode: 16
            },
            timestamp: startTimestamp
        });

        let timeOffset = 500; // Start with a small delay

        // Process each character in the solution
        for (let i = 0; i < cleanSolution.length; i++) {
            const char = cleanSolution.charAt(i);

            // Skip newlines and carriage returns in the keyboard simulation
            if (char === '\n' || char === '\r') {
                continue;
            }

            // Get key code or default to space if not found
            const keyCode = keyCodes[char] !== undefined ? keyCodes[char] : 32;

            // Add slightly random timing between keystrokes (100-300ms)
            timeOffset += Math.floor(Math.random() * 200) + 100;

            events.push({
                eventType: "KEYBOARD",
                payload: {
                    key: char,
                    keyCode: keyCode
                },
                timestamp: startTimestamp + timeOffset
            });
        }

        return events;
    }

    // Function to generate system events
    function generateSystemEvents() {
        const events = [];
        const startTimestamp = Date.now();

        // Add a COMPILE event
        events.push({
            eventType: "SYSTEM",
            payload: {
                buttonType: "COMPILE"
            },
            timestamp: startTimestamp + Math.floor(Math.random() * 10000) + 5000 // 5-15 seconds later
        });

        return events;
    }

    // Function to generate all events
    function generateAllEvents(solution) {
        const mouseEvents = generateRandomMouseEvents();
        const keyboardEvents = generateKeyboardEvents(solution);
        const systemEvents = generateSystemEvents();

        // Combine all events and sort by timestamp
        const allEvents = [...mouseEvents, ...keyboardEvents, ...systemEvents];
        allEvents.sort((a, b) => a.timestamp - b.timestamp);

        return allEvents;
    }

    // Function to generate a random time delay (90+ seconds)
    function generateRandomTime() {
        // Generate a random time between 90 and 300 seconds (1.5 to 5 minutes)
        return Math.floor(Math.random() * 210000) + 90000;
    }

    // Function to extract solution from page's ACE editor
    function extractSolutionFromPage() {
        try {
            // Look for the ACE editor content
            const aceTextLayer = document.querySelector('.ace_text-layer');
            if (!aceTextLayer) {
                return null;
            }

            let solution = '';

            // Get all ace_line elements and extract text content
            const aceLines = aceTextLayer.querySelectorAll('.ace_line');
            for (const line of aceLines) {
                // Extract text content from all spans in the line
                let lineText = '';
                const spans = line.querySelectorAll('span');

                if (spans.length > 0) {
                    // If there are spans, get text from each span
                    for (const span of spans) {
                        lineText += span.textContent;
                    }
                } else {
                    // If no spans, get direct text content
                    lineText = line.textContent;
                }

                // Add the line to solution if it's not empty
                if (lineText.trim()) {
                    solution += lineText.trim() + '\n';
                }
            }

            return solution.trim() || null;
        } catch (error) {
            console.error('Error extracting solution from page:', error);
            return null;
        }
    }

    // Function to fetch solution from the API
    function fetchSolution(lessonId) {
        return new Promise((resolve, reject) => {
            statusMsg.textContent = `Fetching solution for lesson ID ${lessonId}...`;

            GM_xmlhttpRequest({
                method: "GET",
                url: `http://tlem.arturm.pl/quiz/${lessonId}`,
                onload: function(response) {
                    try {
                        console.log('API Response Status:', response.status);
                        console.log('API Response Text:', response.responseText);

                        if (response.status !== 200) {
                            console.log('API failed, trying to extract from page...');
                            const pageSolution = extractSolutionFromPage();
                            if (pageSolution) {
                                console.log('Successfully extracted solution from page:', pageSolution);
                                resolve(pageSolution);
                                return;
                            }
                            reject(`API returned status ${response.status} and no solution found on page. Response: ${response.responseText}`);
                            return;
                        }

                        // Check if response is empty
                        if (!response.responseText || response.responseText.trim() === '') {
                            console.log('Empty API response, trying to extract from page...');
                            const pageSolution = extractSolutionFromPage();
                            if (pageSolution) {
                                console.log('Successfully extracted solution from page:', pageSolution);
                                resolve(pageSolution);
                                return;
                            }
                            reject("Empty response from API and no solution found on page");
                            return;
                        }

                        // Try to parse JSON
                        let data;
                        try {
                            data = JSON.parse(response.responseText);
                        } catch (parseError) {
                            console.error('JSON Parse Error:', parseError);
                            console.error('Response Text:', response.responseText);
                            console.log('JSON parsing failed, trying to extract from page...');
                            const pageSolution = extractSolutionFromPage();
                            if (pageSolution) {
                                console.log('Successfully extracted solution from page:', pageSolution);
                                resolve(pageSolution);
                                return;
                            }
                            reject(`Invalid JSON response from API and no solution found on page. Response was: "${response.responseText.substring(0, 100)}..."`);
                            return;
                        }

                        if (!data) {
                            console.log('No data from API, trying to extract from page...');
                            const pageSolution = extractSolutionFromPage();
                            if (pageSolution) {
                                console.log('Successfully extracted solution from page:', pageSolution);
                                resolve(pageSolution);
                                return;
                            }
                            reject("No data returned from API and no solution found on page");
                            return;
                        }

                        // Extract the solution from the first file
                        const fileKey = Object.keys(data)[0];
                        if (!fileKey) {
                            console.log('No file key in API response, trying to extract from page...');
                            const pageSolution = extractSolutionFromPage();
                            if (pageSolution) {
                                console.log('Successfully extracted solution from page:', pageSolution);
                                resolve(pageSolution);
                                return;
                            }
                            reject("No file key found in API response and no solution found on page");
                            return;
                        }

                        const solution = data[fileKey];
                        if (!solution) {
                            console.log(`No solution for file key ${fileKey}, trying to extract from page...`);
                            const pageSolution = extractSolutionFromPage();
                            if (pageSolution) {
                                console.log('Successfully extracted solution from page:', pageSolution);
                                resolve(pageSolution);
                                return;
                            }
                            reject(`No solution found for file key: ${fileKey} and no solution found on page`);
                            return;
                        }

                        console.log('Successfully fetched solution from API:', solution);
                        resolve(solution);
                    } catch (error) {
                        console.error('Fetch solution error:', error);
                        console.log('Error processing API response, trying to extract from page...');
                        const pageSolution = extractSolutionFromPage();
                        if (pageSolution) {
                            console.log('Successfully extracted solution from page:', pageSolution);
                            resolve(pageSolution);
                            return;
                        }
                        reject(`Error processing API response: ${error.message} and no solution found on page`);
                    }
                },
                onerror: function(error) {
                    console.error('GM_xmlhttpRequest error:', error);
                    console.log('Network error, trying to extract from page...');
                    const pageSolution = extractSolutionFromPage();
                    if (pageSolution) {
                        console.log('Successfully extracted solution from page:', pageSolution);
                        resolve(pageSolution);
                        return;
                    }
                    reject(`Network error fetching from API: ${error} and no solution found on page`);
                }
            });
        });
    }

    // Function to execute the bypass
    async function executeBypass() {
        try {
            statusMsg.textContent = 'Starting bypass...';

            // Get lesson ID
            const lessonId = getLessonId();
            if (!lessonId) {
                statusMsg.textContent = 'Error: Could not determine lesson ID';
                return;
            }

            // Fetch solution from API
            const solution = await fetchSolution(lessonId);
            statusMsg.textContent = `Solution fetched: ${solution.substring(0, 20)}...`;

            // Generate events based on the solution
            const events = generateAllEvents(solution);
            statusMsg.textContent = `Generated ${events.length} events based on solution`;

            // Generate a random time delay (more than 90 seconds)
            const deltaTime = generateRandomTime();
            statusMsg.textContent = `Using time delay of ${Math.round(deltaTime/1000)} seconds`;

            // Determine module type (default to sql, but could be different)
            // We could try to detect this from the page, but for now we'll default to SQL
            const moduleType = "sql";

            // Create the POST data
            const postData = new URLSearchParams();
            postData.append('act[id]', moduleType);
            postData.append('act[module]', moduleType);
            postData.append('act[params][]', moduleType);
            postData.append('act[params][]', lessonId);
            postData.append('act[params][]', solution);

            // Add deltaTime, deltaClick, deltaKeys
            const deltaObj = {
                deltaTime: Math.floor(deltaTime / 1000), // Convert to seconds
                deltaClick: Math.floor(Math.random() * 10) + 1,
                deltaKeys: Math.floor(Math.random() * 30) + 5
            };
            postData.append('act[params][3][deltaTime]', deltaObj.deltaTime);
            postData.append('act[params][3][deltaClick]', deltaObj.deltaClick);
            postData.append('act[params][3][deltaKeys]', deltaObj.deltaKeys);

            // Add all events
            for (let i = 0; i < events.length; i++) {
                const event = events[i];
                postData.append(`act[params][4][${i}][eventType]`, event.eventType);

                if (event.eventType === "KEYBOARD") {
                    postData.append(`act[params][4][${i}][payload][key]`, event.payload.key);
                    postData.append(`act[params][4][${i}][payload][keyCode]`, event.payload.keyCode);
                } else if (event.eventType === "MOUSE") {
                    postData.append(`act[params][4][${i}][payload][posX]`, event.payload.posX);
                    postData.append(`act[params][4][${i}][payload][posY]`, event.payload.posY);
                    postData.append(`act[params][4][${i}][payload][buttonClicked]`, event.payload.buttonClicked);
                } else if (event.eventType === "SYSTEM") {
                    postData.append(`act[params][4][${i}][payload][buttonType]`, event.payload.buttonType);
                }

                postData.append(`act[params][4][${i}][timestamp]`, event.timestamp);
            }

            // Add ping data
            postData.append('act[last_ping_time]', Math.floor(Math.random() * 100) + 10);
            postData.append('act[ping_count]', Math.floor(Math.random() * 5) + 1);

            // Make the POST request to submit the solution
            statusMsg.textContent = 'Submitting solution...';

            // We'll use the browser's fetch API directly as we're on the same domain
            const response = await fetch('https://edu.t-lem.com/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                    'X-Requested-With': 'XMLHttpRequest',
                    'Accept': 'application/json, text/javascript, */*; q=0.01',
                    'OPWEB': 'https://edu.t-lem.com/',
                    'Idempotency-Key': `"${Math.floor(Math.random() * 10000000000000000000)}"`
                },
                body: postData,
                credentials: 'include' // Important to include cookies
            });

            if (!response.ok) {
                throw new Error(`Server responded with status ${response.status}`);
            }

            const responseData = await response.json();
            statusMsg.textContent = 'Solution submitted successfully!';
            console.log('Server response:', responseData);
            let buttonnext = document.querySelector('#lekcja_next');
            if (buttonnext) {
                buttonnext.click();
                statusMsg.textContent = 'Moved to next lesson!';
            } else {
                statusMsg.textContent = 'Next lesson button not found.';
            }

            // You might want to add logic here to check if the submission was successful
            // and maybe automatically move to the next lesson

        } catch (error) {
            console.error('Bypass error:', error);
            statusMsg.textContent = `Error: ${error.message}`;
        }
    }

    // Add event listener to button
    button.addEventListener('click', executeBypass);

    // Add UI to page
    document.body.appendChild(container);

    // Log that the script has been loaded
    console.log('Tlem Bypass script loaded');
})();