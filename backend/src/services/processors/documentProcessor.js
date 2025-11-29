const pdfParse = require('pdf-parse');

/**
 * Extract text from PDF
 */
async function extractPDF(buffer) {
  try {
    const data = await pdfParse(buffer); // Changed from pdfParse() to pdfParse()
    return data.text;
  } catch (error) {
    console.error('Error extracting PDF:', error);
    throw new Error('Failed to extract text from PDF');
  }
}

/**
 * Extract text from plain text file
 */
function extractText(buffer) {
  return buffer.toString('utf-8');
}

/**
 * Process document - extract text based on file type
 */
async function processDocument(fileBuffer, mimetype, originalFilename) {
  try {
    let text = '';

    if (mimetype === 'application/pdf' || originalFilename.endsWith('.pdf')) {
      text = await extractPDF(fileBuffer);
    } else if (mimetype === 'text/plain' || originalFilename.endsWith('.txt')) {
      text = extractText(fileBuffer);
    } else if (mimetype === 'text/markdown' || originalFilename.endsWith('.md')) {
      text = extractText(fileBuffer);
    } else {
      throw new Error(`Unsupported document type: ${mimetype}`);
    }

    return {
      text: text.trim(),
      filepath: null,
    };
  } catch (error) {
    console.error('Error processing document:', error);
    throw error;
  }
}

module.exports = {
  processDocument,
  extractPDF,
  extractText
};