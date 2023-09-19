const textArea = document.querySelector('.chat-input textarea');
const submitButton = document.querySelector('.chat-input button');
const chatArea = document.querySelector('.chat-area');
const cannedPrompt = document.querySelectorAll('.canned-prompt');

async function sendMessage() {
    if (submitButton.disabled) {
        return;
    }
    submitButton.disabled = true;

    const textContent = textArea.value.trim();
    textArea.value = '';
    chatArea.scrollTop = chatArea.scrollHeight;

    appendMessage('message message-right', textContent);

    const el = appendMessage('message', []);
    try {
        const eventSource = new EventSource(`https://api.theisensanders.com/chat/message?message=${encodeURIComponent(textContent)}`);

        eventSource.onopen = () => {
            console.debug('Connection opened');
        };

        eventSource.onmessage = (event) => {
            el.textContent += event.data;
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


function appendMessage(messageClass, text) {
    const message = document.createElement('div');
    message.className = messageClass;
    const messageContent = document.createElement('div');
    messageContent.className = 'message-content';
    messageContent.append(text);
    message.appendChild(messageContent);
    chatArea.prepend(message);
    return messageContent;
}

async function loadHistory() {
    try {
        const response = await fetch('https://api.theisensanders.com/chat/history', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
        });
        const responseData = await response.json();

        responseData.forEach(({ role, content }) => {
            let className = 'message';
            if (role === 'user') {
                className += ' message-right';
            }
            appendMessage(className, content);
        });
    } catch (e) {
        console.log(e);
        appendMessage('message message-error', 'Unable to load chat history. Please try again later.')
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