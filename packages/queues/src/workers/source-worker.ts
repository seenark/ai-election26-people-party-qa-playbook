// src/workers/source-worker.ts

import { Worker, Job } from "bullmq"

import { connection } from "../connection"
import { JOB_NAMES, QUEUE_NAMES, type ExtractQAPayload } from "../names"

export function startSourceWorker() {
  const worker = new Worker(
    QUEUE_NAMES.SOURCE,
    async (job: Job<ExtractQAPayload>) => {
      try {
        console.log(`[${QUEUE_NAMES.SOURCE}] Processing job ${job.id}`)
        console.log(`Job name: ${job.name}`)
        console.log(`Payload:`, job.data)

        // Validate job name
        if (job.name !== JOB_NAMES.EXTRACT_QA) {
          throw new Error(`Unknown job name: ${job.name}`)
        }

        const { sourceId } = job.data
        console.log(`Extracting Q&A from source: ${sourceId}`)

        // TODO: Implement business logic here
        // - Fetch source from DB
        // - Extract Q&A pairs
        // - Save to DB
        // - Enqueue jobs to qaQueue

        await new Promise((resolve) => setTimeout(resolve, 100)) // Simulate work

        return {
          ok: true,
          jobName: job.name,
          data: job.data,
          message: `Successfully processed source ${sourceId}`,
        }
      } catch (error) {
        console.error(`[${QUEUE_NAMES.SOURCE}] Error processing job ${job.id}:`, error)
        throw error // Re-throw to mark job as failed
      }
    },
    {
      connection: connection,
      concurrency: 5,
    },
  )

  worker.on("completed", (job) => {
    console.log(`[${QUEUE_NAMES.SOURCE}] Job ${job.id} completed`)
  })

  worker.on("failed", (job, err) => {
    console.error(`[${QUEUE_NAMES.SOURCE}] Job ${job?.id} failed:`, err.message)
  })

  worker.on("error", (err) => {
    console.error(`[${QUEUE_NAMES.SOURCE}] Worker error:`, err)
  })

  console.log(`🚀 Source worker started, listening on queue: ${QUEUE_NAMES.SOURCE}`)

  // Graceful shutdown
  process.on("SIGINT", async () => {
    console.log("\n⏳ Shutting down source worker...")
    await worker.close()
    console.log("✅ Source worker closed")
    process.exit(0)
  })

  return worker
}
