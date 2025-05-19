// frontend/html/app.js
// Axiom III: FAAFO Engineering - Basic JS for poking the backend

document.addEventListener('DOMContentLoaded', () => {
    // Configuration (these would ideally come from an env or config file in a real app)
    // Assuming backend is accessible on the same host, port from .env
    const backendApiHost = `${window.location.hostname}:${BACKEND_PORT_FROM_ENV || 3000}`; // You'll need to get BACKEND_PORT_FROM_ENV
    const backendApiBaseUrl = `http://${backendApiHost}/api`;
    const webSocketBaseUrl = `ws://${backendApiHost}/api/chat`; // Ensure this matches your backend's WebSocket path

    document.getElementById('backend-url').textContent = backendApiBaseUrl;
    document.getElementById('ws-url').textContent = webSocketBaseUrl;

    const listUsersBtn = document.getElementById('listUsersBtn');
    const userListOutput = document.getElementById('userListOutput');

    const jwtTokenInput = document.getElementById('jwtToken');
    const recipientIdInput = document.getElementById('recipientId');
    const chatMessageInput = document.getElementById('chatMessage');
    const connectWsBtn = document.getElementById('connectWsBtn');
    const sendWsMsgBtn = document.getElementById('sendWsMsgBtn');
    const disconnectWsBtn = document.getElementById('disconnectWsBtn');
    const chatLog = document.getElementById('chatLog');

    let socket = null;

    // --- User Management ---
    if (listUsersBtn) {
        listUsersBtn.addEventListener('click', async () => {
            userListOutput.textContent = 'Loading users...';
            try {
                const response = await fetch(`${backendApiBaseUrl}/users`);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status} - ${await response.text()}`);
                }
                const data = await response.json();
                if (data.success && Array.isArray(data.result)) {
                   userListOutput.textContent = JSON.stringify(data.result, null, 2);
                } else {
                    userListOutput.textContent = `Failed to parse users: ${JSON.stringify(data)}`;
                }
            } catch (error) {
                console.error('Error listing users:', error);
                userListOutput.textContent = `Error: ${error.message}`;
            }
        });
    }

    // --- WebSocket Chat ---
    function logToChat(message, type = 'system') {
        const p = document.createElement('p');
        p.textContent = message;
        p.classList.add(type); // 'sent', 'received', 'system'
        chatLog.appendChild(p);
        chatLog.scrollTop = chatLog.scrollHeight; // Auto-scroll
    }

    if (connectWsBtn) {
        connectWsBtn.addEventListener('click', () => {
            const token = jwtTokenInput.value.trim();
            if (!token) {
                logToChat('JWT Token is required to connect WebSocket.', 'system');
                alert('Please enter your JWT Access Token.');
                return;
            }

            if (socket && socket.readyState === WebSocket.OPEN) {
                logToChat('Already connected.', 'system');
                return;
            }

            // Construct WebSocket URL with token as a query parameter (common practice)
            // IMPORTANT: Your backend WebSocket auth needs to be adapted to read this.
            // The current backend/src/controllers/conrollers.chat.js reads from 'Authorization' header,
            // which isn't directly possible for browser WebSockets without more complex setups.
            // Simplest for now: pass token in query.
            // Alternative: your backend needs to support Sec-WebSocket-Protocol for headers.
            const wsUrlWithAuth = `${webSocketBaseUrl}?token=${encodeURIComponent(token)}`;
            // OR, if your backend expects the token directly in the URL like this (check backend code):
            // const wsUrlWithAuth = `${webSocketBaseUrl}/${token}`; // Less standard

            logToChat(`Attempting to connect to ${wsUrlWithAuth}...`, 'system');
            socket = new WebSocket(wsUrlWithAuth);

            socket.onopen = () => {
                logToChat('WebSocket Connected!', 'system');
                connectWsBtn.disabled = true;
                disconnectWsBtn.disabled = false;
                sendWsMsgBtn.disabled = false;
            };

            socket.onmessage = (event) => {
                logToChat(`Received: ${event.data}`, 'received');
            };

            socket.onerror = (error) => {
                logToChat(`WebSocket Error: ${error.message || 'Unknown error'}`, 'system');
                console.error('WebSocket Error:', error);
            };

            socket.onclose = (event) => {
                logToChat(`WebSocket Disconnected. Code: ${event.code}, Reason: "${event.reason || 'No reason given'}"`, 'system');
                connectWsBtn.disabled = false;
                disconnectWsBtn.disabled = true;
                sendWsMsgBtn.disabled = true;
                socket = null;
            };
        });
    }

    if (sendWsMsgBtn) {
        sendWsMsgBtn.addEventListener('click', () => {
            if (!socket || socket.readyState !== WebSocket.OPEN) {
                logToChat('Not connected to WebSocket.', 'system');
                return;
            }
            const recipient = recipientIdInput.value.trim();
            const content = chatMessageInput.value.trim();

            if (!recipient || !content) {
                alert('Recipient ID and Message cannot be empty.');
                return;
            }

            const message = {
                to: parseInt(recipient), // Ensure it's a number if backend expects int
                content: content
            };
            const jsonMessage = JSON.stringify(message);
            socket.send(jsonMessage);
            logToChat(`Sent: ${jsonMessage}`, 'sent');
            chatMessageInput.value = ''; // Clear message input
        });
    }
     chatMessageInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter' && !sendWsMsgBtn.disabled) {
            sendWsMsgBtn.click();
        }
    });

    if (disconnectWsBtn) {
        disconnectWsBtn.addEventListener('click', () => {
            if (socket) {
                socket.close(1000, "User initiated disconnect"); // 1000 is normal closure
            }
        });
    }
});

// This is a placeholder. In a real app, this would be dynamically set
// or come from the environment during build. For Docker, we can inject it.
// We'll need to configure Nginx to make this available, or hardcode for now.
// Simplest for now: Assume backend is on port 3000 on the same host as frontend.
const BACKEND_PORT_FROM_ENV = globalThis.FRONTEND_BACKEND_PORT || 3000;
