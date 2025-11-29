const Chunk = require('../models/chunk');
const EmbeddingService = require('./embeddingService');

class RetrievalService {
  /**
   * Search for relevant chunks based on a query
   */
  static async search(query, userId, options = {}) {
    const {
      limit = 5,
      startDate = null,
      endDate = null
    } = options;

    try {
      // Generate embedding for the query
      console.log('Generating query embedding...');
      const queryEmbedding = await EmbeddingService.generateEmbedding(query);

      // Search for similar chunks
      console.log(`Searching for top ${limit} relevant chunks...`);
      const results = await Chunk.search(
        queryEmbedding,
        userId,
        limit,
        startDate,
        endDate
      );

      console.log(`Found ${results.length} relevant chunks`);

      return results;
    } catch (error) {
      console.error('Error in retrieval service:', error);
      throw error;
    }
  }

  /**
   * Parse temporal expressions in query
   * e.g., "yesterday", "last week", "last month"
   */
  static parseTemporalQuery(query) {
    const now = new Date();
    let startDate = null;
    let endDate = null;

    // Simple temporal parsing
    if (query.toLowerCase().includes('yesterday')) {
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(0, 0, 0, 0);
      
      const tomorrow = new Date(yesterday);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      startDate = yesterday;
      endDate = tomorrow;
    } else if (query.toLowerCase().includes('last week')) {
      const lastWeek = new Date(now);
      lastWeek.setDate(lastWeek.getDate() - 7);
      startDate = lastWeek;
      endDate = now;
    } else if (query.toLowerCase().includes('last month')) {
      const lastMonth = new Date(now);
      lastMonth.setMonth(lastMonth.getMonth() - 1);
      startDate = lastMonth;
      endDate = now;
    } else if (query.toLowerCase().includes('today')) {
      const today = new Date(now);
      today.setHours(0, 0, 0, 0);
      startDate = today;
      endDate = now;
    }

    return { startDate, endDate };
  }
}

module.exports = RetrievalService;