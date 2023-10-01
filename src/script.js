const textArea = document.querySelector('.chat-input textarea');
const submitButton = document.querySelector('.chat-input button');
const chatArea = document.querySelector('.chat-area');
const prompts = document.querySelector('.prompts')
const cannedPrompt = document.querySelectorAll('.canned-prompt');

const mode = new URLSearchParams(window.location.search).get('mode');

function getUrl(path, params) {
    params = params || {}
    if (mode !== null) {
        params['mode'] = mode
    }
    return `https://api.theisensanders.com/${path}` + '?' + Object.entries(params)
        .map(([key, value]) => encodeURIComponent(key) + '=' + encodeURIComponent(value))
        .join('&');
}

async function sendMessage() {
    if (submitButton.disabled) {
        return;
    }
    submitButton.disabled = true;

    const textContent = textArea.value.trim();
    textArea.value = '';
    chatArea.scrollTop = chatArea.scrollHeight;

    insertMessage('message message-right', textContent);

    const el = insertMessage('message', []);
    try {
        const eventSource = new EventSource(getUrl('chat/message', {message: textContent}));
        if (mode !== null) {
            eventSource.url += `&mode=${mode}`
        }

        eventSource.onopen = () => {
            console.debug('Connection opened');
        };

        eventSource.onmessage = (event) => {
            const data = JSON.parse(event.data);
            el.textContent += data;
        };

        eventSource.onerror = (error) => {
            eventSource.close();
            submitButton.disabled = false;
            console.log(error);

            // If it's a MessageEvent then it's a server error, otherwise it's likely just a closed connection
            if (error instanceof MessageEvent) {
                eventSource.close();
                console.error('Event stream error:', error);
                el.className += ' message-error';
                el.textContent += 'ERROR: ' + error.data;
                return;
            }

            console.debug('Connection was closed');
        };

    } catch (error) {
        console.error('Network error:', error);
        el.className += ' message-error';
        el.textContent += 'ERROR: ' + error;
    }
}


function insertMessage(messageClass, text) {
    const message = document.createElement('div');
    message.className = messageClass;
    const messageContent = document.createElement('div');
    messageContent.className = 'message-content';
    message.appendChild(messageContent);
    chatArea.prepend(message);

    import('./textToHTML.js').then(({ default: textToHTML }) => {
        textToHTML(text).then((html) => {
            messageContent.innerHTML = html;
        });
    });

    return messageContent;
}

async function loadHistory() {

    try {
        const response = await fetch(getUrl('chat/history'), {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
        });
        if (!response.ok) {
            const text = await response.text()
            insertMessage('message message-error', 'Error: ' + text)
            return;
        }

        const responseData = await response.json();

        responseData.forEach(({ role, content }) => {
            let className = 'message';
            if (role === 'user') {
                className += ' message-right';
            }
            insertMessage(className, content);
        });
    } catch (e) {
        console.log(e);
        insertMessage('message message-error', 'Unable to load chat history. Please try again later.')
    }
}

async function loadPrompts() {
    try {
        const response = await fetch(getUrl('chat/prompts'), {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
        });
        const responseData = await response.json();

        responseData.forEach(({ title, prompt }) => {
            const button = document.createElement('button');
            button.className = 'canned-prompt';
            button.setAttribute('data-prompt', prompt);
            button.append(title);
            button.addEventListener('click', (e) => {
                e.preventDefault();
                textArea.value = e.target.attributes['data-prompt'].value;
                if (!e.target.attributes['data-submit'] || e.target.attributes['data-submit'].value !== 'false') {
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
submitButton.addEventListener('click', (e) => {
    e.preventDefault();
    sendMessage();
});

textArea.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});

cannedPrompt.forEach((button) => {
    button.addEventListener('click', (e) => {
        e.preventDefault();
        textArea.value = e.target.attributes['data-prompt'].value;
        if (!e.target.attributes['data-submit'] || e.target.attributes['data-submit'].value !== 'false') {
            sendMessage();
        }
    });
});

loadHistory();
loadPrompts();

document.getElementById('current-year').textContent = new Date().getFullYear();
