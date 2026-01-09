import { Data, Effect } from "effect"

import { PrismaClientProvider } from "../lib/prisma"

export type PolicyChunkWithDistance = {
  id: string
  policy_id: string
  chunk_index: number
  content: string
  distance: number
}

export class InsertPolicyChunkError extends Data.TaggedError(
  "Repository/PolicyChunk/InsertPolicyChunk/Error",
)<{
  error: unknown
  data: {
    policyId: string
    chunkIndex: number
    content: string
    embedding: number[] // length 768
  }
}> {}

export class FindSimilarPolicyChunksError extends Data.TaggedError(
  "Repository/PolicyChunk/FindSimilarPolicyChunks/Error",
)<{
  error: unknown
  data: {
    embedding: number[]
    limit: number
    maxDistance: number
  }
}> {}

export class DeleteManyBySinglePolicyIdError extends Data.TaggedError(
  "Repository/PolicyChunk/DeleteManyBySinglePolicyId/Error",
)<{
  error: unknown
  data: {
    policyId: string
  }
}> {}

export class PolicyChunkRepository extends Effect.Service<PolicyChunkRepository>()(
  "Repository/PolicyChunk",
  {
    dependencies: [PrismaClientProvider.Default],
    effect: Effect.gen(function* () {
      const { prismaClient } = yield* PrismaClientProvider

      const insertPolicyChunk = (params: {
        policyId: string
        chunkIndex: number
        content: string
        embedding: number[] // length 768
      }) => {
        const id = Bun.randomUUIDv7()
        const { policyId, chunkIndex, content, embedding } = params

        const embeddingLiteral = `[${embedding.join(",")}]`
        return Effect.tryPromise({
          try: () =>
            prismaClient.$executeRawUnsafe(
              `
                INSERT INTO "policy_chunks" ("id", "policy_id", "chunk_index", "content", "embedding", "created_at")
                    VALUES ($1::uuid, $2::uuid, $3::int, $4::text, $5::vector, NOW())
                `,
              id,
              policyId,
              chunkIndex,
              content,
              embeddingLiteral,
            ),
          catch: (error) => new InsertPolicyChunkError({ error, data: params }),
        })
      }

      const findSimilarPolicyChunks = (params: {
        embedding: number[]
        limit?: number
        maxDistance?: number // cosine distance threshold
      }) => {
        const { embedding, limit = 10, maxDistance = 1.0 } = params
        const embeddingLiteral = `[${embedding.join(",")}]`

        return Effect.tryPromise({
          try: () =>
            prismaClient.$queryRawUnsafe<PolicyChunkWithDistance[]>(
              `
                SELECT
                  "id"::text,
                  "policy_id"::text,
                  "chunk_index",
                  "content",
                  ("embedding" <=> $1::vector) AS distance
                FROM "policy_chunks"
                WHERE ("embedding" <=> $1::vector) < $2
                ORDER BY "embedding" <=> $1::vector
                LIMIT $3
                `,
              embeddingLiteral,
              maxDistance,
              limit,
            ),
          catch: (error) =>
            new FindSimilarPolicyChunksError({
              error,
              data: { embedding, limit, maxDistance },
            }),
        })
      }

      const deleteManyBySinglePolicyId = (policyId: string) =>
        Effect.tryPromise({
          try: () =>
            prismaClient.policyChunk.deleteMany({
              where: { policy_id: policyId },
            }),
          catch: (error) =>
            new DeleteManyBySinglePolicyIdError({
              error,
              data: { policyId },
            }),
        })

      return {
        insertPolicyChunk,
        findSimilarPolicyChunks,
        deleteManyBySinglePolicyId,
      }
    }),
  },
) {}
