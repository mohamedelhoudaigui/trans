"use client";

import { useState, useEffect, useRef } from 'react';

interface ChatProps {
  navigateTo: (page: string) => void;
}

// Define all the types properly
interface User {
  id: string;
  username: string;
  avatar: string;
  status: 'online' | 'in-game' | 'offline';
  blocked: boolean;
}

interface Message {
  id: string;
  senderId: string;
  content: string;
  timestamp: string;
}

interface Conversation {
  id: string;
  user: User;
  messages: Message[];
}

export default function Chat({ navigateTo }: ChatProps) {
  // State for users, conversations, and current conversation - ALL PROPERLY TYPED
  const [users, setUsers] = useState<User[]>([
    { id: '1', username: 'mel-houd', avatar: '/avatars/mel-houd.jpg', status: 'online', blocked: false },
    { id: '2', username: 'mlamkadm', avatar: '/avatars/mlamkadm.jpg', status: 'in-game', blocked: false },
  ]);
  
  const [conversations, setConversations] = useState<Conversation[]>([
    {
      id: '1',
      user: { id: '1', username: 'mel-houd', avatar: '/avatars/mel-houd.jpg', status: 'online', blocked: false },
      messages: [
        { id: '1', senderId: '1', content: 'Hey there!', timestamp: '10:00 AM' },
        { id: '2', senderId: 'me', content: 'Hi mel-houd! How are you?', timestamp: '10:01 AM' },
        { id: '3', senderId: '1', content: 'Want to play Pong?', timestamp: '10:02 AM' },
      ]
    },
    {
      id: '2',
      user: { id: '2', username: 'mlamkadm', avatar: '/avatars/mlamkadm.jpg', status: 'in-game', blocked: false },
      messages: [
        { id: '1', senderId: '2', content: 'I challenge you to a Pong match!', timestamp: '9:30 AM' },
      ]
    }
  ]);
  
  // ✅ FIXED: Properly typed as Conversation OR null
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  
  // ✅ FIXED: Properly typed refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [newMessage, setNewMessage] = useState<string>('');
  
  // Set current conversation after initial render to avoid hydration mismatch
  useEffect(() => {
    if (conversations.length > 0) {
      setCurrentConversation(conversations[0]);
    }
  }, []);
  
  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentConversation]);
  
  // ✅ FIXED: Function to send a message - now properly typed
  const sendMessage = (): void => {
    if (!newMessage.trim() || !currentConversation) return;
    
    const message: Message = {
      id: Date.now().toString(),
      senderId: 'me',
      content: newMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    
    const updatedConversations = conversations.map((conv: Conversation) => {
      if (conv.id === currentConversation.id) {
        return {
          ...conv,
          messages: [...conv.messages, message],
        };
      }
      return conv;
    });
    
    setConversations(updatedConversations);
    setCurrentConversation({
      ...currentConversation,
      messages: [...currentConversation.messages, message],
    });
    setNewMessage('');
  };
  
  // ✅ FIXED: Function to block a user - properly typed parameters
  const blockUser = (userId: string): void => {
    setUsers(users.map((user: User) => 
      user.id === userId ? { ...user, blocked: true } : user
    ));
  };
  
  // ✅ FIXED: Function to invite a user to play - properly typed parameters
  const inviteToPlay = (userId: string): void => {
    // This would normally send a game invitation
    alert(`Invitation sent to play Pong with user ${userId}!`);
  };
  
  // ✅ FIXED: Function to view user profile - properly typed parameters
  const viewProfile = (userId: string): void => {
    // Navigate to profile page in SPA
    navigateTo('profile');
  };

  // ✅ FIXED: Status indicator colors - properly typed parameters
  const getStatusClass = (status: 'online' | 'in-game' | 'offline'): string => {
    switch(status) {
      case 'online': return 'status-online';
      case 'in-game': return 'status-in-game';
      case 'offline': return 'status-offline';
      default: return 'status-offline';
    }
  };

  // ✅ FIXED: Get status text - properly typed parameters
  const getStatusText = (status: 'online' | 'in-game' | 'offline'): string => {
    switch(status) {
      case 'online': return 'Online';
      case 'in-game': return 'In Game';
      case 'offline': return 'Offline';
      default: return '';
    }
  };

  return (
    <div className="page-container">
      <div className="chat-main-container">
        {/* Conversations Sidebar */}
        <div className="sidebar-gradient">
          <div className="sidebar solid-effect">
            <div className="sidebar-header">
              <h2 className="sidebar-title">Conversations</h2>
            </div>
            <div className="conversation-list">
              {conversations.map((conversation: Conversation) => (
                <div 
                  key={conversation.id}
                  onClick={() => setCurrentConversation(conversation)}
                  className={`conversation-item ${currentConversation?.id === conversation.id ? 'active' : ''}`}
                >
                  <div className="avatar-container">
                    <img 
                      src={conversation.user.avatar || '/avatars/default.png'} 
                      alt={conversation.user.username}
                      className="avatar"
                      onError={(e) => {
                        // ✅ FIXED: Proper type assertion for event target
                        const target = e.target as HTMLImageElement;
                        target.src = '/avatars/default.png';
                      }}
                    />
                    <span className={`status-indicator ${getStatusClass(conversation.user.status)}`}></span>
                  </div>
                  <div className="conversation-user-info">
                    <p className="conversation-username">{conversation.user.username}</p>
                    <p className="conversation-last-message">
                      {conversation.messages.length > 0 
                        ? conversation.messages[conversation.messages.length - 1].content 
                        : 'No messages yet'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Chat Area */}
        <div className="chat-area-gradient">
          <div className="chat-area solid-effect">
            {currentConversation ? (
              <>
                {/* Chat Header */}
                <div className="chat-header">
                  <div className="chat-header-user">
                    <img 
                      src={currentConversation.user.avatar || '/avatars/default.png'} 
                      alt={currentConversation.user.username}
                      className="avatar"
                      onError={(e) => {
                        // ✅ FIXED: Proper type assertion for event target
                        const target = e.target as HTMLImageElement;
                        target.src = '/avatars/default.png';
                      }}
                    />
                    <div className="chat-header-info">
                      <div className="chat-header-name-status">
                        <p className="chat-header-name">{currentConversation.user.username}</p>
                        <p className="chat-header-status">
                          {getStatusText(currentConversation.user.status)}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="chat-header-actions">
                    <div className="button-gradient">
                      <button 
                        onClick={() => inviteToPlay(currentConversation.user.id)}
                        className="btn"
                      >
                        Invite to Game
                      </button>
                    </div>
                    <div className="button-gradient">
                      <button 
                        onClick={() => viewProfile(currentConversation.user.id)}
                        className="btn"
                      >
                        View Profile
                      </button>
                    </div>
                    <div className="button-gradient">
                      <button 
                        onClick={() => blockUser(currentConversation.user.id)}
                        className="btn-block"
                      >
                        Block
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Messages */}
                <div className="messages-container">
                  {currentConversation.messages.map((message: Message) => (
                    <div 
                      key={message.id} 
                      className={`message-wrapper ${message.senderId === 'me' ? 'sent' : 'received'}`}
                    >
                      <div className="message-gradient">
                        <div className="message-bubble">
                          <p className="message-content">{message.content}</p>
                          <p className="message-timestamp">
                            {message.timestamp}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
                
                {/* Message Input */}
                <div className="input-area">
                  <div className="input-wrapper">
                    <div className="input-gradient">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                        placeholder="Type a message..."
                        className="message-input"
                      />
                    </div>
                    <div className="button-gradient">
                      <button
                        onClick={sendMessage}
                        className="btn"
                      >
                        Send
                      </button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="empty-chat-state">
                <p className="empty-chat-text">Select a conversation to start chatting</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}