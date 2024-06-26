document.addEventListener('DOMContentLoaded', () => {
    const chatBox = document.getElementById('chat-box');
    const messageInput = document.getElementById('message-input');
    const sendButton = document.getElementById('send-button');

    const webSocketURL = prompt('Por favor, introduce la URL del WebSocket:');
    if (!webSocketURL) {
        alert('La URL del WebSocket es obligatoria para participar en el chat.');
        return;
    }

    const socket = new WebSocket(webSocketURL);

    socket.addEventListener('open', () => {
        console.log('WebSocket connection opened');
    });

    socket.addEventListener('message', (event) => {
        const message = JSON.parse(event.data);
        if (message.type === 'history') {
            message.data.forEach(msg => {
                const messageElement = document.createElement('div');
                messageElement.textContent = `${msg.ip || msg.user}: ${msg.text}`;
                chatBox.appendChild(messageElement);
            });
        } else {
            const messageElement = document.createElement('div');
            messageElement.textContent = `${message.ip || message.user}: ${message.text}`;
            chatBox.appendChild(messageElement);
        }
    });

    sendButton.addEventListener('click', () => {
        if (socket.readyState === WebSocket.OPEN) {
            const message = messageInput.value;
            if (message.trim() !== '') {
                socket.send(JSON.stringify({ text: message }));
                messageInput.value = '';
            }
        } else {
            console.log('WebSocket connection is not open');
        }
    });

    setInterval(() => {
        if (socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({ type: 'heartbeat' }));
        }
    }, 100);
});

