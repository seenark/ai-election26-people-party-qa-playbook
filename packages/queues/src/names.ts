export const QUEUE_NAMES = {
  SOURCE: "sourceQueue",
  QA: "qaQueue",
  CLUSTER: "clusterQueue",
  INFOGRAPHIC: "infographicQueue",
  NOTIFICATION: "notificationQueue",
}

export type QueueName = (typeof QUEUE_NAMES)[keyof typeof QUEUE_NAMES]

export const JOB_NAMES = {
  EXTRACT_QA: "extract-qa",
  LINK_POLICIES_AND_CLUSTER: "link-policies-and-cluster",
  UPDATE_CANONICAL: "update-canonical",
  GENERATE_INFOGRAPHIC: "generate-infographic",
  CANONICAL_UPDATED: "canonical-updated",
} as const

export type JobName = (typeof JOB_NAMES)[keyof typeof JOB_NAMES]

// Job payload types
export type ExtractQAPayload = {
  sourceId: string
}

export type LinkPoliciesAndClusterPayload = {
  qaPairId: string
}

export type UpdateCanonicalPayload = {
  clusterId: string
}

export type GenerateInfographicPayload = {
  canonicalAnswerId: string
}

export type CanonicalUpdatedPayload = {
  canonicalAnswerId: string
}
