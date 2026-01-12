import { Data, Effect } from "effect"
import * as S from "effect/Schema"
import { RecordId } from "surrealdb"

import { SurrealProvider } from "../surreal-provider"

export type QA = {
  id: string
  raw_text: string
  source: string // youtube, facebook, x
  speaker?: string
  url: string
  question: string
  answer: string
  policy_ids: string[]
}

export type CanonicalQA = {
  id: RecordId<string> & string
  qa: QA[]
  imageLink: string
  embedding: number[]
  canonicalQuestion: string
  canonicalAnswer: string
  persuasiveAnswer: string
  shortAnswer: string
  longAnswer: string
  keyPoints: string[]
  redLines: string[]
  what: {
    issue: string
    affectedGroups: string
  }
  why: {
    rationale: string
    partyPrinciple: string
    expectedOutcome: string
  }
  how: {
    actions: string[]
    timeline: string | null
    resources: string | null
  }
  policyLinks: {
    title: string
    url: string
  }[]
  confidenceScore: number
  contradictionFlags?:
    | {
        issue: string
        conflictingSources: string[]
        severity: "minor" | "major" | "critical"
        guidanceForCandidates: string
      }[]
    | undefined
}

// export type CanonicalQA = {
//   id: string
//   qa: QA[]
//   imageLink: string
//   embedding: number[]
//   canonicalQuestion: string
//   canonicalAnswer: string
//   persuasiveAnswer: string
//   shortAnswer: string
//   longAnswer: string
//   keyPoints: string[]
//   redLines: string[]
//   what: {
//     issue: string
//     affectedGroups: string
//   }
//   why: {
//     rationale: string
//     partyPrinciple: string
//     expectedOutcome: string
//   }
//   how: {
//     actions: string[]
//     timeline: string | null
//     resources: string | null
//   }
//   policyLinks: {
//     title: string
//     url: string
//   }[]
//   confidenceScore: number
//   contradictionFlags?:
//     | {
//         issue: string
//         conflictingSources: string[]
//         severity: "minor" | "major" | "critical"
//         guidanceForCandidates: string
//       }[]
//     | undefined
// }

export const CANONICAL_QA_TABLE_NAME_SCHEMA = S.Literal("Canonical_QAs").pipe(
  S.brand("CANONICAL_QA_TABLE_NAME"),
)
export type CANONICAL_QA_TABLE_NAME = typeof CANONICAL_QA_TABLE_NAME_SCHEMA.Type
export const CANONICAL_QA_TABLE_NAME = CANONICAL_QA_TABLE_NAME_SCHEMA.make("Canonical_QAs")

export const getCanonicalQARecordId = (id: string) => new RecordId(CANONICAL_QA_TABLE_NAME, id)

// Tagged Errors (One per operation)
export class CreateCanonicalQAError extends Data.TaggedError(
  "Repository/CanonicalQA/Create/Error",
)<{
  error: unknown
  data: Omit<CanonicalQA, "id">
}> {}

export class DeleteAllCanonicalQAError extends Data.TaggedError(
  "Repository/CanonicalQA/DeleteAll/Error",
)<{
  error: unknown
}> {}

export class DeleteCanonicalQAByIdError extends Data.TaggedError(
  "Repository/CanonicalQA/DeleteById/Error",
)<{
  error: unknown
  data: { id: string }
}> {}

export class UpdateCanonicalQAError extends Data.TaggedError(
  "Repository/CanonicalQA/Update/Error",
)<{
  error: unknown
  data: CanonicalQA
}> {}

export class GetAllCanonicalQAsError extends Data.TaggedError(
  "Repository/CanonicalQA/GetAll/Error",
)<{
  error: unknown
}> {}

export class GetCanonicalQAByIdError extends Data.TaggedError(
  "Repository/CanonicalQA/GetById/Error",
)<{
  error: unknown
  data: { id: string }
}> {}

export class VectorSearchError extends Data.TaggedError(
  "Repository/CanonicalQA/VectorSearch/Error",
)<{
  error: unknown
  data: { queryVector: number[]; limit: number }
}> {}

export class CanonicalQARepository extends Effect.Service<CanonicalQARepository>()(
  "Repository/CanonicalQA",
  {
    dependencies: [SurrealProvider.Default],
    effect: Effect.gen(function* () {
      const { db, makeIndexForEmbedding } = yield* SurrealProvider

      // yield* makeColumnUnique<CanonicalQA>(CANONICAL_QA_TABLE_NAME, "topic_idx", "topic").pipe(
      //   Effect.catchTag("Provider/Surreal/MakeColumnUnique/Error", (error) =>
      //     Effect.logWarning("error", error),
      //   ),
      // )

      yield* makeIndexForEmbedding<CanonicalQA>(
        CANONICAL_QA_TABLE_NAME,
        "canonical_embedding_idx",
        "embedding",
      ).pipe(
        Effect.catchTag("Provider/Surreal/MakeIndexForEmbedding/Error", (error) =>
          Effect.logWarning("error", error),
        ),
      )

      const create = (data: Omit<CanonicalQA, "id">) =>
        Effect.tryPromise({
          try: () =>
            db.create<CanonicalQA>(CANONICAL_QA_TABLE_NAME, {
              id: getCanonicalQARecordId(Bun.randomUUIDv7()) as unknown as RecordId<string> &
                string,
              ...data,
            }),
          catch: (error) => new CreateCanonicalQAError({ error, data }),
        }).pipe(
          Effect.andThen((d) => d[0]),
          Effect.andThen(Effect.fromNullable),
        )

      const deleteAllRecords = Effect.tryPromise({
        try: () => db.delete<CanonicalQA>(CANONICAL_QA_TABLE_NAME),
        catch: (error) => new DeleteAllCanonicalQAError({ error }),
      })

      const deleteById = (id: string) =>
        Effect.tryPromise({
          try: () => db.delete<CanonicalQA>(getCanonicalQARecordId(id)),
          catch: (error) => new DeleteCanonicalQAByIdError({ error, data: { id } }),
        })

      const update = (data: CanonicalQA) =>
        Effect.tryPromise({
          try: () => db.update<CanonicalQA>(getCanonicalQARecordId(data.id)),
          catch: (error) => new UpdateCanonicalQAError({ error, data }),
        })

      const getAll = Effect.tryPromise({
        try: () => db.select<CanonicalQA>(CANONICAL_QA_TABLE_NAME),
        catch: (error) => new GetAllCanonicalQAsError({ error }),
      })

      const getById = (id: string) =>
        Effect.tryPromise({
          try: () => db.select<CanonicalQA>(getCanonicalQARecordId(id)),
          catch: (error) => new GetCanonicalQAByIdError({ error, data: { id } }),
        })

      const vectorSearch = (queryVector: number[], limit: number = 3) =>
        Effect.tryPromise({
          try: () => {
            const tableName = CANONICAL_QA_TABLE_NAME
            const sql = `SELECT *,vector::distance::knn() AS distance OMIT embedding
                FROM ${tableName}
                WHERE embedding <|${limit}, COSINE|> $query_vec
                ORDER BY distance;`
            return db.query<[Omit<CanonicalQA, "embedding">[]]>(sql, { query_vec: queryVector })
          },
          catch: (error) => new VectorSearchError({ error, data: { queryVector, limit } }),
        }).pipe(
          Effect.tap((d) => Effect.logInfo("vector result", d)),
          Effect.andThen((d) => d[0]),
        )

      return {
        create,
        deleteAllRecords,
        deleteById,
        update,
        getAll,
        getById,
        vectorSearch,
      }
    }),
  },
) {}
