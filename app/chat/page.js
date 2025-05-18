'use client';
import { useState, useEffect, useRef } from 'react';

// Simple icon components
const Send = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m22 2-7 20-4-9-9-4Z"></path>
    <path d="M22 2 11 13"></path>
  </svg>
);

const UserPlus = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
    <circle cx="9" cy="7" r="4"></circle>
    <line x1="19" x2="19" y1="8" y2="14"></line>
    <line x1="22" x2="16" y1="11" y2="11"></line>
  </svg>
);

const MoreVertical = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="1"></circle>
    <circle cx="12" cy="5" r="1"></circle>
    <circle cx="12" cy="19" r="1"></circle>
  </svg>
);

const ChevronLeft = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m15 18-6-6 6-6"></path>
  </svg>
);

const UserRound = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="5"></circle>
    <path d="M20 21a8 8 0 1 0-16 0"></path>
  </svg>
);

const Users = ({ size = 24 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
    <circle cx="9" cy="7" r="4"></circle>
    <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
  </svg>
);

const GameController = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="6" y1="12" x2="10" y2="12"></line>
    <line x1="8" y1="10" x2="8" y2="14"></line>
    <circle cx="15" cy="13" r="1"></circle>
    <circle cx="18" cy="11" r="1"></circle>
    <rect x="2" y="6" width="20" height="12" rx="2"></rect>
  </svg>
);

