const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check route
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Second Brain API is running',
    timestamp: new Date().toISOString()
  });
});

// Test routes
app.use('/api/test', require('./routes/test'));

// Main routes
app.use('/api/ingest', require('./routes/ingest'));
app.use('/api/jobs', require('./routes/jobs'));
app.use('/api/chat', require('./routes/chat')); // NEW ROUTE

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal Server Error',
      status: err.status || 500
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: {
      message: 'Route not found',
      status: 404
    }
  });
});

module.exports = app;