const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const IngestionService = require('../services/ingestionService');
const User = require('../models/user');

// POST /api/ingest/file - Upload a file (audio or document)
router.post('/file', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'No file uploaded'
      });
    }

    // For now, use a test user (later we'll add authentication)
    const testUser = await User.getOrCreate('Test User', 'test@example.com');

    // Ingest the file
    const result = await IngestionService.ingestFile(
      req.file,
      testUser.user_id
    );

    res.json({
      success: true,
      message: result.message,
      data: {
        source_id: result.source.source_id,
        job_id: result.job.job_id,
        source_type: result.source.source_type,
        title: result.source.title,
        status: result.job.status
      }
    });
  } catch (error) {
    console.error('Error in file upload:', error);
    res.status(500).json({
      error: 'Failed to upload file',
      message: error.message
    });
  }
});

// POST /api/ingest/text - Submit text directly
router.post('/text', express.json(), async (req, res) => {
  try {
    const { text, title } = req.body;

    if (!text) {
      return res.status(400).json({
        error: 'No text provided'
      });
    }

    // For now, use a test user
    const testUser = await User.getOrCreate('Test User', 'test@example.com');

    // Ingest the text
    const result = await IngestionService.ingestText(
      text,
      testUser.user_id,
      title || 'Text Note'
    );

    res.json({
      success: true,
      message: result.message,
      data: {
        source_id: result.source.source_id,
        job_id: result.job.job_id,
        source_type: result.source.source_type,
        title: result.source.title,
        status: result.job.status
      }
    });
  } catch (error) {
    console.error('Error in text upload:', error);
    res.status(500).json({
      error: 'Failed to upload text',
      message: error.message
    });
  }
});

module.exports = router;