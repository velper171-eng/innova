import { runPostureAnalysis } from "./postureWorker.js";

const queue = [];
let isProcessing = false;

/**
 * Adds a new video job to the queue and starts processing if idle.
 */
export function enqueuePostureJob(jobId, videoPath) {
  console.log(`Enqueuing Job ID: ${jobId} for video ${videoPath}`);
  queue.push({ jobId, videoPath });
  processNext();
}

/**
 * Processes the next job in the queue.
 */
async function processNext() {
  if (isProcessing) {
    console.log("Queue is currently processing another job. Standing by...");
    return;
  }

  if (queue.length === 0) {
    console.log("Queue is empty. Idle state.");
    return;
  }

  isProcessing = true;
  const currentJob = queue.shift();

  console.log(`Processing next job: Job ID ${currentJob.jobId}`);
  try {
    await runPostureAnalysis(currentJob.jobId, currentJob.videoPath);
  } catch (err) {
    console.error(`Error in queue execution of job ${currentJob.jobId}:`, err);
  } finally {
    isProcessing = false;
    // Process next job asynchronously to prevent call stack issues
    setTimeout(processNext, 100);
  }
}

/**
 * Returns the current queue length (waiting jobs)
 */
export function getQueueStatus() {
  return {
    waitingCount: queue.length,
    isProcessing
  };
}
