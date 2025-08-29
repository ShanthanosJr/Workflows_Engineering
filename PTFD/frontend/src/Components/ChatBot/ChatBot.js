import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Nav from "../Nav/Nav";

export default function ChatBot() {
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);
  
  // Ensure FontAwesome is loaded with multiple fallback strategies
  useEffect(() => {
    // Strategy 1: Check if FontAwesome is already loaded
    const existingLink = document.querySelector('link[href*="font-awesome"]');
    
    if (!existingLink) {
      // Strategy 2: Add FontAwesome CSS link
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css';
      link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
      
      // Strategy 3: Verify loading and add fallback
      link.onload = () => {
        console.log('✅ FontAwesome loaded successfully');
      };
      
      link.onerror = () => {
        console.warn('⚠️ FontAwesome failed to load, using emoji fallbacks');
        // Force fallback by adding a class to body
        document.body.classList.add('fontawesome-fallback');
      };
    }
    
    // Strategy 4: Test FontAwesome loading after a delay
    setTimeout(() => {
      const testElement = document.createElement('i');
      testElement.className = 'fas fa-heart';
      testElement.style.position = 'absolute';
      testElement.style.left = '-9999px';
      document.body.appendChild(testElement);
      
      const computedStyle = window.getComputedStyle(testElement);
      const fontFamily = computedStyle.fontFamily;
      
      if (!fontFamily.includes('Font Awesome')) {
        console.warn('⚠️ FontAwesome not detected, activating fallbacks');
        document.body.classList.add('fontawesome-fallback');
      } else {
        console.log('✅ FontAwesome verified and working');
      }
      
      document.body.removeChild(testElement);
    }, 1000);
  }, []);
  
  const [conversationId, setConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [knowledgeCategories, setKnowledgeCategories] = useState([]);

  useEffect(() => {
    initializeChat();
    fetchKnowledgeCategories();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const initializeChat = async () => {
    try {
      setIsLoading(true);
      console.log('🤖 Initializing chat conversation...');
      
      const response = await axios.get('http://localhost:5050/chatbot/conversation/new');
      const conversation = response.data.data;
      
      setConversationId(conversation.conversationId);
      setMessages(conversation.messages || []);
      
      // Add welcome message if no existing messages
      if (!conversation.messages || conversation.messages.length === 0) {
        const welcomeMessage = {
          messageId: 'welcome',
          sender: 'bot',
          message: "Hello! I'm your Construction AI Assistant. I can help you with construction, architecture, engineering, and project management questions. How can I assist you today?",
          timestamp: new Date(),
          messageType: 'greeting'
        };
        setMessages([welcomeMessage]);
        setSuggestions([
          'Ask about construction materials',
          'Get project planning advice', 
          'Calculate construction costs',
          'Learn about building codes'
        ]);
      }
      
      console.log('✅ Chat initialized successfully');
    } catch (error) {
      console.error('❌ Error initializing chat:', error);
      alert('Error initializing chat. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchKnowledgeCategories = async () => {
    try {
      const response = await axios.get('http://localhost:5050/chatbot/knowledge/categories');
      setKnowledgeCategories(response.data.data || []);
    } catch (error) {
      console.error('❌ Error fetching knowledge categories:', error);
    }
  };

  const sendMessage = async (messageText = null) => {
    const message = messageText || inputMessage.trim();
    
    if (!message || !conversationId) return;

    try {
      setIsTyping(true);
      setInputMessage("");
      
      // Add user message immediately to UI
      const userMessage = {
        messageId: `user-${Date.now()}`,
        sender: 'user',
        message: message,
        timestamp: new Date(),
        messageType: 'text'
      };
      
      setMessages(prev => [...prev, userMessage]);
      
      console.log('📤 Sending message to ChatBot...');
      
      const response = await axios.post(`http://localhost:5050/chatbot/conversation/${conversationId}/message`, {
        message: message
      });
      
      const { response: botResponse, conversation } = response.data.data;
      
      // Update messages with the full conversation
      setMessages(conversation.messages);
      
      // Update suggestions if provided
      if (botResponse.suggestions) {
        setSuggestions(botResponse.suggestions);
      }
      
      console.log('✅ Received bot response');
      
    } catch (error) {
      console.error('❌ Error sending message:', error);
      
      // Add error message to chat
      const errorMessage = {
        messageId: `error-${Date.now()}`,
        sender: 'bot',
        message: "I apologize, but I'm experiencing some technical difficulties. Please try again in a moment.",
        timestamp: new Date(),
        messageType: 'error'
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    sendMessage(suggestion);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getBotMessageIcon = (messageType) => {
    switch (messageType) {
      case 'knowledge': return '📚';
      case 'calculation': return '🧮';
      case 'guidance': return '💡';
      case 'data': return '📊';
      case 'suggestion': return '💭';
      case 'error': return '⚠️';
      default: return '🤖';
    }
  };

  const getMessageTypeColor = (messageType) => {
    switch (messageType) {
      case 'knowledge': return '#17a2b8';
      case 'calculation': return '#28a745';
      case 'guidance': return '#ffc107';
      case 'data': return '#007bff';
      case 'suggestion': return '#6f42c1';
      case 'error': return '#dc3545';
      default: return '#6c757d';
    }
  };

  if (isLoading) {
    return (
      <>
        <Nav />
        <div className="container mt-5">
          <div className="row justify-content-center">
            <div className="col-md-6 text-center">
              <div className="card shadow-lg border-0">
                <div className="card-body p-5">
                  <div className="spinner-border text-primary mb-3" role="status" style={{width: '3rem', height: '3rem'}}>
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <h4 className="text-muted">Initializing AI Assistant...</h4>
                  <p className="text-secondary">Please wait while we set up your construction chatbot.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Nav />
      
      {/* Modern Header Section */}
      <div className="bg-gradient chatbot-header" style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
        color: 'white',
        padding: '2rem 0',
        marginBottom: '2rem',
        position: 'relative'
      }}>
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-8">
              <h1 className="display-5 fw-bold mb-2">
                <span className="me-3">🤖</span>
                AI Construction Assistant
              </h1>
              <p className="lead mb-0 opacity-90">
                Your intelligent companion for construction, architecture, engineering, and project guidance
              </p>
            </div>
            <div className="col-lg-4 text-end">
              <div className="d-flex align-items-center justify-content-end">
                <div className="me-3">
                  <div className="d-flex align-items-center">
                    <div className="bg-success rounded-circle me-2" style={{width: '12px', height: '12px'}}></div>
                    <small className="opacity-90">AI Online</small>
                  </div>
                </div>
                <button 
                  className="btn btn-light btn-sm shadow-sm"
                  onClick={() => navigate('/financial-dashboard')}
                  style={{borderRadius: '25px', padding: '8px 20px'}}
                >
                  <span className="me-2">💰</span> Financial Dashboard
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container-fluid">
        <div className="row justify-content-center">
          <div className="col-lg-10 col-xl-8">
            {/* Chat Container */}
            <div className="card shadow-lg border-0" style={{
              borderRadius: '25px',
              height: '70vh',
              background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,249,250,0.95) 100%)'
            }}>
              {/* Chat Header */}
              <div className="card-header border-0 d-flex align-items-center justify-content-between" style={{
                background: 'linear-gradient(45deg, #28a745, #20c997)',
                borderRadius: '25px 25px 0 0',
                padding: '1rem 2rem'
              }}>
                <div className="d-flex align-items-center text-white">
                  <div className="bg-white bg-opacity-20 rounded-circle p-2 me-3">
                    <span style={{fontSize: '1.5rem'}}>🤖</span>
                  </div>
                  <div>
                    <h5 className="mb-0 fw-bold">Construction AI Assistant</h5>
                    <small className="opacity-90">Ready to help with your construction queries</small>
                  </div>
                </div>
                <div className="d-flex align-items-center">
                  {knowledgeCategories.length > 0 && (
                    <span className="badge bg-white bg-opacity-20 me-2">
                      {knowledgeCategories.length} Knowledge Areas
                    </span>
                  )}
                  <div className="bg-success rounded-circle" style={{width: '12px', height: '12px'}}></div>
                </div>
              </div>
              
              {/* Messages Area */}
              <div className="card-body p-0" style={{
                height: 'calc(70vh - 200px)',
                overflowY: 'auto',
                backgroundImage: 'linear-gradient(45deg, rgba(0,123,255,0.02) 25%, transparent 25%), linear-gradient(-45deg, rgba(0,123,255,0.02) 25%, transparent 25%)',
                backgroundSize: '20px 20px'
              }}>
                <div className="p-4">
                  {messages.map((message, index) => (
                    <div key={message.messageId || index} className={`d-flex mb-4 ${message.sender === 'user' ? 'justify-content-end' : 'justify-content-start'}`}>
                      {message.sender === 'bot' && (
                        <div className="me-3">
                          <div className="rounded-circle d-flex align-items-center justify-content-center" style={{
                            width: '45px',
                            height: '45px',
                            background: `linear-gradient(45deg, ${getMessageTypeColor(message.messageType)}, ${getMessageTypeColor(message.messageType)}90)`,
                            color: 'white',
                            fontSize: '1.2rem',
                            boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
                          }}>
                            {getBotMessageIcon(message.messageType)}
                          </div>
                        </div>
                      )}
                      
                      <div className={`message-bubble ${message.sender === 'user' ? 'user-message' : 'bot-message'}`} style={{
                        maxWidth: '70%',
                        padding: '1rem 1.5rem',
                        borderRadius: message.sender === 'user' ? '20px 20px 5px 20px' : '20px 20px 20px 5px',
                        background: message.sender === 'user' 
                          ? 'linear-gradient(45deg, #007bff, #0056b3)' 
                          : 'white',
                        color: message.sender === 'user' ? 'white' : '#333',
                        boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                        position: 'relative'
                      }}>
                        <div className="message-content">
                          {message.message}
                        </div>
                        <div className={`mt-2 small ${message.sender === 'user' ? 'text-white-50' : 'text-muted'}`}>
                          {formatTimestamp(message.timestamp)}
                          {message.messageType && message.sender === 'bot' && (
                            <span className="ms-2 badge" style={{
                              backgroundColor: getMessageTypeColor(message.messageType),
                              fontSize: '0.7rem'
                            }}>
                              {message.messageType}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {message.sender === 'user' && (
                        <div className="ms-3">
                          <div className="rounded-circle d-flex align-items-center justify-content-center" style={{
                            width: '45px',
                            height: '45px',
                            background: 'linear-gradient(45deg, #007bff, #0056b3)',
                            color: 'white',
                            fontSize: '1.2rem',
                            boxShadow: '0 4px 15px rgba(0,123,255,0.2)'
                          }}>
                            👤
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {/* Typing Indicator */}
                  {isTyping && (
                    <div className="d-flex justify-content-start mb-4">
                      <div className="me-3">
                        <div className="rounded-circle d-flex align-items-center justify-content-center" style={{
                          width: '45px',
                          height: '45px',
                          background: 'linear-gradient(45deg, #6c757d, #495057)',
                          color: 'white',
                          fontSize: '1.2rem'
                        }}>
                          🤖
                        </div>
                      </div>
                      <div className="typing-indicator bg-light rounded-pill px-4 py-3" style={{
                        boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
                      }}>
                        <div className="typing-dots d-flex align-items-center">
                          <span className="dot me-1"></span>
                          <span className="dot me-1"></span>
                          <span className="dot"></span>
                          <span className="ms-2 text-muted small">AI is thinking...</span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </div>
              </div>
              
              {/* Suggestions */}
              {suggestions.length > 0 && (
                <div className="px-4 py-2" style={{backgroundColor: 'rgba(248,249,250,0.8)'}}>
                  <div className="d-flex flex-wrap gap-2">
                    <small className="text-muted fw-bold me-2">Quick suggestions:</small>
                    {suggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        className="btn btn-sm btn-outline-primary rounded-pill"
                        onClick={() => handleSuggestionClick(suggestion)}
                        style={{
                          fontSize: '0.8rem',
                          transition: 'all 0.3s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.transform = 'translateY(-2px)';
                          e.target.style.boxShadow = '0 4px 12px rgba(0,123,255,0.2)';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.transform = 'translateY(0)';
                          e.target.style.boxShadow = 'none';
                        }}
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Input Area */}
              <div className="card-footer border-0" style={{
                background: 'linear-gradient(135deg, rgba(248,249,250,0.9) 0%, rgba(255,255,255,0.9) 100%)',
                borderRadius: '0 0 25px 25px',
                padding: '1.5rem 2rem'
              }}>
                <div className="input-group">
                  <textarea
                    className="form-control border-0 shadow-sm"
                    placeholder="Ask me anything about construction, architecture, engineering, or project management..."
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    rows="2"
                    style={{
                      borderRadius: '20px 0 0 20px',
                      resize: 'none',
                      backgroundColor: 'rgba(255,255,255,0.9)'
                    }}
                    disabled={isTyping}
                  />
                  <button
                    className="btn shadow-sm"
                    onClick={() => sendMessage()}
                    disabled={!inputMessage.trim() || isTyping}
                    style={{
                      background: inputMessage.trim() && !isTyping 
                        ? 'linear-gradient(45deg, #28a745, #20c997)' 
                        : 'linear-gradient(45deg, #6c757d, #495057)',
                      border: 'none',
                      color: 'white',
                      borderRadius: '0 20px 20px 0',
                      padding: '0 2rem',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    {isTyping ? (
                      <div className="spinner-border spinner-border-sm" role="status">
                        <span className="visually-hidden">Sending...</span>
                      </div>
                    ) : (
                      <i className="fas fa-paper-plane"></i>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Typing Animation CSS */}
      <style>{`
        .typing-dots .dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background-color: #6c757d;
          animation: typing 1.4s infinite ease-in-out;
        }
        
        .typing-dots .dot:nth-child(1) { animation-delay: -0.32s; }
        .typing-dots .dot:nth-child(2) { animation-delay: -0.16s; }
        
        @keyframes typing {
          0%, 80%, 100% {
            transform: scale(0.8);
            opacity: 0.5;
          }
          40% {
            transform: scale(1.2);
            opacity: 1;
          }
        }
        
        .message-bubble {
          animation: slideIn 0.3s ease-out;
        }
        
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        /* FontAwesome Fallback CSS */
        .fas {
          font-family: "Font Awesome 5 Free", "FontAwesome", sans-serif !important;
          font-weight: 900 !important;
        }
        
        .fas.fa-paper-plane:before { content: "\\f1d8"; }
        
        body.fontawesome-fallback .fas.fa-paper-plane:before,
        .fas.fa-paper-plane:empty:after { content: "📤"; font-family: sans-serif !important; }
        
        body.fontawesome-fallback .fas:before {
          font-family: sans-serif !important;
        }
        
        .fas:empty:after {
          display: inline-block;
          font-size: inherit;
        }
      `}</style>
    </>
  );
}