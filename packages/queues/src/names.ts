import { NewQAWorkflow } from "@repo/ai"
export const QUEUE_NAMES = {
  QA: "qaQueue",
  NOTIFICATION: "notificationQueue",
}

export type QueueName = (typeof QUEUE_NAMES)[keyof typeof QUEUE_NAMES]

export const JOB_NAMES = {
  QA: "QA",
} as const

export type JobName = (typeof JOB_NAMES)[keyof typeof JOB_NAMES]

// Job payload types

export type QAJob = NewQAWorkflow.QA & {
  raw: NewQAWorkflow.QARaw
}
