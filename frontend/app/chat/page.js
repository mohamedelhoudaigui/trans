// app/chat/page.js
"use client";

import { useState, useEffect, useRef } from 'react';

export default function Chat() {
  // State for users, conversations, and current conversation
  const [currentUser, setCurrentUser] = useState({
    id: 'me',
    username: 'Makram Boukaiz',
    avatar: '/avatars/makram.jpg',
    status: 'online'
  });
  
  const [users, setUsers] = useState([
    { id: '1', username: 'mel-houd', avatar: '/avatars/mel-houd.jpg', status: 'online', blocked: false },
    { id: '2', username: 'mlamkadm', avatar: '/avatars/mlamkadm.jpg', status: 'in-game', blocked: false },
  ]);
  
  const [conversations, setConversations] = useState([
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
  
  const [currentConversation, setCurrentConversation] = useState(null);
  const messagesEndRef = useRef(null);
  const [newMessage, setNewMessage] = useState('');
  
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
  
  // Function to send a message
  const sendMessage = () => {
    if (!newMessage.trim() || !currentConversation) return;
    
    const message = {
      id: Date.now().toString(),
      senderId: 'me',
      content: newMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    
    const updatedConversations = conversations.map(conv => {
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
  
  // Function to block a user
  const blockUser = (userId) => {
    setUsers(users.map(user => 
      user.id === userId ? { ...user, blocked: true } : user
    ));
  };
  
  // Function to invite a user to play
  const inviteToPlay = (userId) => {
    // This would normally send a game invitation
    alert(`Invitation sent to play Pong with user ${userId}!`);
  };
  
  // Function to view user profile
  const viewProfile = (userId) => {
    // This would normally navigate to the user's profile
    alert(`Viewing profile of user ${userId}`);
  };

  // Status indicator colors
  const getStatusColor = (status) => {
    switch(status) {
      case 'online': return '#4ade80'; // A greenish color
      case 'in-game': return '#facc15'; // A yellowish color
      case 'offline': return '#6b7280'; // A grayish color
      default: return '#6b7280';
    }
  };

  // Get user initials for avatar
  const getUserInitials = (username) => {
    if (!username) return '';
    const names = username.split(' ');
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  };

  // CSS for custom styling
  const styles = {
    container: {
      height: '100vh',
      width: '100vw',
      backgroundColor: '#161618',
      display: 'flex',
      flexDirection: 'column',
      padding: '20px',
      gap: '20px',
      overflow: 'hidden',
      position: 'relative',
    },
    contentContainer: {
      position: 'relative',
      zIndex: 1,
      display: 'flex',
      flexDirection: 'column',
      gap: '20px',
      height: '100%',
      width: '100%',
    },
    glassEffect: {
      backgroundColor: 'rgba(22, 22, 24, 0.8)',
      backdropFilter: 'blur(12px)',
      // boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
    },
    navbarGradient: {
      backgroundImage: 'linear-gradient(135deg, #6b6b6e,rgba(41, 40, 43, 0.2))',
      borderRadius: '12px',
      padding: '1px',
      width: '100%',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
    },
    navbar: {
      width: '100%',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderRadius: '11px',
      padding: '12px 20px',
    },
    logo: {
      color: '#fcfcfd',
      fontWeight: '600',
      fontSize: '1.25rem',
    },
    navLinks: {
      display: 'flex',
      gap: '20px',
    },
    navLink: {
      color: '#fcfcfd',
      opacity: 0.7,
      cursor: 'pointer',
      transition: 'opacity 0.2s',
    },
    navLinkActive: {
      color: '#fcfcfd',
      opacity: 1,
      fontWeight: '500',
    },
    chatContainer: {
      display: 'flex',
      gap: '20px',
      flex: 1,
      width: '100%',
      overflow: 'hidden',
    },
    sidebarGradient: {
      backgroundImage: 'linear-gradient(135deg, #6b6b6e,rgba(41, 40, 43, 0.2))',
      borderRadius: '12px',
      padding: '1px',
      width: '280px',
      // boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
    },
    sidebar: {
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      borderRadius: '11px',
      overflow: 'hidden',
    },
    sidebarHeader: {
      padding: '25px',
      borderBottom: '1px solid rgba(41, 40, 43, 0.5)',
      backgroundColor: 'rgba(41, 40, 43, 0.8)',
    },
    conversationList: {
      overflowY: 'auto',
      flex: 1,
    },
    conversationItem: {
      padding: '12px 16px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      margin: '4px 8px',
      borderRadius: '8px',
      transition: 'background-color 0.2s'
    },
    chatAreaGradient: {
      backgroundImage: 'linear-gradient(135deg, #6b6b6e,rgba(41, 40, 43, 0.2))',
      borderRadius: '12px',
      padding: '1px',
      flex: 1,
      // boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
    },
    chatArea: {
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      borderRadius: '11px',
      overflow: 'hidden',
    },
    chatHeader: {
      padding: '16px',
      borderBottom: '1px solid rgba(41, 40, 43, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: 'rgba(41, 40, 43, 0.8)',
    },
    messagesContainer: {
      flex: 1, 
      padding: '16px', 
      overflowY: 'auto',
      display: 'flex',
      flexDirection: 'column',
    },
    inputArea: {
      padding: '16px',
      borderTop: '1px solid rgba(41, 40, 43, 0.86)',
      backgroundColor: 'rgba(41, 40, 43, 0.2)',
    },
    buttonGradient: {
      backgroundImage: 'linear-gradient(135deg,rgb(79, 79, 82), #29282b)',
      borderRadius: '6px',
      padding: '1px',
      // boxShadow: '0 4px 12px rgba(0, 0, 0, 0.12)',
    },
    button: {
      backgroundColor: '#3b3b3d',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      color: '#fcfcfd',
      padding: '7px 11px',
      borderRadius: '5px',
      fontSize: '0.875rem',
      fontWeight: '500',
      cursor: 'pointer',
      border: 'none',
      transition: 'background-color 0.2s',
      width: '100%',
      height: '100%',
    },
    blockButton: {
      backgroundColor: '#161618',
      color: '#fcfcfd',
      padding: '8px 12px',
      borderRadius: '5px',
      fontSize: '0.875rem',
      fontWeight: '500',
      cursor: 'pointer',
      border: 'none',
      transition: 'background-color 0.2s',
      width: '100%',
      height: '100%',
    },
    messageGradient: {
      backgroundImage: 'linear-gradient(135deg, #6b6b6e, #29282b)',
      borderRadius: '12px',
      padding: '1px',
      maxWidth: '70%',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    },
    messageBubble: {
      padding: '12px 16px',
      borderRadius: '11px',
      color: '#fcfcfd',
      backgroundColor: 'rgba(22, 22, 24, 0.7)',
      backdropFilter: 'blur(8px)',
    },
    avatar: {
      width: '40px', 
      height: '40px', 
      borderRadius: '50%',
      objectFit: 'cover',
      boxShadow: '0 2px 6px rgba(0, 0, 0, 0.15)',
    },
    statusIndicator: {
      position: 'absolute',
      bottom: '0',
      right: '0',
      width: '12px',
      height: '12px',
      borderRadius: '50%',
      border: '2px solid #212123',
    },
    inputGradient: {
      backgroundImage: 'linear-gradient(135deg, #6b6b6e, #29282b)',
      borderRadius: '8px',
      padding: '1px',
      flex: 1,
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.12)',
    },
    input: {
      width: '100%',
      backgroundColor: 'rgba(22, 22, 24, 0.7)',
      color: '#fcfcfd',
      border: 'none',
      padding: '10px 16px',
      borderRadius: '7px',
      outline: 'none',
      backdropFilter: 'blur(8px)',
    },
    userAvatar: {
      width: '32px',
      height: '32px',
      borderRadius: '50%',
      backgroundColor: '#3b3b3d',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#fcfcfd',
      fontWeight: '500',
      cursor: 'pointer',
      boxShadow: '0 2px 6px rgba(0, 0, 0, 0.15)',
    }
  };

  // Get status text - display inline with username
  const getStatusText = (status) => {
    switch(status) {
      case 'online': return 'Online';
      case 'in-game': return 'In Game';
      case 'offline': return 'Offline';
      default: return '';
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.contentContainer}>
        {/* Navbar */}
        <div style={styles.navbarGradient}>
          <div style={{...styles.navbar, ...styles.glassEffect}}>
            <div style={styles.logo}>Pong Transcendence</div>
            <div style={styles.navLinks}>
              <div style={styles.navLink}>Play</div>
              <div style={styles.navLink}>Tournaments</div>
              <div style={styles.navLinkActive}>Chat</div>
              <div style={styles.navLink}>Profile</div>
            </div>
            <div style={styles.userAvatar}>{getUserInitials(currentUser.username)}</div>
          </div>
        </div>

        <div style={styles.chatContainer}>
          {/* Conversations Sidebar */}
          <div style={styles.sidebarGradient}>
            <div style={{...styles.sidebar, ...styles.glassEffect}}>
              <div style={styles.sidebarHeader}>
                <h2 style={{ color: '#fcfcfd', fontWeight: '500', margin: 0 }}>Conversations</h2>
              </div>
              <div style={styles.conversationList}>
                {conversations.map((conversation) => (
                  <div 
                    key={conversation.id}
                    onClick={() => setCurrentConversation(conversation)}
                    style={{ 
                      ...styles.conversationItem,
                      backgroundColor: currentConversation?.id === conversation.id ? 'rgba(41, 40, 43, 0.6)' : 'transparent',
                    }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = currentConversation?.id === conversation.id ? 'rgba(18, 17, 19, 0.86)' : 'rgba(16, 16, 17, 0.83)'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = currentConversation?.id === conversation.id ? 'rgba(21, 21, 22, 0.94)' : 'transparent'}
                  >
                    <div style={{ position: 'relative' }}>
                      <img 
                        src={conversation.user.avatar || '/avatars/default.png'} 
                        alt={conversation.user.username}
                        style={styles.avatar}
                        onError={(e) => {
                          const target = e.target;
                          target.src = '/avatars/default.png';
                        }}
                      />
                      <span 
                        style={{ 
                          ...styles.statusIndicator,
                          backgroundColor: getStatusColor(conversation.user.status)
                        }}
                      ></span>
                    </div>
                    <div style={{ marginLeft: '12px', overflow: 'hidden' }}>
                      <p style={{ color: '#fcfcfd', fontWeight: '500', marginBottom: '2px', margin: 0 }}>{conversation.user.username}</p>
                      <p style={{ 
                        color: '#fcfcfd', 
                        opacity: '0.7', 
                        fontSize: '0.875rem',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        maxWidth: '180px',
                        margin: '4px 0 0 0'
                      }}>
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
          <div style={styles.chatAreaGradient}>
            <div style={{...styles.chatArea, ...styles.glassEffect}}>
              {currentConversation ? (
                <>
                  {/* Chat Header */}
                  <div style={styles.chatHeader}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <img 
                        src={currentConversation.user.avatar || '/avatars/default.png'} 
                        alt={currentConversation.user.username}
                        style={styles.avatar}
                        onError={(e) => {
                          const target = e.target;
                          target.src = '/avatars/default.png';
                        }}
                      />
                      <div style={{ marginLeft: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <p style={{ color: '#fcfcfd', fontWeight: '500', margin: 0 }}>{currentConversation.user.username}</p>
                          <p style={{ color: '#fcfcfd', opacity: '0.7', fontSize: '0.875rem', margin: '0 0 0 8px' }}>
                            {getStatusText(currentConversation.user.status)}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <div style={styles.buttonGradient}>
                        <button 
                          onClick={() => inviteToPlay(currentConversation.user.id)}
                          style={styles.button}
                          onMouseOver={(e) => e.target.style.backgroundColor = '#4a4a4c'}
                          onMouseOut={(e) => e.target.style.backgroundColor = '#3b3b3d'}
                        >
                          Invite to Game
                        </button>
                      </div>
                      <div style={styles.buttonGradient}>
                        <button 
                          onClick={() => viewProfile(currentConversation.user.id)}
                          style={styles.button}
                          onMouseOver={(e) => e.target.style.backgroundColor = '#4a4a4c'}
                          onMouseOut={(e) => e.target.style.backgroundColor = '#3b3b3d'}
                        >
                          View Profile
                        </button>
                      </div >
                      <div style={styles.buttonGradient}>
                      <button 
                        onClick={() => blockUser(currentConversation.user.id)}
                        style={styles.blockButton}
                        onMouseOver={(e) => e.target.style.backgroundColor = '#4a4a4c'}
                          onMouseOut={(e) => e.target.style.backgroundColor = '#161618'}
                      >
                        Block
                      </button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Messages */}
                  <div style={styles.messagesContainer}>
                    {currentConversation.messages.map((message) => (
                      <div 
                        key={message.id} 
                        style={{
                          display: 'flex',
                          justifyContent: message.senderId === 'me' ? 'flex-end' : 'flex-start',
                          marginBottom: '16px'
                        }}
                      >
                        <div style={styles.messageGradient}>
                          <div style={styles.messageBubble}>
                            <p style={{ margin: 0 }}>{message.content}</p>
                            <p style={{ 
                              fontSize: '0.75rem',
                              opacity: '0.7',
                              color: '#fcfcfd',
                              textAlign: 'right',
                              margin: '4px 0 0 0'
                            }}>
                              {message.timestamp}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                  
                  {/* Message Input */}
                  <div style={styles.inputArea}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <div style={styles.inputGradient}>
                        <input
                          type="text"
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                          placeholder="Type a message..."
                          style={styles.input}
                        />
                      </div>
                      <div style={styles.buttonGradient}>
                        <button
                          onClick={sendMessage}
                          style={styles.button}
                          onMouseOver={(e) => e.target.style.backgroundColor = '#4a4a4c'}
                          onMouseOut={(e) => e.target.style.backgroundColor = '#3b3b3d'}
                        >
                          Send
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div style={{ 
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <p style={{ color: '#fcfcfd', opacity: 0.7 }}>Select a conversation to start chatting</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
