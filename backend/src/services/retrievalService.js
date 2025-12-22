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
   * Supports: yesterday, today, last week, last month, this week, this month
   */
  static parseTemporalQuery(query) {
    const now = new Date();
    const lowerQuery = query.toLowerCase();
    let startDate = null;
    let endDate = null;

    if (lowerQuery.includes('yesterday')) {
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(0, 0, 0, 0);
      
      const endOfYesterday = new Date(yesterday);
      endOfYesterday.setHours(23, 59, 59, 999);
      
      startDate = yesterday;
      endDate = endOfYesterday;
    } 
    else if (lowerQuery.includes('today')) {
      const today = new Date(now);
      today.setHours(0, 0, 0, 0);
      startDate = today;
      endDate = now;
    }
    else if (lowerQuery.includes('this week')) {
      const startOfWeek = new Date(now);
      const day = startOfWeek.getDay();
      const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); // Monday as start
      startOfWeek.setDate(diff);
      startOfWeek.setHours(0, 0, 0, 0);
      
      startDate = startOfWeek;
      endDate = now;
    }
    else if (lowerQuery.includes('last week')) {
      const lastWeekStart = new Date(now);
      lastWeekStart.setDate(lastWeekStart.getDate() - 7);
      lastWeekStart.setHours(0, 0, 0, 0);
      
      startDate = lastWeekStart;
      endDate = now;
    }
    else if (lowerQuery.includes('this month')) {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      startOfMonth.setHours(0, 0, 0, 0);
      
      startDate = startOfMonth;
      endDate = now;
    }
    else if (lowerQuery.includes('last month')) {
      const lastMonthStart = new Date(now);
      lastMonthStart.setMonth(lastMonthStart.getMonth() - 1);
      lastMonthStart.setHours(0, 0, 0, 0);
      
      startDate = lastMonthStart;
      endDate = now;
    }

    if (startDate && endDate) {
      console.log(`⏰ Temporal range detected: ${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}`);
    }

    return { startDate, endDate };
  }
}

module.exports = RetrievalService;