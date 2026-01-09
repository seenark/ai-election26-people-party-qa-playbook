// src/workers/cluster-worker.ts

import { Worker, Job } from "bullmq"

import { connection } from "../connection"
import { JOB_NAMES, QUEUE_NAMES, type UpdateCanonicalPayload } from "../names"

export function startClusterWorker() {
  const worker = new Worker(
    QUEUE_NAMES.CLUSTER,
    async (job: Job<UpdateCanonicalPayload>) => {
      try {
        console.log(`[${QUEUE_NAMES.CLUSTER}] Processing job ${job.id}`)
        console.log(`Job name: ${job.name}`)
        console.log(`Payload:`, job.data)

        // Validate job name
        if (job.name !== JOB_NAMES.UPDATE_CANONICAL) {
          throw new Error(`Unknown job name: ${job.name}`)
        }

        const { clusterId } = job.data
        console.log(`Updating canonical answer for cluster: ${clusterId}`)

        // TODO: Implement business logic here
        // - Fetch cluster from DB
        // - Compute canonical answer
        // - Update DB
        // - Enqueue jobs to infographicQueue and notificationQueue

        await new Promise((resolve) => setTimeout(resolve, 100)) // Simulate work

        return {
          ok: true,
          jobName: job.name,
          data: job.data,
          message: `Successfully updated canonical for cluster ${clusterId}`,
        }
      } catch (error) {
        console.error(`[${QUEUE_NAMES.CLUSTER}] Error processing job ${job.id}:`, error)
        throw error
      }
    },
    {
      connection: connection,
      concurrency: 5,
    },
  )

  worker.on("completed", (job) => {
    console.log(`[${QUEUE_NAMES.CLUSTER}] Job ${job.id} completed`)
  })

  worker.on("failed", (job, err) => {
    console.error(`[${QUEUE_NAMES.CLUSTER}] Job ${job?.id} failed:`, err.message)
  })

  worker.on("error", (err) => {
    console.error(`[${QUEUE_NAMES.CLUSTER}] Worker error:`, err)
  })

  console.log(`🚀 Cluster worker started, listening on queue: ${QUEUE_NAMES.CLUSTER}`)

  // Graceful shutdown
  process.on("SIGINT", async () => {
    console.log("\n⏳ Shutting down cluster worker...")
    await worker.close()
    console.log("✅ Cluster worker closed")
    process.exit(0)
  })

  return worker
}
