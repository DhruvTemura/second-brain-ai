import React, { useState, useRef, useEffect } from 'react';
import { sendChatMessage } from '../services/api';
import './ChatInterface.css';

function ChatInterface() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = {
      type: 'user',
      content: input,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await sendChatMessage(input);
      
      const aiMessage = {
        type: 'ai',
        content: response.data.answer,
        sources: response.data.sources || [],
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = {
        type: 'error',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="chat-interface">
      <div className="messages-container">
        {messages.length === 0 && (
          <div className="empty-state">
            <h2>👋 Hello!</h2>
            <p>Ask me anything about the content you've uploaded.</p>
            <div className="example-questions">
              <p>Try asking:</p>
              <ul>
                <li>"What information do you have?"</li>
                <li>"Summarize what I've told you"</li>
                <li>"What did I upload yesterday?"</li>
              </ul>
            </div>
          </div>
        )}

        {messages.map((message, index) => (
          <div key={index} className={`message ${message.type}`}>
            <div className="message-content">
              {message.content}
            </div>
            {message.sources && message.sources.length > 0 && (
              <div className="sources">
                <p className="sources-label">📚 Sources:</p>
                {message.sources.slice(0, 3).map((source, idx) => (
                  <div key={idx} className="source-item">
                    <span className="similarity">
                      {Math.round(source.similarity * 100)}% match
                    </span>
                    <span className="source-text">{source.text}</span>
                  </div>
                ))}
              </div>
            )}
            <div className="message-time">
              {new Date(message.timestamp).toLocaleTimeString()}
            </div>
          </div>
        ))}

        {loading && (
          <div className="message ai loading">
            <div className="message-content">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="input-container">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ask me anything..."
          rows="1"
          disabled={loading}
        />
        <button onClick={handleSend} disabled={loading || !input.trim()}>
          {loading ? '...' : '→'}
        </button>
      </div>
    </div>
  );
}

export default ChatInterface;