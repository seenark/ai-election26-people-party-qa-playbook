// src/workers/qa-worker.ts

import { NewQAWorkflow } from "@repo/ai"
import { Worker, Job } from "bullmq"
import { Effect } from "effect"

import { connection } from "../connection"
import { JOB_NAMES, QUEUE_NAMES, type QAJob } from "../names"

export function startQAWorker() {
  const worker = new Worker(
    QUEUE_NAMES.QA,
    async (job: Job<QAJob>) => {
      console.log(`[${QUEUE_NAMES.QA}] Processing job ${job.id}`)
      console.log(`Job name: ${job.name}`)
      console.log(`Payload:`, job.data)

      // Validate job name
      if (job.name !== JOB_NAMES.QA) {
        throw new Error(`Unknown job name: ${job.name}`)
      }

      return Effect.gen(function* () {
        const newQASvc = yield* NewQAWorkflow.NewQAWorkflow
        yield* newQASvc.singleQAWorkflow(job.data)
      }).pipe(Effect.provide(NewQAWorkflow.NewQAWorkflow.Default), Effect.runPromise)
    },
    {
      connection: connection,
      concurrency: 1,
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
