const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Model for embeddings (this one works - you've been using it)
const embeddingModel = genAI.getGenerativeModel({ 
  model: "text-embedding-004" 
});

// Model for chat/LLM - Use the base gemini-pro (free tier)
const chatModel = genAI.getGenerativeModel({ 
  model: "gemini-2.5-flash-lite" // This is the free tier model
});

module.exports = {
  embeddingModel,
  chatModel,
  genAI
};