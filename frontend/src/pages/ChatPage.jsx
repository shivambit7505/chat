import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useChatStore } from '../store/useChatStore';
import { useNavigate } from 'react-router-dom';
import { Search, MoreVertical, LogOut, Phone, Video, Send } from 'lucide-react';
import axios from 'axios';
import io from 'socket.io-client';

// In production, frontend is served by the same server, so use relative URL.
// In development, the Vite dev server proxies API calls but socket.io needs the direct backend URL.
const ENDPOINT = import.meta.env.PROD ? "" : "http://localhost:5000";
var socket, selectedChatCompare;

const ChatPage = () => {
  const { user, logout } = useAuthStore();
  const { chats, selectedChat, fetchChats, setSelectedChat, accessChat, messages, fetchMessages, sendMessage, addMessage } = useChatStore();
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [socketConnected, setSocketConnected] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }
    
    fetchChats(user.token);
    
    socket = io(ENDPOINT);
    socket.emit("setup", user);
    socket.on("connected", () => setSocketConnected(true));
    
    const messageHandler = (newMessageReceived) => {
      if (!selectedChatCompare || selectedChatCompare._id !== newMessageReceived.chat._id) {
        // notification logic
      } else {
        addMessage(newMessageReceived);
      }
    };
    
    socket.on("message received", messageHandler);

    return () => {
      socket.off("message received", messageHandler);
      socket.disconnect();
    };
  }, [user, navigate]);

  useEffect(() => {
    if (selectedChat) {
      fetchMessages(selectedChat._id, user.token);
      selectedChatCompare = selectedChat;
      socket.emit("join chat", selectedChat._id);
    }
  }, [selectedChat]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleSearch = async () => {
    if (!search) return;
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get(`/api/user?search=${search}`, config);
      setSearchResults(data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleAccessChat = (userId) => {
    accessChat(userId, user.token);
    setSearchResults([]);
    setSearch('');
  };

  const handleSendMessage = async () => {
    if (newMessage.trim() && selectedChat) {
      const data = await sendMessage(newMessage, selectedChat._id, user.token);
      socket.emit("new message", data);
      setNewMessage('');
    }
  };

  const getChatName = (loggedUser, users) => {
    return users[0]._id === loggedUser._id ? users[1].name : users[0].name;
  };
  
  const getChatPic = (loggedUser, users) => {
    return users[0]._id === loggedUser._id ? users[1].pic : users[0].pic;
  };

  return (
    <div className="chat-layout">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <img src={user?.pic} alt="avatar" className="avatar" style={{ width: '36px', height: '36px' }} />
            <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{user?.name}</h3>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="btn btn-secondary" style={{ padding: '0.5rem' }} onClick={handleLogout}><LogOut size={20} /></button>
          </div>
        </div>
        
        <div style={{ padding: '1rem', borderBottom: '1px solid var(--border-light)' }}>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input 
              type="text" 
              className="input-field" 
              placeholder="Search users..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button className="btn btn-primary" style={{ padding: '0.5rem' }} onClick={handleSearch}><Search size={20} /></button>
          </div>
        </div>

        <div className="chat-list">
          {searchResults.length > 0 ? (
            searchResults.map(result => (
              <div key={result._id} className="chat-item" onClick={() => handleAccessChat(result._id)}>
                <img src={result.pic} alt="avatar" className="avatar" />
                <div className="chat-info">
                  <h4 className="chat-name">{result.name}</h4>
                  <p className="chat-preview">{result.email}</p>
                </div>
              </div>
            ))
          ) : (
            chats.map(chat => (
              <div 
                key={chat._id} 
                className={`chat-item ${selectedChat?._id === chat._id ? 'active' : ''}`}
                onClick={() => setSelectedChat(chat)}
              >
                <img src={!chat.isGroupChat ? getChatPic(user, chat.users) : "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg"} alt="avatar" className="avatar" />
                <div className="chat-info">
                  <h4 className="chat-name">{!chat.isGroupChat ? getChatName(user, chat.users) : chat.chatName}</h4>
                  {chat.latestMessage && (
                    <p className="chat-preview">
                      {chat.latestMessage.sender.name}: {chat.latestMessage.content}
                    </p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      
      {/* Main Chat Area */}
      <div className="chat-area">
        {selectedChat ? (
          <>
            <div className="chat-header">
              <img src={!selectedChat.isGroupChat ? getChatPic(user, selectedChat.users) : "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg"} alt="avatar" className="avatar" />
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: 0 }}>{!selectedChat.isGroupChat ? getChatName(user, selectedChat.users) : selectedChat.chatName}</h3>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button className="btn btn-secondary" style={{ padding: '0.5rem' }}><Video size={20} /></button>
                <button className="btn btn-secondary" style={{ padding: '0.5rem' }}><Phone size={20} /></button>
                <button className="btn btn-secondary" style={{ padding: '0.5rem' }}><MoreVertical size={20} /></button>
              </div>
            </div>
            
            <div className="messages-container">
              {messages.map((m) => (
                <div key={m._id} className={`message-bubble ${m.sender._id === user._id ? 'sent' : 'received'}`}>
                  {m.content}
                </div>
              ))}
            </div>
            
            <div className="message-input-area">
              <input 
                type="text" 
                className="message-input" 
                placeholder="Type a message..." 
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              />
              <button className="send-btn" onClick={handleSendMessage}>
                <Send size={20} />
              </button>
            </div>
          </>
        ) : (
          <div className="empty-chat">
            <h2>Welcome to ConnectChatPro</h2>
            <p>Select a chat to start messaging or search for new users.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage;
