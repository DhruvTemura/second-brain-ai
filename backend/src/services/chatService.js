const { chatModel } = require('../config/gemini');
const RetrievalService = require('./retrievalService');

class ChatService {
  /**
   * Generate answer based on query and context
   */
  static async chat(query, userId) {
    try {
      console.log(`\n💬 Chat query: "${query}"`);

      // Parse temporal constraints from query
      const { startDate, endDate } = RetrievalService.parseTemporalQuery(query);

      // Retrieve relevant chunks
      const relevantChunks = await RetrievalService.search(query, userId, {
        limit: 5,
        startDate,
        endDate
      });

      if (relevantChunks.length === 0) {
        return {
          answer: "I don't have any information related to your query in my memory.",
          sources: [],
          context: []
        };
      }

      // Build context from retrieved chunks
      const context = relevantChunks
        .map((chunk, idx) => `[${idx + 1}] ${chunk.text}`)
        .join('\n\n');

      // Build prompt for LLM
      const prompt = this.buildPrompt(query, context);

      console.log('Generating answer with LLM...');

      // Generate answer using Gemini
      const result = await chatModel.generateContent(prompt);
      const answer = result.response.text();

      console.log('✅ Answer generated\n');

      return {
        answer: answer,
        sources: relevantChunks.map(chunk => ({
          chunk_id: chunk.chunk_id,
          text: chunk.text.substring(0, 150) + '...',
          similarity: chunk.similarity,
          timestamp: chunk.chunk_timestamp
        })),
        context: relevantChunks
      };

    } catch (error) {
      console.error('Error in chat service:', error);
      throw error;
    }
  }

  /**
   * Build prompt for LLM
   */
  static buildPrompt(query, context) {
    return `You are a helpful AI assistant with access to a user's personal knowledge base.

Your task is to answer the user's question based ONLY on the context provided below. 

IMPORTANT RULES:
1. Only use information from the provided context to answer the question
2. If the context doesn't contain relevant information, say "I don't have enough information to answer that question"
3. Do not make up or infer information that isn't in the context
4. Be concise and direct in your answer
5. If the context contains conflicting information, mention both perspectives

CONTEXT:
${context}

USER QUESTION:
${query}

ANSWER:`;
  }
}

module.exports = ChatService;