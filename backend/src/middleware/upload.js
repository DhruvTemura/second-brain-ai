const multer = require('multer');
const path = require('path');

// Configure multer for memory storage (we'll process files in memory)
const storage = multer.memoryStorage();

// File filter - accept only specific file types
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'audio/mpeg',           // .mp3
    'audio/mp4',            // .m4a
    'audio/wav',            // .wav
    'application/pdf',      // .pdf
    'text/plain',           // .txt
    'text/markdown',        // .md
  ];

  const allowedExtensions = ['.mp3', '.m4a', '.wav', '.pdf', '.txt', '.md'];
  const ext = path.extname(file.originalname).toLowerCase();

  if (allowedTypes.includes(file.mimetype) || allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error(`File type not supported: ${file.mimetype}. Allowed: audio (mp3, m4a, wav), documents (pdf, txt, md)`), false);
  }
};

// Create multer upload instance
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB max file size
  },
});

module.exports = upload;