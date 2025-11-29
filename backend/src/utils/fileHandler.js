const fs = require('fs').promises;
const path = require('path');

/**
 * Save uploaded file to disk
 * @param {Object} file - Multer file object
 * @param {string} destinationDir - Directory to save file
 * @returns {string} File path
 */
async function saveFile(file, destinationDir = 'uploads') {
  const uploadDir = path.join(__dirname, '../../', destinationDir);
  
  // Create directory if it doesn't exist
  await fs.mkdir(uploadDir, { recursive: true });
  
  const filename = `${Date.now()}-${file.originalname}`;
  const filepath = path.join(uploadDir, filename);
  
  await fs.writeFile(filepath, file.buffer);
  
  return filepath;
}

/**
 * Read file content
 * @param {string} filepath - Path to file
 * @returns {Buffer} File content
 */
async function readFile(filepath) {
  return await fs.readFile(filepath);
}

/**
 * Delete file
 * @param {string} filepath - Path to file
 */
async function deleteFile(filepath) {
  try {
    await fs.unlink(filepath);
  } catch (error) {
    console.error('Error deleting file:', error);
  }
}

module.exports = {
  saveFile,
  readFile,
  deleteFile
};