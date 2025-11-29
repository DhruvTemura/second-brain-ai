const Job = require('../models/job');
const Source = require('../models/source');
const Chunk = require('../models/chunk');
const EmbeddingService = require('./embeddingService');
const { processDocument } = require('./processors/documentProcessor');
const { chunkText, cleanText } = require('../utils/textProcessor');
const { readFile } = require('../utils/fileHandler');
const pool = require('../config/database');

class JobProcessor {
  /**
   * Process a single job
   */
  static async processJob(job) {
    console.log(`\n🔄 Processing job: ${job.job_id}`);
    
    try {
      // Update job status to processing
      await Job.updateStatus(job.job_id, 'processing');

      // Get source details
      const source = await Source.findById(job.source_id);
      
      if (!source) {
        throw new Error('Source not found');
      }

      console.log(`   Source: ${source.title} (${source.source_type})`);

      // Extract text based on source type
      let extractedText = '';

      if (source.source_type === 'text') {
        // Retrieve actual text from source content field
        const contentQuery = await pool.query(
          'SELECT content FROM sources WHERE source_id = $1',
          [source.source_id]
        );
        extractedText = contentQuery.rows[0]?.content || '';
        
        if (!extractedText) {
          throw new Error('Text content not found for source');
        }
      } else if (source.source_type === 'document') {
        // Read file and extract text
        const fileBuffer = await readFile(source.raw_location);
        const result = await processDocument(
          fileBuffer,
          'application/pdf', // TODO: Store mimetype in source
          source.title
        );
        extractedText = result.text;
      } else if (source.source_type === 'audio') {
        // TODO: Implement audio transcription
        extractedText = '[Audio transcription placeholder]';
      }

      // Clean the text
      const cleanedText = cleanText(extractedText);
      console.log(`   Extracted text length: ${cleanedText.length} characters`);

      // Chunk the text
      const textChunks = chunkText(cleanedText);
      console.log(`   Created ${textChunks.length} chunks`);

      // Generate embeddings for each chunk
      console.log('   Generating embeddings...');
      const embeddings = await EmbeddingService.generateEmbeddings(textChunks);
      console.log(`   Generated ${embeddings.length} embeddings`);

      // Prepare chunks for database insertion
      const chunksToInsert = textChunks.map((text, index) => ({
        sourceId: source.source_id,
        userId: job.user_id,
        text: text,
        embedding: embeddings[index],
        chunkTimestamp: source.source_timestamp || source.created_at,
        index: index
      }));

      // Insert chunks into database
      console.log('   Saving chunks to database...');
      const savedChunks = await Chunk.createMany(chunksToInsert);
      console.log(`   ✅ Saved ${savedChunks.length} chunks to database`);

      // Update job status to done
      await Job.updateStatus(job.job_id, 'done');
      console.log(`✅ Job completed: ${job.job_id}\n`);

      return {
        success: true,
        chunksCreated: savedChunks.length
      };

    } catch (error) {
      console.error(`❌ Job failed: ${job.job_id}`, error);
      
      // Update job status to failed
      await Job.updateStatus(job.job_id, 'failed', error.message);
      
      throw error;
    }
  }

  /**
   * Process all pending jobs
   */
  static async processPendingJobs() {
    try {
      const pendingJobs = await Job.getPending(10);
      
      if (pendingJobs.length === 0) {
        console.log('No pending jobs');
        return { processed: 0 };
      }

      console.log(`Found ${pendingJobs.length} pending jobs`);

      let successCount = 0;
      let failCount = 0;

      for (const job of pendingJobs) {
        try {
          await this.processJob(job);
          successCount++;
        } catch (error) {
          failCount++;
          console.error(`Failed to process job ${job.job_id}:`, error.message);
        }
      }

      console.log(`\n📊 Batch complete: ${successCount} succeeded, ${failCount} failed\n`);

      return {
        processed: pendingJobs.length,
        succeeded: successCount,
        failed: failCount
      };

    } catch (error) {
      console.error('Error processing pending jobs:', error);
      throw error;
    }
  }
}

module.exports = JobProcessor;