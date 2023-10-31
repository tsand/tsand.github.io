const textArea = document.querySelector(".chat-input textarea");
const submitButton = document.querySelector(".chat-input button");
const modesDiv = document.querySelector("#modes");
const darkToggle = document.querySelector("#theme-toggle");
const resetButton = document.querySelector("#reset");
const chatArea = document.querySelector(".chat-area");
const prompts = document.querySelector(".prompts");
const cannedPrompts = document.querySelectorAll(".canned-prompt");
const mode = new URLSearchParams(window.location.search).get("mode");

function getUrl(path, params = {}) {
    if (mode !== null) {
        params.mode = mode;
    }
    let baseUrl = `https://api.theisensanders.com/${path}`;
    if (!Object.keys(params).length) {
        return baseUrl;
    }
    return baseUrl + "?" + new URLSearchParams(params).toString();
}

async function sendMessage() {
    if (submitButton.disabled) return;
    submitButton.disabled = true;

    const textContent = textArea.value.trim();
    textArea.value = "";
    chatArea.scrollTop = chatArea.scrollHeight;
    insertMessage("message message-right", textContent);

    let buffer = "";
    const el = insertMessage("message", []);
    try {
        await sendMessageViaPOST(textContent, (data) => {
            buffer += data;
            convertTextToHTML(buffer).then((html) => (el.innerHTML = html));
        });
    } catch (error) {
        console.error(error);
        el.className += " message-error";
        el.textContent = error;
    } finally {
        submitButton.disabled = false;
    }
}

async function sendMessageViaPOST(message, callback) {
    const response = await fetch(getUrl("chat/message"), {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Accept: "text/event-stream",
        },
        credentials: "include",
        body: JSON.stringify({ message }),
    });

    if (!response.ok) {
        throw new Error(`Fetch error: ${response.statusText}`);
    }

    const reader = response.body.pipeThrough(new TextDecoderStream()).getReader();

    while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const events = value.split("\n\n");
        for (const event of events) {
            if (!event.trim()) {
                continue;
            }
            const eventType = parseEventType(event);
            const eventData = parseEventData(event);

            if (eventType === "error") {
                throw new Error(eventData);
            }

            // Allow DOM updates to occur before processing the next event
            await new Promise((resolve) => {
                requestAnimationFrame(async () => {
                    callback(eventData);
                    resolve();
                });
            });
        }
    }
}

function parseEventType(eventString) {
    const eventTypeMatch = eventString.match(/event:\s?(.+?)(\n|$)/);
    return eventTypeMatch && eventTypeMatch[1] ? eventTypeMatch[1] : "message";
}

function parseEventData(eventString) {
    const eventMatch = eventString.match(/data:\s?(".*")(?:\n|$)/);
    return eventMatch && eventMatch[1] ? JSON.parse(eventMatch[1]) : null;
}

function insertMessage(messageClass, text, useHtml = false) {
    const message = document.createElement("div");
    message.className = messageClass;
    const messageContent = document.createElement("div");
    messageContent.className = "message-content";
    message.appendChild(messageContent);
    chatArea.prepend(message);
    if (useHtml) {
        convertTextToHTML(text).then((html) => (messageContent.innerHTML = html));
    } else {
        messageContent.textContent = text;
    }
    return messageContent;
}

async function loadHistory(clear = false) {
    try {
        const response = await fetch(getUrl("chat/history"), {
            method: clear ? "DELETE" : "GET",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
        });
        if (!response.ok) {
            const text = await response.text();
            insertMessage("message message-error", "Error: " + text);
            return;
        }

        const responseData = await response.json();

        responseData.forEach(({ role, content }) => {
            let className = "message";
            let useHtml = true;
            if (role === "user") {
                className += " message-right";
                useHtml = false;
            }
            insertMessage(className, content, (useHtml = useHtml));
        });
    } catch (e) {
        console.log(e);
        insertMessage(
            "message message-error",
            "Unable to load chat history. Please try again later."
        );
    }
}

async function deleteHistory() {
    chatArea.innerHTML = "";
    loadHistory(true);
}

async function loadPrompts() {
    try {
        const limit = isWidthLessThan48rem() ? 2 : 3;
        const response = await fetch(getUrl("chat/prompts", { limit: limit }), {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
        });
        const responseData = await response.json();

        responseData.forEach(({ title, prompt }) => {
            const button = document.createElement("button");
            button.className = "canned-prompt";
            button.setAttribute("data-prompt", prompt);
            button.append(title);
            button.addEventListener("click", handleCannedPromptClick);
            prompts.appendChild(button);
        });
    } catch (e) {
        console.log(e);
    }
}

async function loadModes() {
    try {
        const response = await fetch(getUrl("chat/modes"), {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
        });
        const responseData = await response.json();

        if (responseData.length < 2) {
            return;
        }

        const select = document.createElement("select");
        responseData.forEach((m) => {
            const option = document.createElement("option");
            option.setAttribute("value", m.name);
            if (m.selected === true) {
                option.setAttribute("selected", "selected");
            }
            option.append(m.name + " (" + m.model + ")");
            select.appendChild(option);
        });
        select.addEventListener("change", (e) => {
            window.location.href = `?mode=${e.target.value}`;
        });
        modesDiv.appendChild(select);
    } catch (e) {
        console.log(e);
    }
}

let textToHTML;

async function convertTextToHTML(text) {
    if (!textToHTML) {
        if (!containsBasicMarkdown(text)) {
            return "<p>" + text + "</p>";
        }
        const { default: f } = await import("./textToHTML.js");
        textToHTML = f;
    }
    const out = await textToHTML(text);
    return out;
    // return out.replace(/<code(?!\/>)/g, '<button><object data="/static/copy.svg" type="image/svg+xml"></object></button><code');
}

function handleCannedPromptClick(e) {
    e.preventDefault();
    textArea.value = e.target.attributes["data-prompt"].value;
    if (
        !e.target.attributes["data-submit"] ||
        e.target.attributes["data-submit"].value !== "false"
    ) {
        sendMessage();
    } else {
        textArea.focus();
    }
}

function containsBasicMarkdown(str) {
    const markdownPattern = /\n|#+\s.*|\*{1,2}[^*]+\*{1,2}|_{1,2}[^_]+_{1,2}/;
    return markdownPattern.test(str);
}

submitButton.addEventListener("click", (e) => {
    e.preventDefault();
    sendMessage();
});

resetButton.addEventListener("click", (e) => {
    e.preventDefault();
    deleteHistory();
});

textArea.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});

cannedPrompts.forEach((button) => {
    button.addEventListener("click", handleCannedPromptClick);
});

darkToggle.checked = theme === "dark";
darkToggle.addEventListener("click", (e) => {
    setTheme(e.target.checked);
});

window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", ({ matches }) => {
    setTheme(matches);
});

function setTheme(dark) {
    let theme = dark ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.theme = theme;
}

function isWidthLessThan48rem() {
    const rootFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize);
    const widthInPixels = 48 * rootFontSize;
    return window.innerWidth < widthInPixels;
}

loadModes();
loadHistory();
loadPrompts();
document.getElementById("current-year").textContent = new Date().getFullYear();
