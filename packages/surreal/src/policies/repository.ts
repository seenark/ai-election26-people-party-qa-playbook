import { Data, Effect } from "effect"
import * as S from "effect/Schema"
import { RecordId } from "surrealdb"

import { SurrealProvider } from "../surreal-provider"

export type Policy = {
  id: string
  url: string
  markdown: string
  title: string
}

export const POLICY_TABLE_NAME_SCHEMA = S.Literal("policies").pipe(S.brand("POLICY_TABLE_NAME"))
export type POLICY_TABLE_NAME = typeof POLICY_TABLE_NAME_SCHEMA.Type
export const POLICY_TABLE_NAME = POLICY_TABLE_NAME_SCHEMA.make("policies")

export const getPolicyRecordId = (id: string) => new RecordId(POLICY_TABLE_NAME, id)

// Tagged Errors (One per operation)
export class CreatePolicyError extends Data.TaggedError("Repository/Policy/Create/Error")<{
  error: unknown
  data: Omit<Policy, "id">
}> {}

export class DeleteAllPolicyError extends Data.TaggedError("Repository/Policy/DeleteAll/Error")<{
  error: unknown
}> {}

export class DeletePolicyByIdError extends Data.TaggedError("Repository/Policy/DeleteById/Error")<{
  error: unknown
  data: { id: string }
}> {}

export class UpdatePolicyError extends Data.TaggedError("Repository/Policy/Update/Error")<{
  error: unknown
  data: Policy
}> {}

export class GetAllPoliciesError extends Data.TaggedError("Repository/Policy/GetAll/Error")<{
  error: unknown
}> {}

export class GetPolicyByIdError extends Data.TaggedError("Repository/Policy/GetById/Error")<{
  error: unknown
  data: { id: string }
}> {}

export class GetPolicyByTitleError extends Data.TaggedError("Repository/Policy/GetByTitle/Error")<{
  error: unknown
  title: string
}> {}

export class UpsertPolicyError extends Data.TaggedError("Repository/Policy/Upsert/Error")<{
  error: unknown
  data: Policy
}> {}

export class GetPoliciesByMultipleIdsError extends Data.TaggedError(
  "Repository/Policy/GetByMultipleIds/Error",
)<{
  error: unknown
  data: { ids: string[] }
}> {}

export class PolicyRepository extends Effect.Service<PolicyRepository>()("Repository/Policy", {
  dependencies: [SurrealProvider.Default],
  effect: Effect.gen(function* () {
    const { db, makeColumnUnique } = yield* SurrealProvider

    const makeTitleUnique = makeColumnUnique<Policy>(POLICY_TABLE_NAME, "title_idx", "title")

    console.log("making index of column title for PolicyRepository")
    yield* makeTitleUnique.pipe(
      Effect.catchTag("Provider/Surreal/MakeColumnUnique/Error", () =>
        Effect.logWarning("column title already unique"),
      ),
    )

    const create = (data: Omit<Policy, "id">) =>
      Effect.tryPromise({
        try: () =>
          db.create<Policy>(POLICY_TABLE_NAME, {
            id: Bun.randomUUIDv7(),
            ...data,
          }),
        catch: (error) => new CreatePolicyError({ error, data }),
      })

    const deleteAllRecords = Effect.tryPromise({
      try: () => db.delete<Policy>(POLICY_TABLE_NAME),
      catch: (error) => new DeleteAllPolicyError({ error }),
    })

    const deleteById = (id: string) =>
      Effect.tryPromise({
        try: () => db.delete<Policy>(getPolicyRecordId(id)),
        catch: (error) => new DeletePolicyByIdError({ error, data: { id } }),
      })

    const update = (data: Policy) =>
      Effect.tryPromise({
        try: () => db.update<Policy>(getPolicyRecordId(data.id)),
        catch: (error) => new UpdatePolicyError({ error, data }),
      })

    const getAll = Effect.tryPromise({
      try: () => db.select<Policy>(POLICY_TABLE_NAME),
      catch: (error) => new GetAllPoliciesError({ error }),
    })

    const getById = (id: string) =>
      Effect.tryPromise({
        try: () => db.select<Policy>(getPolicyRecordId(id)),
        catch: (error) => new GetPolicyByIdError({ error, data: { id } }),
      })

    const getByMultipleId = (ids: string[]) => {
      if (ids.length === 0) return Effect.succeed([])
      return Effect.tryPromise({
        try: () =>
          db.query<[Policy[]]>(
            `SELECT * FROM ${POLICY_TABLE_NAME} WHERE id IN [${ids.map((id) => id.toString()).join(", ")}];`,
          ),
        catch: (error) => new GetPoliciesByMultipleIdsError({ error, data: { ids } }),
      }).pipe(Effect.andThen((d) => d[0]))
    }

    const getByTitle = (title: string) =>
      Effect.tryPromise({
        try: () =>
          db.query<[Policy[], Policy[]]>(
            `SELECT * FROM ${POLICY_TABLE_NAME} WHERE title = $title LIMIT 1;`,
            {
              title,
            },
          ),
        catch: (error) => new GetPolicyByTitleError({ error, title }),
      }).pipe(
        Effect.tap((d) => Effect.logInfo("select by title", d)),
        Effect.tapError((d) => Effect.logInfo("ERROR select by title", d)),
        Effect.andThen((d) => d[0][0]),
        Effect.andThen(Effect.fromNullable),
      )

    const upsert = (data: Policy) =>
      Effect.tryPromise({
        try: () =>
          db.query<[Policy[], Policy[]]>(
            `
            UPSERT ${POLICY_TABLE_NAME} SET
                url = $url,
                markdown = $markdown,
                title = $title
            WHERE
                title = $title;
            `,
            {
              url: data.url,
              markdown: data.markdown,
              title: data.title,
            },
          ),
        catch: (error) => new UpsertPolicyError({ error, data }),
      }).pipe(
        Effect.tap((d) => Effect.logInfo("upsert", d)),
        Effect.andThen((d) => d[0][0]),
        Effect.andThen(Effect.fromNullable),
      )

    return {
      create,
      deleteAllRecords,
      deleteById,
      update,
      getAll,
      getById,
      getByMultipleId,
      getByTitle,
      upsert,
    }
  }),
}) {}
