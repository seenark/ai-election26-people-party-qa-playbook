import { createGoogleGenerativeAI } from "@ai-sdk/google"
import { Effect } from "effect"

export class ModelsProvider extends Effect.Service<ModelsProvider>()("Provider/Models", {
  dependencies: [],
  effect: Effect.gen(function* () {
    const google = createGoogleGenerativeAI({
      apiKey: Bun.env.GOOGLE_API_KEY,
    })

    const geminiEmbedding = google.embeddingModel("gemini-embedding-001")
    const gemini2_5Flash = google.languageModel("gemini-2.5-flash")
    const gemini3Flash = google.languageModel("gemini-3-flash-preview")
    const gemini3Pro = google.languageModel("gemini-3-pro-preview")

    const nanoBanana2_5Flash = google.languageModel("gemini-2.5-flash-image-preview")
    const nanoBanana3Pro = google.languageModel("gemini-3-pro-image-preview")

    return {
      gemini2_5Flash,
      gemini3Flash,
      gemini3Pro,
      nanoBanana2_5Flash,
      nanoBanana3Pro,
      geminiEmbedding: {
        model: geminiEmbedding,
        providerOptions: {
          google: {
            outputDimensionality: 3072, // optional, number of dimensions for the embedding  for gemini-embedding-001 default is 3072 (it so large)
            taskType: "SEMANTIC_SIMILARITY", // optional, specifies the task type for generating embeddings
          },
        },
      },
    }
  }),
}) {}
