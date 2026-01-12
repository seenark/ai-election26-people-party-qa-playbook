import type { Canonical } from "@repo/surreal"

import { generateText, Output } from "ai"
import { Data, Duration, Effect, Schedule } from "effect"
import path from "node:path"
import z from "zod"

import { ModelsProvider } from "../model"
import * as CanonicalPrompt from "./canonical-qa"
import * as FindSameCanonicalQA from "./find-same-canonical-qa"
import * as Infographic from "./infographic"
import * as Markdown from "./markdown"
import * as SynthesizeGatekeeper from "./synthesize-gatekeeper"

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
  data: Record<string, any>
}> {}

export class SynthesizeGatekeeperError extends Data.TaggedError("Error/SynthesizeGatekeeper")<{
  error: unknown
  data: {
    newPair: { question: string; answer: string }
    policies: Array<{ title: string; content: string; url: string }>
    existingSynthesisJson: string
  }
}> {}

export class GenerateInfographicPromptError extends Data.TaggedError(
  "Error/GenerateInfographicPrompt",
)<{
  error: unknown
  data: { synthesizedThaiJson: string }
}> {}

export class GenerateInfographicImageError extends Data.TaggedError(
  "Error/GenerateInfographicImage",
)<{
  error: unknown
  data: { infographicPrompt: string }
}> {}

export class SaveInfographicError extends Data.TaggedError("Error/SaveInfographic")<{
  error: unknown
  data: { filePath: string }
}> {}

export class FindSameCanonicalQAError extends Data.TaggedError("Error/FindSameCanonicalQA")<{
  error: unknown
  data: {
    newQuestion: string
    newAnswer?: string | null
    oldCanonicalQAs: Array<{ id: string; canonicalQuestion: string }>
  }
}> {}

export class GenMarkdownError extends Data.TaggedError("Error/GenMarkdown")<{
  error: unknown
  data: { canonicalQA: Canonical.Repository.CanonicalQA }
}> {}

