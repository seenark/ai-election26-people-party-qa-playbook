import { JOB_NAMES, Queues } from "@repo/queues"

await Queues.sourceQueue.add(JOB_NAMES.EXTRACT_QA, {
  sourceId: "source-123",
})

await Queues.qaQueue.add(JOB_NAMES.LINK_POLICIES_AND_CLUSTER, {
  qaPairId: "qa-456",
})
