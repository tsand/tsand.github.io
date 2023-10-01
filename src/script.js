const textArea = document.querySelector(".chat-input textarea");
const submitButton = document.querySelector(".chat-input button");
const chatArea = document.querySelector(".chat-area");
const prompts = document.querySelector(".prompts");
const cannedPrompt = document.querySelectorAll(".canned-prompt");

const mode = new URLSearchParams(window.location.search).get("mode");

function getUrl(path, params) {
    params = params || {};
    if (mode !== null) {
        params["mode"] = mode;
    }
    return (
        `https://api.theisensanders.com/${path}` +
        "?" +
        Object.entries(params)
            .map(([key, value]) => encodeURIComponent(key) + "=" + encodeURIComponent(value))
            .join("&")
    );
}

async function sendMessage() {
    if (submitButton.disabled) {
        return;
    }
    submitButton.disabled = true;

    const textContent = textArea.value.trim();
    textArea.value = "";
    chatArea.scrollTop = chatArea.scrollHeight;

    insertMessage("message message-right", textContent);

    var buffer = "";
    const el = insertMessage("message", []);
    try {
        await sendMessageViaPOST(textContent, (data) => {
            buffer += data;
            import("./textToHTML.js").then(({ default: textToHTML }) => {
                textToHTML(buffer).then((html) => {
                    el.innerHTML = html;
                });
            });
        });
    } catch (error) {
        console.error("Network error:", error);
        el.className += " message-error";
        el.textContent += "ERROR: " + error;
    } finally {
        submitButton.disabled = false;
    }
}

async function sendMessageViaEventSource(message, callback) {
    return new Promise((resolve, reject) => {
        const eventSource = new EventSource(getUrl("chat/message", { message: message }));
        eventSource.onopen = () => {
            console.debug("Connection opened");
        };

        eventSource.onmessage = (event) => {
            console.log(event);
            const data = JSON.parse(event.data);
            callback(data);
        };

        eventSource.onerror = (error) => {
            eventSource.close();

            // If it's a MessageEvent then it's a server error, otherwise it's likely just a closed connection
            if (error instanceof MessageEvent) {
                eventSource.close();
                console.error("Event stream error:", error);
                reject(new Error(error.data));
                return;
            }

            console.debug("Connection was closed");
            resolve();
        };
    });
}

async function sendMessageViaPOST(message, callback) {
    try {
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
                    console.error("Event stream error:", eventData);
                    throw new Error(eventData);
                }

                callback(eventData);
            }
        }
    } catch (error) {
        console.error("Error:", error);
        throw error;
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

function insertMessage(messageClass, text) {
    const message = document.createElement("div");
    message.className = messageClass;
    const messageContent = document.createElement("div");
    messageContent.className = "message-content";
    message.appendChild(messageContent);
    chatArea.prepend(message);

    import("./textToHTML.js").then(({ default: textToHTML }) => {
        textToHTML(text).then((html) => {
            messageContent.innerHTML = html;
        });
    });

    return messageContent;
}

async function loadHistory() {
    try {
        const response = await fetch(getUrl("chat/history"), {
            method: "GET",
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
            if (role === "user") {
                className += " message-right";
            }
            insertMessage(className, content);
        });
    } catch (e) {
        console.log(e);
        insertMessage(
            "message message-error",
            "Unable to load chat history. Please try again later."
        );
    }
}

async function loadPrompts() {
    try {
        const response = await fetch(getUrl("chat/prompts"), {
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
            button.addEventListener("click", (e) => {
                e.preventDefault();
                textArea.value = e.target.attributes["data-prompt"].value;
                if (
                    !e.target.attributes["data-submit"] ||
                    e.target.attributes["data-submit"].value !== "false"
                ) {
                    sendMessage();
                }
            });
            prompts.appendChild(button);
        });
    } catch (e) {
        console.log(e);
    }
}

// Cleaned up event listeners with arrow functions
submitButton.addEventListener("click", (e) => {
    e.preventDefault();
    sendMessage();
});

textArea.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});

cannedPrompt.forEach((button) => {
    button.addEventListener("click", (e) => {
        e.preventDefault();
        textArea.value = e.target.attributes["data-prompt"].value;
        if (
            !e.target.attributes["data-submit"] ||
            e.target.attributes["data-submit"].value !== "false"
        ) {
            sendMessage();
        }
    });
});

loadHistory();
loadPrompts();

document.getElementById("current-year").textContent = new Date().getFullYear();
