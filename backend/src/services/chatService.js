const { chatModel } = require('../config/gemini');
const RetrievalService = require('./retrievalService');
const Chunk = require('../models/chunk');

class ChatService {
  static async chat(query, userId) {
    try {
      console.log(`\n💬 Chat query: "${query}"`);

      // Classify query type
      const queryType = this.classifyQuery(query);
      console.log(`📋 Query type: ${queryType}`);

      // Parse temporal constraints
      const { startDate, endDate } = RetrievalService.parseTemporalQuery(query);

      let relevantChunks;

      // Route based on query type
      if (queryType === 'TEMPORAL_ONLY' && startDate && endDate) {
        // Metadata-first retrieval for purely temporal queries
        console.log('🕐 Using metadata-first retrieval');
        relevantChunks = await Chunk.getChunksByTimeRange(userId, startDate, endDate, 10);
      } else {
        // Semantic search (with optional temporal filter)
        console.log('🔍 Using semantic search');
        relevantChunks = await RetrievalService.search(query, userId, {
          limit: 5,
          startDate,
          endDate
        });
      }

      if (relevantChunks.length === 0) {
        return {
          answer: "I don't have any information related to your query in my memory.",
          sources: [],
          context: []
        };
      }

      // Build context with timestamps
      const context = relevantChunks
        .map((chunk, idx) => {
          const ts = new Date(chunk.chunk_timestamp);
          const humanTime = ts.toLocaleString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          });

          return `
[${idx + 1}]
${chunk.source_title ? `Source: ${chunk.source_title}` : ''}
Uploaded: ${humanTime}
Content: ${chunk.text}
`;
        })
        .join('\n');

      const prompt = this.buildPrompt(query, context, queryType);

      console.log('Generating answer with LLM...');
      const result = await chatModel.generateContent(prompt);
      const answer = result.response.text();
      console.log('✅ Answer generated\n');

      return {
        answer: answer,
        sources: relevantChunks.map(chunk => ({
          chunk_id: chunk.chunk_id,
          text: chunk.text.substring(0, 150) + '...',
          similarity: chunk.similarity || 1.0,
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
   * Classify query type to determine retrieval strategy
   */
  static classifyQuery(query) {
    const lowerQuery = query.toLowerCase();

    // Temporal keywords
    const temporalKeywords = [
      'yesterday',
      'today',
      'last week',
      'last month',
      'this week',
      'this month'
    ];

    const hasTemporal = temporalKeywords.some(keyword => lowerQuery.includes(keyword));

    // If no temporal keyword, it's purely semantic
    if (!hasTemporal) {
      return 'SEMANTIC_ONLY';
    }

    // Common words + action verbs (not semantic topics)
    const nonTopicWords = [
      'what', 'did', 'i', 'upload', 'uploaded', 'save', 'saved', 'add', 'added', 
      'store', 'stored', 'tell', 'told', 'you', 'work', 'worked', 'on', 'about', 
      'the', 'a', 'an', 'is', 'was', 'were', 'have', 'has', 'had', 'do', 'does',
      'my', 'me', 'from', 'in', 'at', 'to', 'for', 'with', 'show', 'list',
      'get', 'give', 'everything', 'anything', 'something', 'all', 'any',
      'summarize', 'summary'
    ];

    // Remove temporal keywords, common words, and punctuation
    let remainingWords = lowerQuery
      .replace(/[?.,!]/g, '') // Remove punctuation
      .split(/\s+/)
      .filter(word => !temporalKeywords.some(tk => word.includes(tk))) // Remove temporal words
      .filter(word => !nonTopicWords.includes(word)) // Remove non-topic words
      .filter(word => word.length > 0);

    // Debug log (optional - comment out in production)
    console.log('   Remaining semantic words:', remainingWords);

    const hasSemanticContent = remainingWords.length > 0;

    // Classification logic
    if (hasTemporal && !hasSemanticContent) {
      return 'TEMPORAL_ONLY';
    } else if (hasTemporal && hasSemanticContent) {
      return 'TEMPORAL_SEMANTIC';
    } else {
      return 'SEMANTIC_ONLY';
    }
  }

  static buildPrompt(query, context, queryType) {
    // Add extra instruction for temporal-only queries
    const temporalGuidance = queryType === 'TEMPORAL_ONLY'
      ? '\n8. For temporal listing queries, summarize ALL items from the specified time period.'
      : '';

    return `You are a helpful AI assistant with access to a user's personal knowledge base.

Your task is to answer the user's question based ONLY on the context provided below. 

IMPORTANT RULES:
1. Only use information from the provided context to answer the question
2. If the context doesn't contain relevant information, say "I don't have enough information to answer that question"
3. Do not make up or infer information that isn't in the context
4. Be concise and direct in your answer
5. If the context contains conflicting information, mention both perspectives
6. You may use timestamps provided in the context to answer temporal questions such as "when", "what date", "how long ago", etc.
7. If multiple context items relate to the question, prefer the most recent one unless specified otherwise.${temporalGuidance}

CONTEXT:

${context}

USER QUESTION:
${query}

ANSWER:`;
  }
}

module.exports = ChatService;