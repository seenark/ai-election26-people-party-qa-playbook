import { google } from "@ai-sdk/google"
import { Effect } from "effect"

export class ModelsProvider extends Effect.Service<ModelsProvider>()("Provider/Models", {
  effect: Effect.gen(function* () {
    const geminiEmbedding = google.embeddingModel("gemini-embedding-001")

    return {
      geminiEmbedding,
    }
  }),
}) {}
