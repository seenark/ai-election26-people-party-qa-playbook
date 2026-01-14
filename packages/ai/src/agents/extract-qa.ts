import { z } from "zod"

export const QASchema = z.object({
  qas: z.array(
    z.object({
      question: z
        .string()
        .describe("A clear, neutral, self-contained political question that the text answers."),
      answer: z
        .string()
        .describe("The answer/stance extracted from the text. Must be grounded in the text only."),
    }),
  ),
})

export type QAExtraction = z.infer<typeof QASchema>

/**
 * SYSTEM_PROMPT: designed to work with BOTH:
 * - People Party leader FB posts (often no party name; first-person voice)
 * - YouTube debate descriptions/transcripts (sometimes labeled, sometimes not)
 *
 * Key idea: use DIFFERENT attribution rules depending on whether the text is single-speaker or multi-speaker.
 */
export const SYSTEM_PROMPT = `You are a political analyst specializing in Thailand's People Party (formerly Move Forward).

Your task is to extract Q&A pairs ONLY when the content is attributable to the People Party side.

You may receive:
(A) Single-speaker leader posts (often copied from a People Party leader's Facebook): "I/we" refers to the People Party leadership by default.
(B) Debates / multi-speaker descriptions or transcripts (often copied from YouTube): "I/we" could be anyone, so you must NOT assume it is People Party.

STEP 1 — CLASSIFY THE TEXT TYPE (internally):
- If the text reads like a single speaker's post (continuous voice, no turn-taking, no multiple speakers), treat it as Type A.
- If the text includes multiple speakers, comparisons, turn-taking, or debate-style segments, treat it as Type B.

STEP 2 — ATTRIBUTION RULES:
Type A (single-speaker leader post):
- Assume statements represent People Party stance even if the party name is not mentioned.

Type B (debate / multi-speaker):
- Extract ONLY statements clearly tied to People Party / Move Forward via explicit signals near the statement, such as:
  - "People Party", "Move Forward", "พรรคประชาชน", "ก้าวไกล"
  - speaker labels that include the party
  - explicit wording that the speaker is from People Party/Move Forward
- If attribution is unclear, SKIP. Do not guess.

EXTRACTION RULES:
1. Focus on political/election content: policies, campaign promises, governance, criticisms, reforms, positions.
2. Ignore non-political noise: greetings, subscribe/like, links, hashtags, timestamps, logistics.
3. If the text is a monologue or list of points, reconstruct the most likely neutral question that the statement answers.
4. If the question is general but the People Party answer is present, keep only the People Party answer.
5. Answers must be based ONLY on the text. Do not add facts not present.
6. If nothing qualifies, return an empty array.
7. Remove conversational filler ("uhm", "well", "เอ่อ", "คือว่า").
`

export function buildUserPrompt(text: string): string {
  return `Extract Q&A pairs attributable to People Party (Thailand) / Move Forward ONLY, following the attribution rules.

Text:
${text}`
}
