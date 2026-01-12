import { Data, Effect } from "effect"
import * as S from "effect/Schema"
import { StringRecordId } from "surrealdb"

import { SurrealProvider } from "../surreal-provider"

export type Markdown = {
  id: string
  markdown: string
  card: {
    title: string
    shortDescription: string
    tags: string[]
    image: string
  }
  canonicalQAID: string
}

export const MARKDOWN_TABLE_NAME_SCHEMA = S.Literal("markdowns").pipe(
  S.brand("MARKDOWN_TABLE_NAME"),
)
export type MARKDOWN_TABLE_NAME = typeof MARKDOWN_TABLE_NAME_SCHEMA.Type
export const MARKDOWN_TABLE_NAME = MARKDOWN_TABLE_NAME_SCHEMA.make("markdowns")

export const getMarkdownRecordId = (id: string) => new StringRecordId(id)

export class CreateMarkdownError extends Data.TaggedError("Repository/Markdown/Create/Error")<{
  error: unknown
  data: Omit<Markdown, "id">
}> {}

export class DeleteAllMarkdownError extends Data.TaggedError(
  "Repository/Markdown/DeleteAll/Error",
)<{
  error: unknown
}> {}

export class DeleteMarkdownByIdError extends Data.TaggedError(
  "Repository/Markdown/DeleteById/Error",
)<{
  error: unknown
  data: { id: string }
}> {}

export class UpdateMarkdownError extends Data.TaggedError("Repository/Markdown/Update/Error")<{
  error: unknown
  data: Markdown
}> {}

export class GetAllMarkdownsError extends Data.TaggedError("Repository/Markdown/GetAll/Error")<{
  error: unknown
}> {}

export class GetMarkdownByIdError extends Data.TaggedError("Repository/Markdown/GetById/Error")<{
  error: unknown
  data: { id: string }
}> {}

export class MarkdownRepository extends Effect.Service<MarkdownRepository>()(
  "Repository/Markdown",
  {
    dependencies: [SurrealProvider.Default],
    effect: Effect.gen(function* () {
      const { db } = yield* SurrealProvider

      const create = (data: Omit<Markdown, "id">) =>
        Effect.tryPromise({
          try: () =>
            db.create<Markdown>(MARKDOWN_TABLE_NAME, {
              id: Bun.randomUUIDv7(),
              ...data,
            }),
          catch: (error) => new CreateMarkdownError({ error, data }),
        })

      const deleteAllRecords = Effect.tryPromise({
        try: () => db.delete<Markdown>(MARKDOWN_TABLE_NAME),
        catch: (error) => new DeleteAllMarkdownError({ error }),
      })

      const deleteById = (id: string) =>
        Effect.tryPromise({
          try: () => db.delete<Markdown>(getMarkdownRecordId(id)),
          catch: (error) => new DeleteMarkdownByIdError({ error, data: { id } }),
        })

      const update = (data: Markdown) =>
        Effect.tryPromise({
          try: () => db.merge<Markdown>(getMarkdownRecordId(data.id), data),
          catch: (error) => new UpdateMarkdownError({ error, data }),
        })

      const getAll = Effect.tryPromise({
        try: () => db.select<Markdown>(MARKDOWN_TABLE_NAME),
        catch: (error) => new GetAllMarkdownsError({ error }),
      })

      const getById = (id: string) =>
        Effect.tryPromise({
          try: () => db.select<Markdown>(getMarkdownRecordId(id)),
          catch: (error) => new GetMarkdownByIdError({ error, data: { id } }),
        })

      return {
        create,
        deleteAllRecords,
        deleteById,
        update,
        getAll,
        getById,
      }
    }),
  },
) {}
