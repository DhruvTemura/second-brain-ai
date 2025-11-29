/**
 * Split text into chunks for embedding
 */
function chunkText(text, maxTokens = 800, overlap = 100) {
  // Simple tokenization: ~4 characters per token (rough estimate)
  const charsPerToken = 4;
  const maxChars = maxTokens * charsPerToken;
  const overlapChars = overlap * charsPerToken;

  // Split into sentences first
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  
  const chunks = [];
  let currentChunk = '';

  for (const sentence of sentences) {
    // If adding this sentence would exceed max, save current chunk
    if (currentChunk.length + sentence.length > maxChars && currentChunk.length > 0) {
      chunks.push(currentChunk.trim());
      
      // Start new chunk with overlap (last few sentences)
      const words = currentChunk.split(' ');
      const overlapWords = words.slice(-Math.floor(overlap / 4));
      currentChunk = overlapWords.join(' ') + ' ' + sentence;
    } else {
      currentChunk += sentence;
    }
  }

  // Add the last chunk
  if (currentChunk.trim().length > 0) {
    chunks.push(currentChunk.trim());
  }

  return chunks.length > 0 ? chunks : [text];
}

/**
 * Clean and normalize text
 */
function cleanText(text) {
  return text
    .replace(/\s+/g, ' ')        // Replace multiple spaces with single space
    .replace(/\n+/g, '\n')        // Replace multiple newlines with single newline
    .trim();
}

module.exports = {
  chunkText,
  cleanText
};