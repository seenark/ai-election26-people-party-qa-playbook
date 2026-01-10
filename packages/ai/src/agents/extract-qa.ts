import { generateText, Output } from "ai"
import { Data, Effect } from "effect"
import z from "zod"

import { ModelsProvider } from "../model"

export const QASchema = z.object({
  qas: z.array(
    z
      .object({
        question: z
          .string()
          .describe(
            "A clear, concise question that the text answers. If the question was implied, reconstruct it to be self-contained.",
          ),
        answer: z
          .string()
          .describe(
            "The complete, factual answer extracted from the text. Maintain the original tone and specific details.",
          ),
      })
      .describe("An array of extracted question and answer pairs."),
  ),
})

export const TopicSchema = z.object({
  topic: z
    .string()
    .describe(
      "The high-level policy category (e.g., Education, Economy, Healthcare, Environment).",
    ),
  confidence: z
    .number()
    .min(0)
    .max(1)
    .describe("A score from 0 to 1 representing how certain you are about this categorization."),
  reasoning: z.string().describe("A brief explanation of why this text belongs to this topic."),
})

export const CanonicalSchema = z.object({
  canonicalAnswer: z
    .string()
    .describe(
      'The final, merged "Gold Standard" answer that is accurate, professional, and easy to understand.',
    ),
  keyPoints: z
    .array(z.string())
    .describe("A list of the most important facts or policy points included in the answer."),
})

export class ExtractQAError extends Data.TaggedError("Error/ExtractQA")<{
  error: unknown
  text: string
}> {}

export class InferTopicError extends Data.TaggedError("Error/InferTopic")<{
  error: unknown
  text: string
}> {}

export class SynthesizeCanonicalError extends Data.TaggedError("Error/SynthesizeCanonical")<{
  error: unknown
  question: string
  answers: string[]
}> {}

export class AgentService extends Effect.Service<AgentService>()("Service/Agent", {
  dependencies: [ModelsProvider.Default],
  effect: Effect.gen(function* () {
    const { gemini2_5Flash } = yield* ModelsProvider

    const extractQA = (text: string) =>
      Effect.tryPromise({
        try: () =>
          generateText({
            model: gemini2_5Flash,
            output: Output.object({ schema: QASchema }),
            system: `You are a policy analyst specializing in election data.
                Your task is to extract Q&A pairs from transcripts.
                - If the text is a monologue or only contains answers, you MUST generate the most likely question that would lead to that answer.
                - Ensure questions are neutral and answers are comprehensive.
                - Do not include conversational filler (e.g., "uhm", "well").`,
            prompt: `Extract all meaningful Q&A pairs from this text:\n\n${text}`,
          }),
        catch: (error) => new ExtractQAError({ error, text }),
      }).pipe(Effect.map((d) => d.output.qas))

    const inferTopic = (text: string) =>
      Effect.tryPromise({
        try: () =>
          generateText({
            model: gemini2_5Flash,
            output: Output.object({ schema: TopicSchema }),
            system:
              "You are an expert political scientist. Categorize the text into standard policy domains.",
            prompt: `Analyze the following text and determine the primary policy topic:\n\n${text}`,
          }),
        catch: (error) => new InferTopicError({ error, text }),
      }).pipe(Effect.andThen((d) => d.output))

    const synthesizeCanonical = (question: string, answers: string[]) =>
      Effect.tryPromise({
        try: () =>
          generateText({
            model: gemini2_5Flash,
            output: Output.object({ schema: CanonicalSchema }),
            system: `You are a senior editor for a government policy database.
                You will be given a single question and several variations of an answer.
                Your goal is to synthesize them into one authoritative version.
                - Eliminate redundancies.
                - If variations contradict, prioritize the most detailed and formal one.
                - Ensure the final answer is grammatically perfect.`,
            prompt: `Question: ${question}\n\nAnswer Variations:\n${answers.map((a, i) => `${i + 1}. ${a}`).join("\n")}`,
          }),
        catch: (error) => new SynthesizeCanonicalError({ error, question, answers }),
      }).pipe(Effect.andThen((d) => d.output))

    return {
      extractQA,
      inferTopic,
      synthesizeCanonical,
    }
  }),
}) {}
