import { createGoogleGenerativeAI, google } from "@ai-sdk/google"
import { Effect } from "effect"

export class ModelsProvider extends Effect.Service<ModelsProvider>()("Provider/Models", {
  effect: Effect.gen(function* () {
    const google = createGoogleGenerativeAI({
      apiKey: Bun.env.GOOGLE_API_KEY,
    })

    const geminiEmbedding = google.embeddingModel("gemini-embedding-001")

    return {
      geminiEmbedding: {
        model: geminiEmbedding,
        providerOptions: {
          google: {
            outputDimensionality: 1024, // optional, number of dimensions for the embedding  for gemini-embedding-001 default is 3072 (it so large)
            taskType: "SEMANTIC_SIMILARITY", // optional, specifies the task type for generating embeddings
          },
        },
      },
    }
  }),
}) {}
