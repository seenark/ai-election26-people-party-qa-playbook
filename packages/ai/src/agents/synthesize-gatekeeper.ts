import { z } from "zod"

export const UpdateGatekeeperSchema = z.object({
  needsUpdate: z
    .boolean()
    .describe("Whether the new Q&A requires updating the existing synthesis."),

  confidenceScore: z
    .number()
    .min(0)
    .max(100)
    .describe("Confidence in needsUpdate decision (0-100)."),

  decisionType: z
    .enum(["no_change", "adds_information", "contradicts_or_risky", "insufficient_context"])
    .describe("Classification of the decision reason."),

  thaiRationale: z.string().describe("Explanation in Thai ONLY. Must be clear and actionable."),

  matchedToExisting: z
    .object({
      isMatch: z
        .boolean()
        .describe("Whether the new Q&A matches an existing topic already covered."),
      matchedArea: z
        .string()
        .nullable()
        .describe(
          "Where it matches in the existing synthesis (e.g., 'canonicalAnswer', 'keyPoints', or a short Thai hint). Null if no match.",
        ),
    })
    .describe("How the new Q&A aligns with existing synthesis."),

  newInformation: z
    .object({
      hasNewFacts: z
        .boolean()
        .describe("Whether it introduces any new facts/claims not already in synthesis."),
      facts: z
        .array(z.string())
        .describe("Thai list of new facts/claims extracted from the new Q&A (empty if none)."),
      hasNewCommitments: z
        .boolean()
        .describe(
          "Whether it introduces new promises/commitments (targets, deadlines, numbers, guarantees).",
        ),
      commitments: z.array(z.string()).describe("Thai list of new commitments (empty if none)."),
    })
    .describe("New content introduced by the new Q&A."),

  riskSignals: z
    .object({
      contradictsPolicy: z.boolean().describe("True if new Q&A conflicts with Thai policy text."),
      contradictsExistingSynthesis: z
        .boolean()
        .describe("True if new Q&A conflicts with existing synthesis."),
      requiresRedLineUpdate: z
        .boolean()
        .describe("True if this creates a new 'must-not-say' rule."),
      riskNotes: z.array(z.string()).describe("Thai notes about risk (empty if none)."),
    })
    .describe("Risk and contradiction detection."),

  suggestedSynthesisUpdates: z
    .object({
      sectionsToUpdate: z
        .array(
          z.enum([
            "canonicalQuestion",
            "canonicalAnswer",
            "persuasiveAnswer",
            "shortAnswer",
            "longAnswer",
            "keyPoints",
            "redLines",
            "what",
            "why",
            "how",
            "policyLinks",
            "contradictionFlags",
          ]),
        )
        .describe("Which sections would likely change if you re-run the Synthesize Agent."),

      minimalPatchHint: z
        .array(z.string())
        .describe(
          "Thai bullet hints for what should be added/changed (empty if needsUpdate=false).",
        ),
    })
    .describe("Actionable guidance to keep token/cost low."),
})

export type UpdateGatekeeperResult = z.infer<typeof UpdateGatekeeperSchema>

export const SYSTEM_PROMPT = `
    You are the Update Gatekeeper Agent for a political party’s internal Q&A truth source.

    You will receive:
    - ONE new Question–Answer pair (English)
    - Related official policy materials (Thai, authoritative)
    - The existing synthesized entry (Thai JSON)

    Your job:
    Decide whether this new Q&A would change the final synthesis.
    Return a structured result following UpdateGatekeeperSchema.

    CRITICAL LANGUAGE RULE (ABSOLUTE):
    - ALL OUTPUT TEXT FIELDS MUST BE IN THAI ONLY
    - Do not output English words/phrases/sentences in any text field
    - Boolean/number/enum values are fine as-is

    STRICT RULES:
    1. Use ONLY the provided inputs. Do NOT use internal or external knowledge.
    2. Do NOT mention or compare opponents.
    3. Policy text is supreme. If new Q&A conflicts with policy, treat as risk/contradiction.
    4. If the new Q&A adds no new information and does not change emphasis/constraints, set needsUpdate=false.
    5. If the new Q&A introduces new facts, numbers, commitments, steps, constraints, or new red lines, set needsUpdate=true.
    6. If you cannot determine due to missing context, set decisionType="insufficient_context" and needsUpdate=true (conservative), with lower confidenceScore.

    Decision guidance:
    - no_change: same meaning, rephrasing, already covered by existing synthesis
    - adds_information: adds new facts/steps/clarifications consistent with policy
    - contradicts_or_risky: conflicts with policy or existing synthesis, or introduces risky claims needing red lines
    - insufficient_context: missing policies or synthesis is too vague to assess

    Be conservative, safety-first, and cost-aware. Provide minimal patch hints.
    `

export function buildUpdateGatekeeperPrompt(input: {
  newPair: { question: string; answer: string } // English
  policies: Array<{ title: string; content: string; url: string }> // Thai
  existingSynthesisJson: string // Thai JSON from PolicySynthesisSchema
}) {
  return `
### INPUTS

NEW Q&A PAIR (ENGLISH):
Question:
${input.newPair.question}

Answer:
${input.newPair.answer}

RELATED OFFICIAL POLICY MATERIALS (THAI – AUTHORITATIVE):
${input.policies
  .map(
    (p, i) => `
Policy ${i + 1}: ${p.title}
URL: ${p.url}
CONTENT:
${p.content}
`,
  )
  .join("\n")}

EXISTING SYNTHESIZED ENTRY (THAI JSON):
${input.existingSynthesisJson}

---

### TASK
Determine whether the NEW Q&A PAIR would change the EXISTING SYNTHESIZED ENTRY.

Rules:
- Output MUST follow UpdateGatekeeperSchema exactly
- Output ALL text fields in THAI ONLY
- If no change is needed, set needsUpdate=false
- If it adds information, introduces new commitments, creates contradictions, or requires red line updates, set needsUpdate=true
- Provide minimal patch hints to reduce future token cost if re-synthesis is needed

Generate the structured JSON now.
`
}
