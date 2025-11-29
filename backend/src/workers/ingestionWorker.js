const JobProcessor = require('../services/jobProcessor');
require('dotenv').config();

class IngestionWorker {
  constructor(pollInterval = 5000) {
    this.pollInterval = pollInterval; // Poll every 5 seconds
    this.isRunning = false;
  }

  /**
   * Start the worker
   */
  start() {
    console.log('🚀 Ingestion Worker started');
    console.log(`   Polling every ${this.pollInterval}ms\n`);
    
    this.isRunning = true;
    this.poll();
  }

  /**
   * Stop the worker
   */
  stop() {
    console.log('\n🛑 Stopping Ingestion Worker...');
    this.isRunning = false;
  }

  /**
   * Poll for pending jobs
   */
  async poll() {
    if (!this.isRunning) return;

    try {
      await JobProcessor.processPendingJobs();
    } catch (error) {
      console.error('Error in worker poll:', error);
    }

    // Schedule next poll
    setTimeout(() => this.poll(), this.pollInterval);
  }
}

// If this file is run directly, start the worker
if (require.main === module) {
  const worker = new IngestionWorker(5000);
  worker.start();

  // Graceful shutdown
  process.on('SIGTERM', () => worker.stop());
  process.on('SIGINT', () => worker.stop());
}

module.exports = IngestionWorker;