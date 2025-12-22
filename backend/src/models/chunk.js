const pool = require('../config/database');

class Chunk {
  /**
   * Create a single chunk
   */
  static async create(sourceId, userId, text, embedding, chunkTimestamp, index) {
    const query = `
      INSERT INTO chunks (source_id, user_id, text, embedding, chunk_timestamp, index)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING chunk_id, source_id, user_id, text, chunk_timestamp, index, created_at;
    `;
    const result = await pool.query(query, [
      sourceId,
      userId,
      text,
      `[${embedding.join(',')}]`, // Convert array to pgvector format
      chunkTimestamp,
      index
    ]);
    return result.rows[0];
  }

  /**
   * Batch insert chunks (more efficient)
   */
  static async createMany(chunks) {
    if (chunks.length === 0) return [];

    // Build the VALUES part of the query
    const values = [];
    const params = [];
    let paramIndex = 1;

    chunks.forEach((chunk) => {
      values.push(
        `($${paramIndex}, $${paramIndex + 1}, $${paramIndex + 2}, $${paramIndex + 3}, $${paramIndex + 4}, $${paramIndex + 5})`
      );
      params.push(
        chunk.sourceId,
        chunk.userId,
        chunk.text,
        `[${chunk.embedding.join(',')}]`,
        chunk.chunkTimestamp,
        chunk.index
      );
      paramIndex += 6;
    });

    const query = `
      INSERT INTO chunks (source_id, user_id, text, embedding, chunk_timestamp, index)
      VALUES ${values.join(', ')}
      RETURNING chunk_id, source_id, user_id, text, chunk_timestamp, index, created_at;
    `;

    const result = await pool.query(query, params);
    return result.rows;
  }

  /**
   * Search chunks by vector similarity
   */
  static async search(queryEmbedding, userId, limit = 5, startDate = null, endDate = null) {
    const embeddingStr = `[${queryEmbedding.join(',')}]`;
    const result = await pool.query(
      'SELECT * FROM search_chunks($1::vector, $2::uuid, $3::int, $4::timestamp, $5::timestamp)',
      [embeddingStr, userId, limit, startDate, endDate]
    );
    return result.rows;
  }

  /**
   * Get chunks by time range (metadata-first retrieval)
   * Used for purely temporal queries like "What did I upload yesterday?"
   */
  static async getChunksByTimeRange(userId, startDate, endDate, limit = 10) {
    const query = `
      SELECT 
        c.chunk_id, 
        c.source_id, 
        c.user_id, 
        c.text, 
        c.chunk_timestamp, 
        c.index, 
        c.created_at,
        s.title as source_title,
        1.0 as similarity
      FROM chunks c
      LEFT JOIN sources s ON c.source_id = s.source_id
      WHERE c.user_id = $1 
        AND c.chunk_timestamp >= $2 
        AND c.chunk_timestamp <= $3
      ORDER BY c.chunk_timestamp DESC
      LIMIT $4
    `;
    
    const result = await pool.query(query, [userId, startDate, endDate, limit]);
    return result.rows;
  }

  /**
   * Get chunks by source
   */
  static async findBySourceId(sourceId) {
    const query = `
      SELECT chunk_id, source_id, user_id, text, chunk_timestamp, index, created_at
      FROM chunks 
      WHERE source_id = $1 
      ORDER BY index ASC
    `;
    const result = await pool.query(query, [sourceId]);
    return result.rows;
  }
}

module.exports = Chunk;