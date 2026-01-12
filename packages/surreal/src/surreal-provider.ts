import { Data, Effect } from "effect"
import { Surreal } from "surrealdb"

export class SurrealConnectionError extends Data.TaggedError("Provider/Surreal/Connect/Error")<{
  error: unknown
  data: { url: string; database: string; namespace: string }
}> {}

export class SurrealCloseError extends Data.TaggedError("Provider/Surreal/Close/Error")<{
  error: unknown
}> {}

export class SurrealReadyError extends Data.TaggedError("Provider/Surreal/Ready/Error")<{
  error: unknown
}> {}

export class SurrealMakeIndexForEmbeddingError extends Data.TaggedError(
  "Provider/Surreal/MakeIndexForEmbedding/Error",
)<{
  error: unknown
  data: { table: string; indexName: string; column: string }
}> {}

export class SurrealMakeColumnUniqueError extends Data.TaggedError(
  "Provider/Surreal/MakeColumnUnique/Error",
)<{
  error: unknown
  data: { table: string; indexName: string; column: string }
}> {}

export class SurrealProvider extends Effect.Service<SurrealProvider>()("Provider/Surreal", {
  dependencies: [],
  effect: Effect.gen(function* () {
    const url = `${process.env.SURREAL_URL || "ws://localhost:8888"}/rpc`
    const database = "election-playbook"
    const namespace = "election-playbook"

    const db = new Surreal()

    const connect = Effect.tryPromise({
      try: () =>
        db.connect(url, {
          database,
          namespace,
          auth: {
            username: "root",
            password: "root",
          },
        }),
      catch: (error) =>
        new SurrealConnectionError({
          error,
          data: { url, database, namespace },
        }),
    })

    const close = Effect.tryPromise({
      try: () => db.close(),
      catch: (error) => new SurrealCloseError({ error }),
    })

    const ready = Effect.tryPromise({
      try: () => db.ready,
      catch: (error) => new SurrealReadyError({ error }),
    })

    const makeIndexForEmbedding = <DATA extends Record<string, any>>(
      table: string,
      indexName: string,
      column: keyof DATA,
    ) =>
      Effect.tryPromise({
        try: () =>
          db.query(
            `DEFINE INDEX ${indexName} ON TABLE ${table}
                        FIELDS ${String(column)} HNSW
                        DIMENSION 3072
                        DISTANCE COSINE;`,
          ),
        catch: (error) =>
          new SurrealMakeIndexForEmbeddingError({
            error,
            data: { table, indexName, column: String(column) },
          }),
      })

    const makeColumnUnique = <DATA extends Record<string, any>, TABLE extends string = string>(
      table: TABLE,
      indexName: string,
      column: keyof DATA,
    ) =>
      Effect.tryPromise({
        try: () =>
          db.query(`DEFINE INDEX ${indexName} ON TABLE ${table} COLUMNS ${String(column)} UNIQUE;`),
        catch: (error) =>
          new SurrealMakeColumnUniqueError({
            error,
            data: { table, indexName, column: String(column) },
          }),
      }).pipe(Effect.tapError((error) => Effect.logInfo("error", error.error, error.data)))

    yield* connect
    yield* ready

    return {
      db,
      close,
      makeColumnUnique,
      makeIndexForEmbedding,
    }
  }),
}) {}
