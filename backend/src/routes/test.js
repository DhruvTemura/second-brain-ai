const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// Test database connection
router.get('/db', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW() as current_time, current_database() as database');
    res.json({
      success: true,
      message: 'Database connected successfully',
      data: result.rows[0]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Database connection failed',
      error: error.message
    });
  }
});

// Test tables exist
router.get('/tables', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);
    res.json({
      success: true,
      message: 'Tables retrieved successfully',
      tables: result.rows
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve tables',
      error: error.message
    });
  }
});

module.exports = router;