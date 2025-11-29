const User = require('../models/user');
const Source = require('../models/source');
const Job = require('../models/job');
const { saveFile } = require('../utils/fileHandler');
const pool = require('../config/database'); // ADD THIS
const path = require('path');

class IngestionService {
  static async ingestFile(file, userId, sourceType = null) {
    try {
      if (!sourceType) {
        sourceType = this.getSourceType(file.mimetype, file.originalname);
      }

      const filepath = await saveFile(file);

      const source = await Source.create(
        userId,
        sourceType,
        file.originalname,
        filepath,
        new Date()
      );

      const job = await Job.create(userId, source.source_id);

      return {
        source,
        job,
        message: 'File uploaded successfully. Processing started.'
      };
    } catch (error) {
      console.error('Error in ingestion service:', error);
      throw error;
    }
  }

  static async ingestText(text, userId, title = 'Text Note') {
    try {
      const source = await Source.create(
        userId,
        'text',
        title,
        null,
        new Date()
      );

      // Store the actual text content
      await pool.query(
        'UPDATE sources SET content = $1 WHERE source_id = $2',
        [text, source.source_id]
      );

      const job = await Job.create(userId, source.source_id);

      return {
        source,
        job,
        message: 'Text uploaded successfully. Processing started.'
      };
    } catch (error) {
      console.error('Error in text ingestion:', error);
      throw error;
    }
  }

  static getSourceType(mimetype, filename) {
    const ext = path.extname(filename).toLowerCase();

    if (mimetype.startsWith('audio/') || ['.mp3', '.m4a', '.wav'].includes(ext)) {
      return 'audio';
    }

    if (mimetype === 'application/pdf' || ['.pdf', '.txt', '.md'].includes(ext)) {
      return 'document';
    }

    return 'document';
  }
}

module.exports = IngestionService;