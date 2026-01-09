// src/workers/notification-worker.ts

import { Worker, Job } from "bullmq"

import { connection } from "../connection"
import { JOB_NAMES, QUEUE_NAMES, type CanonicalUpdatedPayload } from "../names"

export function startNotificationWorker() {
  const worker = new Worker(
    QUEUE_NAMES.NOTIFICATION,
    async (job: Job<CanonicalUpdatedPayload>) => {
      try {
        console.log(`[${QUEUE_NAMES.NOTIFICATION}] Processing job ${job.id}`)
        console.log(`Job name: ${job.name}`)
        console.log(`Payload:`, job.data)

        // Validate job name
        if (job.name !== JOB_NAMES.CANONICAL_UPDATED) {
          throw new Error(`Unknown job name: ${job.name}`)
        }

        const { canonicalAnswerId } = job.data
        console.log(`Sending notification for canonical answer update: ${canonicalAnswerId}`)

        // TODO: Implement business logic here
        // - Fetch canonical answer from DB
        // - Send notifications (email, webhook, etc.)
        // - Log notification sent

        await new Promise((resolve) => setTimeout(resolve, 100)) // Simulate work

        return {
          ok: true,
          jobName: job.name,
          data: job.data,
          message: `Successfully sent notification for ${canonicalAnswerId}`,
        }
      } catch (error) {
        console.error(`[${QUEUE_NAMES.NOTIFICATION}] Error processing job ${job.id}:`, error)
        throw error
      }
    },
    {
      connection: connection,
      concurrency: 10,
    },
  )

  worker.on("completed", (job) => {
    console.log(`[${QUEUE_NAMES.NOTIFICATION}] Job ${job.id} completed`)
  })

  worker.on("failed", (job, err) => {
    console.error(`[${QUEUE_NAMES.NOTIFICATION}] Job ${job?.id} failed:`, err.message)
  })

  worker.on("error", (err) => {
    console.error(`[${QUEUE_NAMES.NOTIFICATION}] Worker error:`, err)
  })

  console.log(`🚀 Notification worker started, listening on queue: ${QUEUE_NAMES.NOTIFICATION}`)

  // Graceful shutdown
  process.on("SIGINT", async () => {
    console.log("\n⏳ Shutting down notification worker...")
    await worker.close()
    console.log("✅ Notification worker closed")
    process.exit(0)
  })

  return worker
}
