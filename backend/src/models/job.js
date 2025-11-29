const pool = require('../config/database');

class Job {
  // Create a new job
  static async create(userId, sourceId) {
    const query = `
      INSERT INTO jobs (user_id, source_id, status)
      VALUES ($1, $2, 'queued')
      RETURNING *;
    `;
    const result = await pool.query(query, [userId, sourceId]);
    return result.rows[0];
  }

  // Update job status
  static async updateStatus(jobId, status, errorMessage = null) {
    const query = `
      UPDATE jobs 
      SET status = $1, error_message = $2, updated_at = NOW()
      WHERE job_id = $3
      RETURNING *;
    `;
    const result = await pool.query(query, [status, errorMessage, jobId]);
    return result.rows[0];
  }

  // Find job by ID
  static async findById(jobId) {
    const query = 'SELECT * FROM jobs WHERE job_id = $1';
    const result = await pool.query(query, [jobId]);
    return result.rows[0];
  }

  // Get all jobs for a user
  static async findByUserId(userId) {
    const query = `
      SELECT j.*, s.title as source_title, s.source_type
      FROM jobs j
      LEFT JOIN sources s ON j.source_id = s.source_id
      WHERE j.user_id = $1
      ORDER BY j.created_at DESC
    `;
    const result = await pool.query(query, [userId]);
    return result.rows;
  }

  // Get pending jobs (for worker to process)
  static async getPending(limit = 10) {
    const query = `
      SELECT * FROM jobs 
      WHERE status = 'queued'
      ORDER BY created_at ASC
      LIMIT $1
    `;
    const result = await pool.query(query, [limit]);
    return result.rows;
  }
}

module.exports = Job;