export default function ChatPage() {
  const [conversations, setConversations] = useState([
    { id: 1, name: 'John Doe', lastMessage: 'Ready for a game?', unread: 2, online: true },
    { id: 2, name: 'Alice Smith', lastMessage: 'Good game yesterday!', unread: 0, online: true },
    { id: 3, name: 'Pong Group', lastMessage: 'Tournament starts in 10 minutes', unread: 5, online: true, isGroup: true },
    { id: 4, name: 'Bob Johnson', lastMessage: 'I\'ll practice more next time', unread: 0, online: false },
    { id: 5, name: 'Emma Wilson', lastMessage: 'Thanks for the tips', unread: 0, online: false },
  ]);
  
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [showMobile, setShowMobile] = useState(false);
  
  const messageEndRef = useRef(null);
  
  useEffect(() => {
    if (selectedConversation) {
      const dummyMessages = [
        { id: 1, sender: 'other', text: 'Hey there!', time: '10:30 AM' },
        { id: 2, sender: 'me', text: 'Hi! How are you?', time: '10:31 AM' },
        { id: 3, sender: 'other', text: 'I\'m good. Want to play a game of Pong?', time: '10:32 AM' },
        { id: 4, sender: 'me', text: 'Sure! I\'ve been practicing.', time: '10:33 AM' },
        { id: 5, sender: 'other', text: 'Great! Let me send you an invite.', time: '10:34 AM' },
        { id: 6, sender: 'other', text: 'Game invite sent!', time: '10:35 AM', isGameInvite: true },
      ];
      setMessages(dummyMessages);
    }
  }, [selectedConversation]);
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const scrollToBottom = () => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    
    const newMessage = {
      id: messages.length + 1,
      sender: 'me',
      text: message,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setMessages([...messages, newMessage]);
    setMessage('');
  };
  
  const selectConversation = (conversation) => {
    setSelectedConversation(conversation);
    setShowMobile(true);
    
    const updatedConversations = conversations.map(conv => 
      conv.id === conversation.id ? { ...conv, unread: 0 } : conv
    );
    setConversations(updatedConversations);
  };
  
  return (
    <div className="flex h-screen bg-gray-900 text-gray-200 p-4">
      {/* Conversations List */}
      <div className={`${showMobile ? 'hidden md:flex' : 'flex'} flex-col w-full md:w-80 bg-gray-800 rounded-2xl shadow-xl border border-gray-700 overflow-hidden mr-4`}>
        <div className="p-4 border-b border-gray-700 flex justify-between items-center bg-gray-800 rounded-t-2xl">
          <h2 className="text-xl font-semibold text-gray-300">Messages</h2>
          <button className="p-2 rounded-xl hover:bg-gray-700 transition-colors duration-200">
            <UserPlus className="text-gray-400 hover:text-blue-400" />
          </button>
        </div>
        
        <div className="overflow-y-auto flex-1">
          {conversations.map((conversation) => (
            <div 
              key={conversation.id} 
              className={`p-4 border-b border-gray-700 flex items-center hover:bg-gray-700 cursor-pointer transition-colors duration-200 ${
                selectedConversation?.id === conversation.id ? 'bg-gray-700 border-l-4 border-l-blue-500' : ''
              }`}
              onClick={() => selectConversation(conversation)}
            >
              <div className="relative">
                {conversation.isGroup ? (
                  <div className="w-12 h-12 bg-gray-700 rounded-xl flex items-center justify-center bg-gradient-to-br from-gray-600 to-gray-800">
                    <Users className="text-gray-300" />
                  </div>
                ) : (
                  <div className="w-12 h-12 bg-gray-700 rounded-xl flex items-center justify-center bg-gradient-to-br from-gray-600 to-gray-800">
                    <UserRound className="text-gray-300" />
                  </div>
                )}
                {conversation.online && (
                  <div className="w-3 h-3 bg-green-500 rounded-full absolute bottom-0 right-0 border-2 border-gray-800"></div>
                )}
              </div>
              <div className="ml-4 flex-1">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium text-gray-200">{conversation.name}</h3>
                  {conversation.unread > 0 && (
                    <span className="bg-blue-600 text-xs px-2 py-1 rounded-full text-white">{conversation.unread}</span>
                  )}
                </div>
                <p className="text-sm truncate text-gray-400">{conversation.lastMessage}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Chat Messages */}
      {selectedConversation ? (
        <div className={`${showMobile ? 'flex' : 'hidden md:flex'} flex-col flex-1 bg-gray-800 rounded-2xl shadow-xl border border-gray-700 overflow-hidden`}>
          {/* Chat Header */}
          <div className="p-4 border-b border-gray-700 flex justify-between items-center bg-gray-800 rounded-t-2xl">
            <div className="flex items-center">
              <button className="md:hidden p-2 rounded-xl hover:bg-gray-700 mr-2 transition-colors duration-200" onClick={() => setShowMobile(false)}>
                <ChevronLeft className="text-gray-400" />
              </button>
              <div className="relative">
                {selectedConversation.isGroup ? (
                  <div className="w-10 h-10 bg-gray-700 rounded-xl flex items-center justify-center bg-gradient-to-br from-gray-600 to-gray-800">
                    <Users size={20} className="text-gray-300" />
                  </div>
                ) : (
                  <div className="w-10 h-10 bg-gray-700 rounded-xl flex items-center justify-center bg-gradient-to-br from-gray-600 to-gray-800">
                    <UserRound size={20} className="text-gray-300" />
                  </div>
                )}
                {selectedConversation.online && (
                  <div className="w-2.5 h-2.5 bg-green-500 rounded-full absolute bottom-0 right-0 border-2 border-gray-800"></div>
                )}
              </div>
              <div className="ml-3">
                <h3 className="font-medium text-gray-200">{selectedConversation.name}</h3>
                <p className="text-xs text-gray-500">
                  {selectedConversation.online ? 'Online' : 'Offline'}
                </p>
              </div>
            </div>
            <div className="flex">
              <button className="p-2 rounded-xl hover:bg-gray-700 transition-colors duration-200">
                <GameController className="text-gray-400 hover:text-blue-400" />
              </button>
              <button className="p-2 rounded-xl hover:bg-gray-700 ml-2 transition-colors duration-200">
                <MoreVertical className="text-gray-400" />
              </button>
            </div>
          </div>
          
          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto bg-gray-900 flex flex-col space-y-4">
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.isGameInvite ? (
                  <div className="bg-gray-800 p-4 rounded-xl max-w-xs md:max-w-md shadow-lg border border-gray-700 bg-gradient-to-b from-gray-800 to-gray-850">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-300">Game Invite</span>
                      <span className="text-xs text-gray-500">{msg.time}</span>
                    </div>
                    <p className="mb-3 text-gray-400">Join me for a game of Pong!</p>
                    <div className="flex justify-end space-x-2">
                      <button className="px-3 py-1 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors duration-200">
                        Decline
                      </button>
                      <button className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors duration-200">
                        Accept
                      </button>
                    </div>
                  </div>
                ) : (
                  <div 
                    className={`p-3 rounded-xl shadow-md ${
                      msg.sender === 'me' 
                        ? 'bg-gray-700 text-gray-200 rounded-br-none border border-gray-600 bg-gradient-to-b from-gray-700 to-gray-750' 
                        : 'bg-gray-800 text-gray-200 rounded-bl-none border border-gray-700 bg-gradient-to-b from-gray-800 to-gray-850'
                    } max-w-xs md:max-w-md`}
                  >
                    <p>{msg.text}</p>
                    <div className={`text-xs mt-1 ${msg.sender === 'me' ? 'text-gray-400' : 'text-gray-500'} text-right`}>
                      {msg.time}
                    </div>
                  </div>
                )}
              </div>
            ))}
            <div ref={messageEndRef} />
          </div>
          
          {/* Message Input */}
          <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-700 bg-gray-800 rounded-b-2xl">
            <div className="flex items-center">
              <input
                type="text"
                placeholder="Type a message..."
                className="flex-1 bg-gray-700 border border-gray-600 rounded-l-xl px-4 py-3 focus:outline-none focus:border-blue-500 text-gray-200 placeholder-gray-500"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
              <button 
                type="submit" 
                className="bg-gray-600 hover:bg-blue-600 rounded-r-xl px-4 py-3 border border-gray-600 hover:border-blue-500 transition-colors duration-200"
              >
                <Send className="text-gray-300 hover:text-white" />
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="hidden md:flex flex-1 items-center justify-center bg-gray-800 rounded-2xl shadow-xl border border-gray-700">
          <div className="text-center p-8 bg-gray-700 rounded-xl shadow-lg border border-gray-600 bg-gradient-to-b from-gray-700 to-gray-750">
            <Users size={64} className="mx-auto text-gray-400 mb-4" />
            <h2 className="text-xl text-gray-300 mb-2">Select a conversation</h2>
            <p className="text-gray-400">Choose a chat to start messaging</p>
          </div>
        </div>
      )}
    </div>
  );
}