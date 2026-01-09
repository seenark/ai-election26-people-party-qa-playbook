// src/workers/infographic-worker.ts

import { Worker, Job } from "bullmq"

import { connection } from "../connection"
import { JOB_NAMES, QUEUE_NAMES, type GenerateInfographicPayload } from "../names"

export function startInfographicWorker() {
  const worker = new Worker(
    QUEUE_NAMES.INFOGRAPHIC,
    async (job: Job<GenerateInfographicPayload>) => {
      try {
        console.log(`[${QUEUE_NAMES.INFOGRAPHIC}] Processing job ${job.id}`)
        console.log(`Job name: ${job.name}`)
        console.log(`Payload:`, job.data)

        // Validate job name
        if (job.name !== JOB_NAMES.GENERATE_INFOGRAPHIC) {
          throw new Error(`Unknown job name: ${job.name}`)
        }

        const { canonicalAnswerId } = job.data
        console.log(`Generating infographic for canonical answer: ${canonicalAnswerId}`)

        // TODO: Implement business logic here
        // - Fetch canonical answer from DB
        // - Generate infographic
        // - Save to storage
        // - Update DB with infographic URL

        await new Promise((resolve) => setTimeout(resolve, 100)) // Simulate work

        return {
          ok: true,
          jobName: job.name,
          data: job.data,
          message: `Successfully generated infographic for ${canonicalAnswerId}`,
        }
      } catch (error) {
        console.error(`[${QUEUE_NAMES.INFOGRAPHIC}] Error processing job ${job.id}:`, error)
        throw error
      }
    },
    {
      connection: connection,
      concurrency: 3, // Lower concurrency for resource-intensive tasks
    },
  )

  worker.on("completed", (job) => {
    console.log(`[${QUEUE_NAMES.INFOGRAPHIC}] Job ${job.id} completed`)
  })

  worker.on("failed", (job, err) => {
    console.error(`[${QUEUE_NAMES.INFOGRAPHIC}] Job ${job?.id} failed:`, err.message)
  })

  worker.on("error", (err) => {
    console.error(`[${QUEUE_NAMES.INFOGRAPHIC}] Worker error:`, err)
  })

  console.log(`🚀 Infographic worker started, listening on queue: ${QUEUE_NAMES.INFOGRAPHIC}`)

  // Graceful shutdown
  process.on("SIGINT", async () => {
    console.log("\n⏳ Shutting down infographic worker...")
    await worker.close()
    console.log("✅ Infographic worker closed")
    process.exit(0)
  })

  return worker
}