export class AgentService extends Effect.Service<AgentService>()("Service/Agent", {
  dependencies: [ModelsProvider.Default],
  effect: Effect.gen(function* () {
    const { gemini2_5Flash, nanoBanana3Pro } = yield* ModelsProvider

    const retryN = (times: number, duration: Duration.Duration = Duration.seconds(5)) =>
      Schedule.recurs(times).pipe(Schedule.addDelay(() => duration))

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

    // const inferTopic = (text: string) =>
    //   Effect.tryPromise({
    //     try: () =>
    //       generateText({
    //         model: gemini2_5Flash,
    //         output: Output.object({ schema: TopicSchema }),
    //         system:
    //           "You are an expert political scientist. Categorize the text into standard policy domains.",
    //         prompt: `Analyze the following text and determine the primary policy topic:\n\n${text}`,
    //       }),
    //     catch: (error) => new InferTopicError({ error, text }),
    //   }).pipe(Effect.andThen((d) => d.output))

    const synthesizeGatekeeper = (input: {
      newPair: { question: string; answer: string } // English
      policies: Array<{ title: string; content: string; url: string }> // Thai
      existingSynthesisJson: string // Thai JSON from PolicySynthesisSchema
    }) =>
      Effect.tryPromise({
        try: () =>
          generateText({
            model: gemini2_5Flash,
            output: Output.object({ schema: SynthesizeGatekeeper.UpdateGatekeeperSchema }),
            system: SynthesizeGatekeeper.SYSTEM_PROMPT,
            prompt: SynthesizeGatekeeper.buildUpdateGatekeeperPrompt(input),
            temperature: 0,
          }),
        catch: (error) => new SynthesizeGatekeeperError({ error, data: input }),
      }).pipe(Effect.andThen((d) => d.output))

    const synthesizeCanonical = (input: {
      qaPairs: Array<{ question: string; answer: string }>
      policies: Array<{ title: string; content: string; url: string }>
    }) =>
      Effect.tryPromise({
        try: () =>
          generateText({
            model: gemini2_5Flash,
            output: Output.object({ schema: CanonicalPrompt.PolicySynthesisSchema }),
            system: CanonicalPrompt.SYSTEM_PROMPT,
            prompt: CanonicalPrompt.buildPolicySynthesisPrompt({
              qaPairs: input.qaPairs,
              policies: input.policies,
            }),
          }),
        catch: (error) => new SynthesizeCanonicalError({ error, data: input }),
      }).pipe(Effect.andThen((d) => d.output))

    const infographicAgent = (synthesizedThaiJson: string) =>
      Effect.tryPromise({
        try: () =>
          generateText({
            model: gemini2_5Flash,
            output: Output.object({ schema: Infographic.InfographicPromptSchema }),
            system: Infographic.INFOGRAPHIC_SYSTEM_PROMPT,
            prompt: Infographic.buildInfographicPrompt({ synthesizedThaiJson }),
          }),
        catch: (error) =>
          new GenerateInfographicPromptError({ error, data: { synthesizedThaiJson } }),
      }).pipe(
        Effect.andThen((d) => d.output),
        Effect.andThen((d) =>
          Effect.tryPromise({
            try: () =>
              generateText({
                model: nanoBanana3Pro,
                prompt: `Create a picture of ${JSON.stringify(d)}`,
              }),
            catch: (error) =>
              new GenerateInfographicImageError({
                error,
                data: { infographicPrompt: JSON.stringify(d) },
              }),
          }),
        ),
        Effect.andThen((d) => d.files.filter((f) => f.mediaType?.startsWith("image/"))[0]),
        Effect.andThen(Effect.fromNullable),
        Effect.andThen((file) => {
          const extension = file.mediaType?.split("/")[1] || "png"
          const filename = `${Bun.randomUUIDv7()}.${extension}`
          return {
            file: file.uint8Array,
            filename,
            extension,
          }
        }),
      )

    const saveImage = ({
      file,
      filename,
      folder,
    }: {
      file: Uint8Array
      filename: string
      extension: string
      folder: string
    }) => {
      const fullpath = path.join(folder, filename)
      return Effect.tryPromise({
        try: async () => {
          await Bun.write(fullpath, file)
          return {
            fullpath,
            filename,
            folder,
          }
        },
        catch: (error) => new SaveInfographicError({ error, data: { filePath: fullpath } }),
      })
    }

    const findSameCanonicalQA = (input: {
      newQuestion: string
      newAnswer?: string | null
      oldCanonicalQAs: Array<{ id: string; canonicalQuestion: string }>
    }) =>
      Effect.tryPromise({
        try: () =>
          generateText({
            model: gemini2_5Flash,
            output: Output.object({ schema: FindSameCanonicalQA.FindSameCanonicalQASchema }),
            system: FindSameCanonicalQA.SYSTEM_PROMPT,
            prompt: FindSameCanonicalQA.buildUserPrompt(input),
            temperature: 0,
          }),
        catch: (error) => new FindSameCanonicalQAError({ error, data: input }),
      }).pipe(Effect.andThen((d) => d.output))

    const genMarkdown = (data: Canonical.Repository.CanonicalQA) =>
      Effect.tryPromise({
        try: () =>
          generateText({
            model: gemini2_5Flash,
            output: Output.object({ schema: Markdown.MarkdownContentSchema }),
            system: Markdown.SYSTEM_PROMPT,
            prompt: Markdown.buildUserPrompt(data),
          }),
        catch: (error) => new GenMarkdownError({ error, data: { canonicalQA: data } }),
      }).pipe(Effect.andThen((d) => d.output))

    return {
      extractQA,
      // inferTopic,
      synthesizeCanonical,
      synthesizeGatekeeper,
      infographicAgent,
      findSameCanonicalQA,
      saveImage,
      retryN,
      genMarkdown,
    }
  }),
}) {}
