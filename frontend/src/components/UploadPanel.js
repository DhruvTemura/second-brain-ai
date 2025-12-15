import React, { useState } from 'react';
import { ingestText, uploadFile } from '../services/api';
import './UploadPanel.css';

function UploadPanel() {
  const [activeUploadTab, setActiveUploadTab] = useState('text');
  const [textInput, setTextInput] = useState('');
  const [titleInput, setTitleInput] = useState('');
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleTextUpload = async () => {
    if (!textInput.trim()) {
      setMessage({ type: 'error', text: 'Please enter some text' });
      return;
    }

    setUploading(true);
    setMessage(null);

    try {
      const response = await ingestText(textInput, titleInput || 'Text Note');
      setMessage({
        type: 'success',
        text: `✅ ${response.message} Job ID: ${response.data.job_id.substring(0, 8)}...`,
      });
      setTextInput('');
      setTitleInput('');
    } catch (error) {
      setMessage({
        type: 'error',
        text: '❌ Failed to upload text. Please try again.',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleFileUpload = async () => {
    if (!file) {
      setMessage({ type: 'error', text: 'Please select a file' });
      return;
    }

    setUploading(true);
    setMessage(null);

    try {
      const response = await uploadFile(file);
      setMessage({
        type: 'success',
        text: `✅ ${response.message} Job ID: ${response.data.job_id.substring(0, 8)}...`,
      });
      setFile(null);
      // Reset file input
      document.getElementById('file-input').value = '';
    } catch (error) {
      setMessage({
        type: 'error',
        text: '❌ Failed to upload file. Please try again.',
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="upload-panel">
      <div className="upload-tabs">
        <button
          className={`upload-tab ${activeUploadTab === 'text' ? 'active' : ''}`}
          onClick={() => setActiveUploadTab('text')}
        >
          📝 Text
        </button>
        <button
          className={`upload-tab ${activeUploadTab === 'file' ? 'active' : ''}`}
          onClick={() => setActiveUploadTab('file')}
        >
          📎 File
        </button>
      </div>

      {message && (
        <div className={`message-banner ${message.type}`}>
          {message.text}
        </div>
      )}

      {activeUploadTab === 'text' ? (
        <div className="upload-content">
          <input
            type="text"
            placeholder="Title (optional)"
            value={titleInput}
            onChange={(e) => setTitleInput(e.target.value)}
            className="title-input"
          />
          <textarea
            placeholder="Enter your text here..."
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            rows="10"
            className="text-input"
          />
          <button
            onClick={handleTextUpload}
            disabled={uploading || !textInput.trim()}
            className="upload-button"
          >
            {uploading ? 'Uploading...' : 'Upload Text'}
          </button>
        </div>
      ) : (
        <div className="upload-content">
          <div className="file-input-container">
            <input
              id="file-input"
              type="file"
              accept=".pdf,.txt,.md,.mp3,.m4a,.wav"
              onChange={(e) => setFile(e.target.files[0])}
              className="file-input"
            />
            <label htmlFor="file-input" className="file-input-label">
              {file ? file.name : 'Choose a file...'}
            </label>
          </div>
          <p className="file-hint">
            Supported: PDF, TXT, MD, MP3, M4A, WAV (max 50MB)
          </p>
          <button
            onClick={handleFileUpload}
            disabled={uploading || !file}
            className="upload-button"
          >
            {uploading ? 'Uploading...' : 'Upload File'}
          </button>
        </div>
      )}
    </div>
  );
}

export default UploadPanel;