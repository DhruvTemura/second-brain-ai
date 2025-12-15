import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Ingest text
export const ingestText = async (text, title) => {
  const response = await api.post('/api/ingest/text', { text, title });
  return response.data;
};

// Upload file
export const uploadFile = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await api.post('/api/ingest/file', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

// Get job status
export const getJobStatus = async (jobId) => {
  const response = await api.get(`/api/jobs/${jobId}`);
  return response.data;
};

// Get all jobs
export const getAllJobs = async () => {
  const response = await api.get('/api/jobs');
  return response.data;
};

// Send chat message
export const sendChatMessage = async (query) => {
  const response = await api.post('/api/chat', { query });
  return response.data;
};

export default api;