import { Data, Effect, Schema as S } from "effect";
import { SurrealProvider } from "../surreal-provider";
import { RecordId, StringRecordId } from "surrealdb";

export type Markdown = {
    id: string
    canonicalId: string
    md: string
    topic: string,
}

export const MARKDOWN_TABLE_NAME_SCHEMA = S.Literal("markdown").pipe(S.brand("MARKDOWN_TABLE_NAME"))
export type MARKDOWN_TABLE_NAME = typeof MARKDOWN_TABLE_NAME_SCHEMA.Type
export const MARKDOWN_TABLE_NAME = MARKDOWN_TABLE_NAME_SCHEMA.make("markdown")

const getMarkdownRecordId = (id: string) => new StringRecordId(id)

// Errors
export class GetAllMarkdownError extends Data.TaggedError("Repository/Markdown/GetAll/Error")<{
    error: unknown
}> {}

export class GetByIdMarkdownError extends Data.TaggedError("Repository/Markdown/GetAll/Error")<{
    error: unknown
    data: { id: string }
}> {}

// Repository
export class MarkdownRepository extends Effect.Service<MarkdownRepository>()("Repository/Markdown", {
    dependencies: [SurrealProvider.Default],
    effect: Effect.gen(function* () {

        const { db } = yield* SurrealProvider

        const getAll = Effect.tryPromise({
            try: () => db.select<Markdown>(MARKDOWN_TABLE_NAME),
            catch: (error) => new GetAllMarkdownError({ error }),
        })

        const getById = (id: string) =>
            Effect.tryPromise({
                try: () => db.select<Markdown>(getMarkdownRecordId(id)),
                catch: (error) => new GetByIdMarkdownError({ error, data: { id } }),
            })
        return {
            getAll,
            getById
        }
    })
}) {}