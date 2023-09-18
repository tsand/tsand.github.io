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
        const { signal } = new AbortController();
        const response = await fetch('https://api.theisensanders.com/chat/message', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: textContent }),
            credentials: 'include',
            signal
        });

        const reader = response.body.getReader();
        const decoder = new TextDecoder('utf-8');

        while (true) {
            const { done, value } = await reader.read();
            if (done) {
                submitButton.disabled = false;
                break;
            }

            let chunk = decoder.decode(value, { stream: true });
            el.textContent = el.textContent + chunk;
        }
    } catch (error) {
        console.error('Error:', error);
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