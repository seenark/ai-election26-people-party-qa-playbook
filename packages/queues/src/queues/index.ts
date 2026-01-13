import { Queue } from "bullmq"
import { Effect } from "effect"
import { Data } from "effect"

import { connection } from "../connection"
import { QUEUE_NAMES, type QAJob } from "../names"

export const qaQueue = new Queue<QAJob>(QUEUE_NAMES.QA, { connection })

// export const notificationQueue = new Queue<CanonicalUpdatedPayload>(QUEUE_NAMES.NOTIFICATION, {
//   connection,
// })

export class CloseQAQueueError extends Data.TaggedError("Error/Close/QAQueue")<{
  error: unknown
}> {}
export const closeQAQueue = Effect.tryPromise({
  try: () => qaQueue.close(),
  catch: (error) => new CloseQAQueueError({ error }),
})

// export class CloseNotificationQueueError extends Data.TaggedError("Error/Close/NotificationQueue")<{
//   error: unknown
// }> {}
// export const closeNotificationQueue = Effect.tryPromise({
//   try: () => notificationQueue.close(),
//   catch: (error) => new CloseNotificationQueueError({ error }),
// })

export const closeQueues = () =>
  Effect.all(
    [
      closeQAQueue,
      // closeNotificationQueue,
    ],
    { concurrency: "unbounded" },
  )
