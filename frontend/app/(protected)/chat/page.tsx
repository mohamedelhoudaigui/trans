'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import { useWebSocket, ConnectionStatus } from '@/app/hooks/useWebSocket';

interface ConversationPartner {
  id: number; name: string; avatar: string; status: 'online' | 'in-game' | 'offline';
}
interface Message {
  from: number; to: number; content: string; timestamp: string;
}

export default function ChatPage() {
  const { user, accessToken, isLoading: isAuthLoading } = useAuth();
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  const [partners, setPartners] = useState<ConversationPartner[]>([]);
  const [activePartner, setActivePartner] = useState<ConversationPartner | null>(null);
  const [messageHistory, setMessageHistory] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [error, setError] = useState<string | null>(null);

  const { messages: liveMessages, sendMessage, connectionStatus } = useWebSocket(accessToken);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Effect to fetch conversation partners
  useEffect(() => {
    if (isAuthLoading || !accessToken) return;
    const fetchPartners = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/chat/`, { headers: { 'Authorization': `Bearer ${accessToken}` }});
        const data = await response.json();
        if (data.success) {
          const partnersWithStatus = data.result.map((p: any) => ({ ...p, status: 'online' }));
          setPartners(partnersWithStatus);
        } else { throw new Error(data.result || 'Failed to fetch partners.'); }
      } catch (err: any) { console.error("Error fetching chat partners:", err); setError("Could not load conversations."); }
    };
    fetchPartners();
  }, [isAuthLoading, accessToken, API_BASE_URL]);

  // Effect to fetch historical messages for the active partner
  useEffect(() => {
    if (!activePartner || !accessToken) { setMessageHistory([]); return; }
    const fetchChatHistory = async (partnerId: number) => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/chat/${partnerId}`, { headers: { 'Authorization': `Bearer ${accessToken}` }});
        const data = await response.json();
        setMessageHistory(data.success ? data.result : []);
      } catch (error) { console.error("Error fetching chat history:", error); setMessageHistory([]); }
    };
    fetchChatHistory(activePartner.id);
  }, [activePartner, accessToken, API_BASE_URL]);

  // SIMPLIFIED: Send message and do nothing else. The hook will update state.
  const handleSendMessage = () => {
    if (!newMessage.trim() || !activePartner || !user) return;
    sendMessage({ to: activePartner.id, content: newMessage });
    setNewMessage('');
  };

  // --- Rendering Logic ---

  // Merge historical and live messages.
  const allMessages = [...messageHistory, ...liveMessages];

  // Filter for the active conversation.
  const activeChatMessages = allMessages.filter(
    (msg) => 
      (msg.from === user?.id && msg.to === activePartner?.id) ||
      (msg.from === activePartner?.id && msg.to === user?.id)
  );

  // This effect now correctly scrolls on new live messages or history changes.
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeChatMessages.length]); // Trigger on change in number of messages

  if (isAuthLoading) { return <div className="page-container flex items-center justify-center"><p className="text-white">Loading Chat...</p></div>; }
  if (error) { return <div className="page-container flex items-center justify-center"><p className="text-red-500">{error}</p></div>; }
  
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
                    <div key={`${msg.timestamp}-${index}`} className={`message-wrapper ${msg.from === user?.id ? 'sent' : 'received'}`}>
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
                      <button onClick={handleSendMessage} className="btn">Send</button>
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
