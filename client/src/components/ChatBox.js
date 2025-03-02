import React, { useState, useRef, useEffect } from 'react';
import { FaComment, FaTimes, FaPaperPlane } from 'react-icons/fa';
import '../styles/ChatBox.css';
import axios from 'axios';

const ChatBox = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, text: "Hello! How can I help you with MediSave today?", isUser: false },
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

  // Auto-scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (newMessage.trim() === '' || isLoading) return;

    // Add user message
    const userMessage = {
      id: messages.length + 1,
      text: newMessage,
      isUser: true
    };
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setNewMessage('');
    setIsLoading(true);

    try {
      // Format chat history for the API
      const chatHistory = messages.map(msg => ({
        role: msg.isUser ? "user" : "assistant",
        content: msg.text
      }));
      
      // Call the API
      const response = await axios.post(`${API_URL}/api/chat`, {
        message: newMessage,
        chatHistory: chatHistory
      });

      if (response.data.success) {
        // Add bot response
        const botMessage = {
          id: messages.length + 2,
          text: response.data.response,
          isUser: false
        };
        setMessages(prevMessages => [...prevMessages, botMessage]);
      } else {
        // Handle error
        const errorMessage = {
          id: messages.length + 2,
          text: "Sorry, I'm having trouble responding right now. Please try again later.",
          isUser: false
        };
        setMessages(prevMessages => [...prevMessages, errorMessage]);
      }
    } catch (error) {
      console.error('Chat API error:', error);
      
      // Add error message
      const errorMessage = {
        id: messages.length + 2,
        text: "Sorry, I'm having trouble connecting to the server. Please try again later.",
        isUser: false
      };
      setMessages(prevMessages => [...prevMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="chat-container">
      {!isOpen ? (
        <button 
          className="chat-toggle-button" 
          onClick={toggleChat}
          aria-label="Open chat"
        >
          <FaComment /> Chat Assistant
        </button>
      ) : (
        <div className="chat-box">
          <div className="chat-header">
            <h3>MediSave Assistant</h3>
            <button 
              className="close-chat-button" 
              onClick={toggleChat}
              aria-label="Close chat"
            >
              <FaTimes />
            </button>
          </div>
          
          <div className="chat-messages">
            {messages.map((message) => (
              <div 
                key={message.id} 
                className={`message ${message.isUser ? 'user-message' : 'bot-message'}`}
              >
                {message.text}
              </div>
            ))}
            {isLoading && (
              <div className="message bot-message loading-message">
                <span className="loading-dot"></span>
                <span className="loading-dot"></span>
                <span className="loading-dot"></span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          
          <form className="chat-input-form" onSubmit={handleSendMessage}>
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type message..."
              className="chat-input"
              disabled={isLoading}
            />
            <button 
              type="submit" 
              className="send-button"
              disabled={newMessage.trim() === '' || isLoading}
              aria-label="Send message"
            >
              <FaPaperPlane />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default ChatBox; 