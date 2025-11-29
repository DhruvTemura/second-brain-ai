const express = require('express');
const router = express.Router();
const Job = require('../models/job');
const User = require('../models/user');

// GET /api/jobs/:jobId - Get job status
router.get('/:jobId', async (req, res) => {
  try {
    const { jobId } = req.params;
    const job = await Job.findById(jobId);

    if (!job) {
      return res.status(404).json({
        error: 'Job not found'
      });
    }

    res.json({
      success: true,
      data: job
    });
  } catch (error) {
    console.error('Error fetching job:', error);
    res.status(500).json({
      error: 'Failed to fetch job',
      message: error.message
    });
  }
});

// GET /api/jobs - Get all jobs for test user
router.get('/', async (req, res) => {
  try {
    // For now, use test user
    const testUser = await User.findByEmail('test@example.com');
    
    if (!testUser) {
      return res.json({
        success: true,
        data: []
      });
    }

    const jobs = await Job.findByUserId(testUser.user_id);

    res.json({
      success: true,
      data: jobs
    });
  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({
      error: 'Failed to fetch jobs',
      message: error.message
    });
  }
});

module.exports = router;