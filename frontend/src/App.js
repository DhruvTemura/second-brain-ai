import React, { useState } from 'react';
import './App.css';
import ChatInterface from './components/ChatInterface';
import UploadPanel from './components/UploadPanel';

function App() {
  const [activeTab, setActiveTab] = useState('chat');

  return (
    <div className="App">
      <header className="App-header">
        <h1>🧠 Second Brain AI</h1>
        <p>Your personal AI-powered knowledge companion</p>
      </header>

      <div className="tab-container">
        <button
          className={`tab ${activeTab === 'chat' ? 'active' : ''}`}
          onClick={() => setActiveTab('chat')}
        >
          💬 Chat
        </button>
        <button
          className={`tab ${activeTab === 'upload' ? 'active' : ''}`}
          onClick={() => setActiveTab('upload')}
        >
          📤 Upload
        </button>
      </div>

      <div className="main-content">
        {activeTab === 'chat' ? <ChatInterface /> : <UploadPanel />}
      </div>

      <footer className="App-footer">
        <p>Powered by Gemini AI • Built with React & PostgreSQL</p>
      </footer>
    </div>
  );
}

export default App;