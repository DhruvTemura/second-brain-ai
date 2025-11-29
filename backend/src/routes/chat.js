const express = require('express');
const router = express.Router();
const ChatService = require('../services/chatService');
const User = require('../models/user');

// POST /api/chat - Ask a question
router.post('/', async (req, res) => {
  try {
    const { query, message } = req.body;
    const userQuery = query || message;

    if (!userQuery) {
      return res.status(400).json({
        error: 'No query provided',
        message: 'Please provide a "query" or "message" field'
      });
    }

    // For now, use test user
    const testUser = await User.getOrCreate('Test User', 'test@example.com');

    // Get answer
    const result = await ChatService.chat(userQuery, testUser.user_id);

    res.json({
      success: true,
      data: {
        query: userQuery,
        answer: result.answer,
        sources: result.sources,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error in chat endpoint:', error);
    res.status(500).json({
      error: 'Failed to process chat query',
      message: error.message
    });
  }
});

module.exports = router;