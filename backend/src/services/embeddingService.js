const { embeddingModel } = require('../config/gemini');

class EmbeddingService {
  /**
   * Generate embedding for a single text
   */
  static async generateEmbedding(text) {
    try {
      const result = await embeddingModel.embedContent(text);
      return result.embedding.values;
    } catch (error) {
      console.error('Error generating embedding:', error);
      throw new Error('Failed to generate embedding');
    }
  }

  /**
   * Generate embeddings for multiple texts (batch)
   */
  static async generateEmbeddings(texts) {
    try {
      const embeddings = [];
      
      // Process in batches to avoid rate limits
      for (const text of texts) {
        const embedding = await this.generateEmbedding(text);
        embeddings.push(embedding);
        
        // Small delay to avoid rate limiting (adjust as needed)
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      return embeddings;
    } catch (error) {
      console.error('Error generating embeddings:', error);
      throw error;
    }
  }
}

module.exports = EmbeddingService;