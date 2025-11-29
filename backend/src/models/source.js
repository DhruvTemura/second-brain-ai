const pool = require('../config/database');

class Source {
  // Create a new source
  static async create(userId, sourceType, title, rawLocation, sourceTimestamp = null) {
    const query = `
      INSERT INTO sources (user_id, source_type, title, raw_location, source_timestamp)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;
    const result = await pool.query(query, [
      userId,
      sourceType,
      title,
      rawLocation,
      sourceTimestamp
    ]);
    return result.rows[0];
  }

  // Find source by ID
  static async findById(sourceId) {
    const query = 'SELECT * FROM sources WHERE source_id = $1';
    const result = await pool.query(query, [sourceId]);
    return result.rows[0];
  }

  // Get all sources for a user
  static async findByUserId(userId) {
    const query = `
      SELECT * FROM sources 
      WHERE user_id = $1 
      ORDER BY created_at DESC
    `;
    const result = await pool.query(query, [userId]);
    return result.rows;
  }
}

module.exports = Source;