"use client";

import { useState, useEffect, useRef } from "react";
import { Send, Phone, VideoIcon, MoreHorizontal, User, AlertCircle } from "lucide-react";
import Image from "next/image";

export default function ChatPage() {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [online, setOnline] = useState([]);
  const messagesEndRef = useRef(null);
  const [socket, setSocket] = useState(null);
  
  // Initialize WebSocket connection
  useEffect(() => {
    // Connect to WebSocket server
    const newSocket = new WebSocket(process.env.NEXT_PUBLIC_WS_URL || "wss://your-websocket-server.com");
    
    newSocket.onopen = () => {
      console.log("WebSocket connection established");
    };
    
    newSocket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      if (data.type === "message") {
        setMessages(prevMessages => [...prevMessages, {
          id: Date.now(),
          sender: data.sender,
          content: data.content,
          timestamp: new Date().toISOString(),
          isCurrentUser: data.sender === "currentUser" // Change based on your auth logic
        }]);
      } else if (data.type === "user_status") {
        // Update online users
        setOnline(data.online);
      }
    };
    
    newSocket.onclose = () => {
      console.log("WebSocket connection closed");
    };
    
    setSocket(newSocket);
    
    // Cleanup WebSocket connection on component unmount
    return () => {
      if (newSocket) {
        newSocket.close();
      }
    };
  }, []);
  
  // Fetch contacts and initial messages
  useEffect(() => {
    // This would normally be an API call
    const mockContacts = [
      { id: 1, name: "Mohamed El Houdaigui", avatar: "/avatars/mel-houd.jpg", lastSeen: "now", unread: 0 },
      { id: 2, name: "Mohamed-Ali Lamkadmi", avatar: "/avatars/mlamkadm.jpg", lastSeen: "2m ago", unread: 3 },
      { id: 3, name: "Makram Boukaiz", avatar: "/avatars/mboukaiz.jpg", lastSeen: "1h ago", unread: 0 },
    ];
    
    setContacts(mockContacts);
    setSelectedContact(mockContacts[0]);

    // Mock online users
    setOnline([1, 3, 4]);
  }, []);
  
  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  
  const sendMessage = (e) => {
    e.preventDefault();
    
    if (!inputMessage.trim()) return;
    
    // Add message to UI immediately for responsiveness
    const newMessage = {
      id: Date.now(),
      sender: "currentUser",
      content: inputMessage,
      timestamp: new Date().toISOString(),
      isCurrentUser: true
    };
    
    setMessages([...messages, newMessage]);
    setInputMessage("");
    
    // Send message via WebSocket
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({
        type: "message",
        recipient: selectedContact.id,
        content: inputMessage
      }));
    }
  };
  
  const selectContact = (contact) => {
    setSelectedContact(contact);
    
    // This would normally fetch conversation history from API
    // For now, we'll just use mock data
    const mockConversation = [
      {
        id: 1,
        sender: contact,
        content: `Hi there! This is ${contact.name}.`,
        timestamp: "2023-05-18T09:30:00",
        isCurrentUser: false
      },
      {
        id: 2,
        sender: "currentUser",
        content: `Hey ${contact.name}! How are you doing?`,
        timestamp: "2023-05-18T09:31:00",
        isCurrentUser: true
      }
    ];
    
    setMessages(mockConversation);
  };
  
  const inviteToGame = () => {
    if (!selectedContact) return;
    
    // Add invitation message to UI
    const inviteMessage = {
      id: Date.now(),
      sender: "currentUser",
      content: "🎮 I'm inviting you to play Pong! Click here to join.",
      timestamp: new Date().toISOString(),
      isCurrentUser: true,
      isGameInvite: true
    };
    
    setMessages([...messages, inviteMessage]);
    
    // Send invitation via WebSocket
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({
        type: "game_invite",
        recipient: selectedContact.id,
        game: "pong"
      }));
    }
  };
  
  const isUserOnline = (userId) => {
    return online.includes(userId);
  };
  
  // Format timestamp into readable time
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      {/* Contacts Sidebar */}
      <div className="w-1/4 border-r border-gray-800 bg-gray-950 flex flex-col">
        <div className="p-4 border-b border-gray-800">
          <h2 className="text-xl font-bold text-white">Messages</h2>
          <div className="mt-2 relative">
            <input
              type="text"
              placeholder="Search contacts..."
              className="w-full bg-gray-800 rounded-lg py-2 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>
        
        <div className="flex-grow overflow-y-auto custom-scrollbar">
          {contacts.map((contact) => (
            <div
              key={contact.id}
              className={`flex items-center p-4 cursor-pointer hover:bg-gray-800 transition-colors ${
                selectedContact?.id === contact.id ? "bg-gray-800" : ""
              }`}
              onClick={() => selectContact(contact)}
            >
              <div className="relative">
                <div className="w-12 h-12 rounded-full bg-gray-700 overflow-hidden flex items-center justify-center">
                  {contact.avatar ? (
                    <Image
                      src={contact.avatar}
                      alt={contact.name}
                      width={48}
                      height={48}
                      className="object-cover"
                      onError={(e) => {
                        e.target.style.display = "none";
                        e.target.nextSibling.style.display = "flex";
                      }}
                    />
                  ) : (
                    <User size={24} className="text-gray-400" />
                  )}
                </div>
                {isUserOnline(contact.id) && (
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-950"></div>
                )}
              </div>
              <div className="ml-3 flex-grow">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold">{contact.name}</h3>
                  <span className="text-xs text-gray-400">{contact.lastSeen}</span>
                </div>
                <p className="text-sm text-gray-400 truncate">Tap to view messages</p>
              </div>
              {contact.unread > 0 && (
                <div className="bg-purple-600 rounded-full w-5 h-5 flex items-center justify-center">
                  <span className="text-xs">{contact.unread}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      
      {/* Chat Content */}
      <div className="flex-grow flex flex-col">
        {selectedContact ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-gray-900">
              <div className="flex items-center">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-gray-700 overflow-hidden flex items-center justify-center">
                    {selectedContact.avatar ? (
                      <Image
                        src={selectedContact.avatar}
                        alt={selectedContact.name}
                        width={40}
                        height={40}
                        className="object-cover"
                        onError={(e) => {
                          e.target.style.display = "none";
                          e.target.parentNode.innerHTML = `<div class="flex items-center justify-center w-full h-full"><User size={20} /></div>`;
                        }}
                      />
                    ) : (
                      <User size={20} className="text-gray-400" />
                    )}
                  </div>
                  {isUserOnline(selectedContact.id) && (
                    <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-gray-900"></div>
                  )}
                </div>
                <div className="ml-3">
                  <h3 className="font-semibold">{selectedContact.name}</h3>
                  <p className="text-xs text-gray-400">
                    {isUserOnline(selectedContact.id) ? "Online" : selectedContact.lastSeen}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                
                
                
                <button className="p-2 rounded-full hover:bg-gray-800 transition-colors">
                  <MoreHorizontal size={18} className="text-gray-400" />
                </button>
              </div>
            </div>
            
            {/* Messages */}
            <div className="flex-grow overflow-y-auto p-4 space-y-4 bg-gradient-to-br from-gray-900 to-gray-950 custom-scrollbar">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.isCurrentUser ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[70%] rounded-2xl p-3 ${
                      message.isCurrentUser
                        ? "bg-gradient-to-r from-purple-600 to-blue-500 text-white"
                        : "bg-gray-800 text-white"
                    } ${message.isGameInvite ? "cursor-pointer hover:opacity-90" : ""}`}
                  >
                    {message.isGameInvite ? (
                      <div className="flex items-center">
                        <span>{message.content}</span>
                      </div>
                    ) : (
                      <p>{message.content}</p>
                    )}
                    <div className={`text-xs mt-1 ${message.isCurrentUser ? "text-blue-200" : "text-gray-400"}`}>
                      {formatTime(message.timestamp)}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            
            {/* Message Input */}
            <form onSubmit={sendMessage} className="p-4 border-t border-gray-800 bg-gray-900">
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-grow bg-gray-800 rounded-full py-3 px-4 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <button
                  type="submit"
                  className="bg-gradient-to-r from-purple-600 to-blue-500 p-3 rounded-full hover:opacity-90 transition-opacity flex items-center justify-center"
                  disabled={!inputMessage.trim()}
                >
                  <Send size={18} />
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-grow flex flex-col items-center justify-center p-6 bg-gradient-to-br from-gray-900 to-gray-950">
            <AlertCircle size={48} className="text-purple-500 mb-4" />
            <h3 className="text-xl font-semibold mb-2">No conversation selected</h3>
            <p className="text-gray-400 text-center max-w-md">
              Choose a contact from the sidebar to start chatting or invite them to a game of Pong!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

/* Add these styles to your global CSS or component-specific CSS */
/* 
.custom-scrollbar {
  scrollbar-width: thin;
  scrollbar-color: rgba(107, 70, 193, 0.5) transparent;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: rgba(107, 70, 193, 0.5);
  border-radius: 20px;
}
*/
