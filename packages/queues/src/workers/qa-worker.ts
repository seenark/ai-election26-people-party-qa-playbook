// src/workers/qa-worker.ts

import { Worker, Job } from "bullmq"

import { connection } from "../connection"
import { JOB_NAMES, QUEUE_NAMES, type LinkPoliciesAndClusterPayload } from "../names"

export function startQAWorker() {
  const worker = new Worker(
    QUEUE_NAMES.QA,
    async (job: Job<LinkPoliciesAndClusterPayload>) => {
      try {
        console.log(`[${QUEUE_NAMES.QA}] Processing job ${job.id}`)
        console.log(`Job name: ${job.name}`)
        console.log(`Payload:`, job.data)

        // Validate job name
        if (job.name !== JOB_NAMES.LINK_POLICIES_AND_CLUSTER) {
          throw new Error(`Unknown job name: ${job.name}`)
        }

        const { qaPairId } = job.data
        console.log(`Linking policies and clustering for Q&A pair: ${qaPairId}`)

        // TODO: Implement business logic here
        // - Fetch Q&A pair from DB
        // - Link to policies
        // - Assign to cluster
        // - Enqueue job to clusterQueue

        await new Promise((resolve) => setTimeout(resolve, 100)) // Simulate work

        return {
          ok: true,
          jobName: job.name,
          data: job.data,
          message: `Successfully processed Q&A pair ${qaPairId}`,
        }
      } catch (error) {
        console.error(`[${QUEUE_NAMES.QA}] Error processing job ${job.id}:`, error)
        throw error
      }
    },
    {
      connection: connection,
      concurrency: 10,
    },
  )

  worker.on("completed", (job) => {
    console.log(`[${QUEUE_NAMES.QA}] Job ${job.id} completed`)
  })

  worker.on("failed", (job, err) => {
    console.error(`[${QUEUE_NAMES.QA}] Job ${job?.id} failed:`, err.message)
  })

  worker.on("error", (err) => {
    console.error(`[${QUEUE_NAMES.QA}] Worker error:`, err)
  })

  console.log(`🚀 QA worker started, listening on queue: ${QUEUE_NAMES.QA}`)

  // Graceful shutdown
  process.on("SIGINT", async () => {
    console.log("\n⏳ Shutting down QA worker...")
    await worker.close()
    console.log("✅ QA worker closed")
    process.exit(0)
  })

  return worker
}
