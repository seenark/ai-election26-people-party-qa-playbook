import { Queue } from "bullmq"
import { Effect } from "effect"
import { Data } from "effect"

import { connection } from "../connection"
import {
  QUEUE_NAMES,
  type CanonicalUpdatedPayload,
  type ExtractQAPayload,
  type GenerateInfographicPayload,
  type LinkPoliciesAndClusterPayload,
  type UpdateCanonicalPayload,
} from "../names"

export const sourceQueue = new Queue<ExtractQAPayload>(QUEUE_NAMES.SOURCE, { connection })

export const qaQueue = new Queue<LinkPoliciesAndClusterPayload>(QUEUE_NAMES.QA, { connection })

export const clusterQueue = new Queue<UpdateCanonicalPayload>(QUEUE_NAMES.CLUSTER, { connection })

export const infographicQueue = new Queue<GenerateInfographicPayload>(QUEUE_NAMES.INFOGRAPHIC, {
  connection,
})

export const notificationQueue = new Queue<CanonicalUpdatedPayload>(QUEUE_NAMES.NOTIFICATION, {
  connection,
})

export class CloseSourceQueueError extends Data.TaggedError("Error/Close/SourceQueue")<{
  error: unknown
}> {}
export const closeSourceQueue = Effect.tryPromise({
  try: () => sourceQueue.close(),
  catch: (error) => new CloseSourceQueueError({ error }),
})

export class CloseQAQueueError extends Data.TaggedError("Error/Close/QAQueue")<{
  error: unknown
}> {}
export const closeQAQueue = Effect.tryPromise({
  try: () => qaQueue.close(),
  catch: (error) => new CloseQAQueueError({ error }),
})

export class CloseClusterQueueError extends Data.TaggedError("Error/Close/ClusterQueue")<{
  error: unknown
}> {}
export const closeClusterQueue = Effect.tryPromise({
  try: () => clusterQueue.close(),
  catch: (error) => new CloseClusterQueueError({ error }),
})

export class CloseInfographicQueueError extends Data.TaggedError("Error/Close/InfographicQueue")<{
  error: unknown
}> {}
export const closeInfographicQueue = Effect.tryPromise({
  try: () => infographicQueue.close(),
  catch: (error) => new CloseInfographicQueueError({ error }),
})

export class CloseNotificationQueueError extends Data.TaggedError("Error/Close/NotificationQueue")<{
  error: unknown
}> {}
export const closeNotificationQueue = Effect.tryPromise({
  try: () => notificationQueue.close(),
  catch: (error) => new CloseNotificationQueueError({ error }),
})

export const closeQueues = () =>
  Effect.all(
    [
      closeSourceQueue,
      closeQAQueue,
      closeClusterQueue,
      closeInfographicQueue,
      closeNotificationQueue,
    ],
    { concurrency: "unbounded" },
  )
