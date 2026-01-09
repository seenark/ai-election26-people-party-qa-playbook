import { embed } from "ai"
import { Data, Effect } from "effect"

import { ModelsProvider } from "./model"

export class EmbedTextError extends Data.TaggedError("EmbedText/Error")<{
  error: unknown
  text: string
}> {}

export class VectorService extends Effect.Service<VectorService>()("Service/Vector", {
  dependencies: [ModelsProvider.Default],
  effect: Effect.gen(function* () {
    const { geminiEmbedding } = yield* ModelsProvider
    const embedText = (text: string) =>
      Effect.tryPromise({
        try: () =>
          embed({
            model: geminiEmbedding,
            value: text,
          }),
        catch: (error) => new EmbedTextError({ error, text }),
      }).pipe(Effect.map((d) => d.embedding))
    return {
      embedText,
    }
  }),
}) {}
