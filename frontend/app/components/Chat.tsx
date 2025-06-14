'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useWebSocket, ConnectionStatus } from '../hooks/useWebSocket';

// Define the data structures for our chat feature
interface ConversationPartner {
  id: number;
  name: string;
  avatar: string;
  status: 'online' | 'in-game' | 'offline'; // Status for UI rendering
}

interface Message {
  from: number;
  to: number;
  content: string;
  timestamp: string;
}

export default function ChatComponent() {
  const router = useRouter();
  const { user, accessToken, isAuthenticated, isLoading } = useAuth();
  
  // Our custom hook manages the live WebSocket connection and incoming messages
  const { messages: liveMessages, sendMessage, connectionStatus } = useWebSocket(accessToken);
  
  // State for the list of conversation partners
  const [partners, setPartners] = useState<ConversationPartner[]>([]);
  // State for the currently selected chat partner
  const [activePartner, setActivePartner] = useState<ConversationPartner | null>(null);
  // State for the historical messages of the active conversation
  const [messageHistory, setMessageHistory] = useState<Message[]>([]);
  // State for the message being typed in the input box
  const [newMessage, setNewMessage] = useState('');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Effect to protect the route and fetch the initial list of chat partners
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }
    
    const fetchPartners = async () => {
      if (isAuthenticated && accessToken) {
        try {
          const response = await fetch('http://localhost:13333/api/chat/', {
            headers: { 'Authorization': `Bearer ${accessToken}` },
          });
          const data = await response.json();
          if (data.success) {
            const partnersWithStatus = data.result.map((p: any) => ({ ...p, status: 'online' }));
            setPartners(partnersWithStatus);
          }
        } catch (error) {
          console.error("Failed to fetch chat partners:", error);
        }
      }
    };
    
    fetchPartners();
  }, [isLoading, isAuthenticated, accessToken, router]);

  // Effect to fetch the specific chat history whenever the active partner changes
  useEffect(() => {
    const fetchChatHistory = async (partnerId: number) => {
      if (!accessToken) return;
      try {
        const response = await fetch(`http://localhost:13333/api/chat/${partnerId}`, {
          headers: { 'Authorization': `Bearer ${accessToken}` },
        });
        const data = await response.json();
        setMessageHistory(data.success ? data.result : []);
      } catch (error) {
        console.error("Failed to fetch chat history:", error);
        setMessageHistory([]);
      }
    };

    if (activePartner) {
      fetchChatHistory(activePartner.id);
    } else {
      // If no partner is selected, clear the history
      setMessageHistory([]);
    }
  }, [activePartner, accessToken]);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !activePartner || !user) return;
    sendMessage({ to: activePartner.id, content: newMessage });
    setNewMessage('');
  };

  // Combine historical messages with new live messages for a complete view
  const allMessages = [...messageHistory, ...liveMessages];

  // Filter the combined list to only show messages for the active conversation
  const activeChatMessages = allMessages.filter(
    (msg) => (msg.from === activePartner?.id && msg.to === user?.id) || (msg.from === user?.id && msg.to === activePartner?.id)
  );
  
  // Auto-scroll to the latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeChatMessages]);

  if (isLoading) {
    return <div className="page-container"><p className="text-white text-center">Loading Chat...</p></div>;
  }
  
  return (
    <div className="page-container">
      <div className="text-center text-sm text-gray-400 mb-2">
        Connection Status: <span className={connectionStatus === ConnectionStatus.Connected ? 'text-green-400' : 'text-yellow-400'}>{connectionStatus}</span>
      </div>

      <div className="chat-main-container">
        <div className="sidebar-gradient">
          <div className="sidebar solid-effect">
            <div className="sidebar-header"><h2 className="sidebar-title">Conversations</h2></div>
            <div className="conversation-list">
              {partners.map((partner) => (
                <div key={partner.id} onClick={() => setActivePartner(partner)} className={`conversation-item ${activePartner?.id === partner.id ? 'active' : ''}`}>
                  <img src={partner.avatar || '/avatars/default.png'} alt={partner.name} className="avatar" />
                  <div className="conversation-user-info"><p className="conversation-username">{partner.name}</p></div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="chat-area-gradient">
          <div className="chat-area solid-effect">
            {activePartner ? (
              <>
                <div className="chat-header">
                  <div className="flex items-center gap-3">
                    <p className="chat-header-name">{activePartner.name}</p>
                    <div className={`status-indicator status-${activePartner.status}`}></div>
                  </div>
                </div>
                <div className="messages-container">
                  {activeChatMessages.map((msg, index) => (
                    <div key={index} className={`message-wrapper ${msg.from === user?.id ? 'sent' : 'received'}`}>
                      <div className="message-gradient">
                        <div className="message-bubble">
                          <p className="message-content">{msg.content}</p>
                          <p className="message-timestamp">{new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
                <div className="input-area">
                  <div className="input-wrapper">
                    <div className="input-gradient">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                        placeholder={`Message ${activePartner.name}`}
                        className="message-input"
                      />
                    </div>
                    <div className="button-gradient">
                      <button onClick={handleSendMessage} className="btn">
                        Send
                      </button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="empty-chat-state">
                <p className="empty-chat-text">Select a conversation to begin.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
