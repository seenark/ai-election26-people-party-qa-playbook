import { Data, Effect } from "effect"
import * as S from "effect/Schema"
import { RecordId } from "surrealdb"

import { SurrealProvider } from "../surreal-provider"

export type PolicyChunk = {
  id: string
  policy_id: string
  markdown_chunk: string
  chunk_index: number
  embedding: number[]
}

export const POLICY_CHUNK_TABLE_NAME_SCHEMA = S.Literal("policy_chunks").pipe(
  S.brand("POLICY_CHUNK_TABLE_NAME"),
)
export type POLICY_CHUNK_TABLE_NAME = typeof POLICY_CHUNK_TABLE_NAME_SCHEMA.Type
export const POLICY_CHUNK_TABLE_NAME = POLICY_CHUNK_TABLE_NAME_SCHEMA.make("policy_chunks")

export const getPolicyChunkRecordId = (id: string) => new RecordId(POLICY_CHUNK_TABLE_NAME, id)

// Tagged Errors (One per operation)
export class CreatePolicyChunkError extends Data.TaggedError(
  "Repository/PolicyChunk/Create/Error",
)<{
  error: unknown
  data: Omit<PolicyChunk, "id">
}> {}

export class DeleteAllPolicyChunkError extends Data.TaggedError(
  "Repository/PolicyChunk/DeleteAll/Error",
)<{
  error: unknown
}> {}

export class DeletePolicyChunkByIdError extends Data.TaggedError(
  "Repository/PolicyChunk/DeleteById/Error",
)<{
  error: unknown
  data: { id: string }
}> {}

export class DeleteAllPolicyChunksByPolicyIdError extends Data.TaggedError(
  "Repository/PolicyChunk/DeleteAllByPolicyId/Error",
)<{
  error: unknown
  data: { policyId: string }
}> {}

export class UpdatePolicyChunkError extends Data.TaggedError(
  "Repository/PolicyChunk/Update/Error",
)<{
  error: unknown
  data: PolicyChunk
}> {}

export class GetAllPolicyChunksError extends Data.TaggedError(
  "Repository/PolicyChunk/GetAll/Error",
)<{
  error: unknown
}> {}

export class GetPolicyChunkByIdError extends Data.TaggedError(
  "Repository/PolicyChunk/GetById/Error",
)<{
  error: unknown
  data: { id: string }
}> {}

export class GetPolicyChunksByPolicyIdError extends Data.TaggedError(
  "Repository/PolicyChunk/GetByPolicyId/Error",
)<{
  error: unknown
  data: { policy_id: string }
}> {}

export class VectorSearchPolicyChunkError extends Data.TaggedError(
  "Repository/PolicyChunk/VectorSearch/Error",
)<{
  error: unknown
  data: { queryVector: number[] }
}> {}

export class PolicyChunkRepository extends Effect.Service<PolicyChunkRepository>()(
  "Repository/PolicyChunk",
  {
    dependencies: [SurrealProvider.Default],
    effect: Effect.gen(function* () {
      const { db, makeIndexForEmbedding } = yield* SurrealProvider

      console.log("making index of embedding for PolicyChunkRepository")
      yield* makeIndexForEmbedding(
        POLICY_CHUNK_TABLE_NAME,
        "policy_chunk_embedding_idx",
        "embedding",
      ).pipe(
        Effect.catchTag("Provider/Surreal/MakeIndexForEmbedding/Error", (error) =>
          Effect.logWarning("error", error),
        ),
      )

      const create = (data: Omit<PolicyChunk, "id">) => {
        console.log("policy chunk data", data)
        return Effect.tryPromise({
          try: () =>
            db.create<PolicyChunk>(POLICY_CHUNK_TABLE_NAME, {
              id: Bun.randomUUIDv7(),
              ...data,
            }),
          catch: (error) => new CreatePolicyChunkError({ error, data }),
        })
      }

      const deleteAllRecords = Effect.tryPromise({
        try: () => db.delete<PolicyChunk>(POLICY_CHUNK_TABLE_NAME),
        catch: (error) => new DeleteAllPolicyChunkError({ error }),
      })

      const deleteAllByPolicyId = (policyId: string) =>
        Effect.tryPromise({
          try: () =>
            db.query<PolicyChunk[]>(
              `DELETE ${POLICY_CHUNK_TABLE_NAME} WHERE policy_id = $policyId RETURN AFTER;`,
              {
                policyId,
              },
            ),
          catch: (error) => new DeleteAllPolicyChunksByPolicyIdError({ error, data: { policyId } }),
        })

      const deleteById = (id: string) =>
        Effect.tryPromise({
          try: () => db.delete<PolicyChunk>(getPolicyChunkRecordId(id)),
          catch: (error) => new DeletePolicyChunkByIdError({ error, data: { id } }),
        })

      const update = (data: PolicyChunk) =>
        Effect.tryPromise({
          try: () => db.update<PolicyChunk>(getPolicyChunkRecordId(data.id)),
          catch: (error) => new UpdatePolicyChunkError({ error, data }),
        })

      const getAll = Effect.tryPromise({
        try: () => db.select<PolicyChunk>(POLICY_CHUNK_TABLE_NAME),
        catch: (error) => new GetAllPolicyChunksError({ error }),
      })

      const getById = (id: string) =>
        Effect.tryPromise({
          try: () => db.select<PolicyChunk>(getPolicyChunkRecordId(id)),
          catch: (error) => new GetPolicyChunkByIdError({ error, data: { id } }),
        })

      const getByPolicyId = (policy_id: string) =>
        Effect.tryPromise({
          try: () =>
            db.query<PolicyChunk[]>(
              "SELECT * FROM type::table($table) WHERE policy_id = $policy_id",
              { table: POLICY_CHUNK_TABLE_NAME, policy_id },
            ),
          catch: (error) => new GetPolicyChunksByPolicyIdError({ error, data: { policy_id } }),
        })

      const vectorSearch = (queryVector: number[], limit: number) =>
        Effect.tryPromise({
          try: () => {
            const sql = `SELECT id, policy_id, markdown_chunk, chunk_index, vector::distance::knn() AS distance
                FROM policy_chunks
                WHERE embedding <|${limit}, COSINE|> $query_vec
                ORDER BY distance;`
            return db.query<[Omit<PolicyChunk, "embedding">[]]>(sql, { query_vec: queryVector })
          },
          catch: (error) => new VectorSearchPolicyChunkError({ error, data: { queryVector } }),
        }).pipe(Effect.andThen((d) => d[0]))

      return {
        create,
        deleteAllRecords,
        deleteById,
        deleteAllByPolicyId,
        update,
        getAll,
        getById,
        getByPolicyId,
        vectorSearch,
      }
    }),
  },
) {}
