import { useState, useEffect, useRef } from 'react';

// --- TIP: Use Enums for clear, defined states ---
// This prevents typos and makes the connection status explicit.
export enum ConnectionStatus {
  Connecting = 'Connecting',
  Connected = 'Connected',
  Disconnected = 'Disconnected',
  Error = 'Error',
}

interface Message {
  from: number;
  content: string;
  timestamp: string;
}

// The custom hook logic
export const useWebSocket = (accessToken: string | null) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>(ConnectionStatus.Disconnected);
  
  // --- PRO TIP: Managing WebSocket Instances ---
  // We use `useRef` to hold the WebSocket instance. Unlike `useState`, updating a ref
  // does NOT cause the component to re-render. This is crucial for managing external,
  // stateful objects like a WebSocket connection without causing infinite loops.
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    // Don't try to connect if we don't have a token.
    if (!accessToken) {
      return;
    }

    // Connect to the WebSocket endpoint. Note the `ws://` protocol.
    const socket = new WebSocket(`ws://localhost:13333/api/chat/socket?token=${accessToken}`);
    socketRef.current = socket;
    setConnectionStatus(ConnectionStatus.Connecting);

    socket.onopen = () => {
      console.log('WebSocket connection established.');
      setConnectionStatus(ConnectionStatus.Connected);
    };

    socket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        // Add the newly received message to our state
        setMessages((prevMessages) => [...prevMessages, message]);
      } catch (error) {
        console.error('Failed to parse incoming message:', error);
      }
    };

    socket.onerror = (error) => {
      console.error('WebSocket error:', error);
      setConnectionStatus(ConnectionStatus.Error);
    };

    socket.onclose = () => {
      console.log('WebSocket connection closed.');
      setConnectionStatus(ConnectionStatus.Disconnected);
    };

    // --- TIP: Cleanup Logic ---
    // This function is returned from useEffect and runs when the component unmounts
    // or when the dependency (accessToken) changes. It's essential for preventing
    // memory leaks and old, lingering connections.
    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, [accessToken]); // The hook re-runs its logic ONLY if the accessToken changes.

  const sendMessage = (message: { to: number; content: string }) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(message));
    } else {
      console.error('Cannot send message: WebSocket is not connected.');
    }
  };

  // The hook exposes a clean API to the components that use it.
  return { messages, sendMessage, connectionStatus };
};
