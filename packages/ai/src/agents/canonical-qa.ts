import { z } from "zod"

export type PolicySynthesis = z.infer<typeof PolicySynthesisSchema>
export const PolicySynthesisSchema = z.object({
  canonicalQuestion: z
    .string()
    .describe("Standardized version of the question. OUTPUT MUST BE IN THAI."),

  canonicalAnswer: z
    .string()
    .describe("Neutral, factual, authoritative answer. OUTPUT MUST BE IN THAI."),

  persuasiveAnswer: z
    .string()
    .describe("Persuasive, values-based campaign answer. OUTPUT MUST BE IN THAI."),

  shortAnswer: z.string().describe("One-sentence soundbite. OUTPUT MUST BE IN THAI."),

  longAnswer: z.string().describe("Detailed multi-paragraph explanation. OUTPUT MUST BE IN THAI."),

  keyPoints: z
    .array(z.string())
    .min(3)
    .max(7)
    .describe("Key talking points list. OUTPUT MUST BE IN THAI."),

  redLines: z
    .array(z.string())
    .min(1)
    .describe("Things candidates MUST NOT say. OUTPUT MUST BE IN THAI."),

  what: z.object({
    issue: z.string().describe("National problem definition. OUTPUT MUST BE IN THAI."),
    affectedGroups: z.string().describe("Who is affected by the issue. OUTPUT MUST BE IN THAI."),
  }),

  why: z.object({
    rationale: z.string().describe("Why this issue matters now. OUTPUT MUST BE IN THAI."),
    partyPrinciple: z.string().describe("Party values guiding the policy. OUTPUT MUST BE IN THAI."),
    expectedOutcome: z
      .string()
      .describe("Positive outcomes if implemented. OUTPUT MUST BE IN THAI."),
  }),

  how: z.object({
    actions: z
      .array(z.string())
      .min(2)
      .describe("Concrete policy actions. OUTPUT MUST BE IN THAI."),

    timeline: z.string().nullable().describe("Implementation timeframe if stated, otherwise null."),

    resources: z.string().nullable().describe("Funding or resources if stated, otherwise null."),
  }),

  policyLinks: z.array(
    z.object({
      title: z.string().describe("Policy title (Thai if source is Thai)."),
      url: z.string().url(),
    }),
  ),

  contradictionFlags: z
    .array(
      z.object({
        issue: z.string().describe("Contradicted detail. OUTPUT MUST BE IN THAI."),
        conflictingSources: z
          .array(z.string())
          .describe("Pair references such as 'Pair 2 vs Pair 5'."),
        severity: z.enum(["minor", "major", "critical"]),
        guidanceForCandidates: z
          .string()
          .describe("How candidates should respond. OUTPUT MUST BE IN THAI."),
      }),
    )
    .optional(),

  confidenceScore: z
    .number()
    .min(0)
    .max(100)
    .describe("How you confidence about your result (0-100)"),
})

export const SYSTEM_PROMPT = `You are the Chief Policy Synthesis Agent for a political party.

Your task is to synthesize multiple Question–Answer pairs (in English)
together with official policy documents (written in Thai)
into ONE structured internal reference for candidates.

### CRITICAL LANGUAGE RULE (ABSOLUTE):
- ALL OUTPUT TEXT MUST BE IN THAI
- DO NOT output English words, phrases, or sentences
- Even if the input question/answers are in English, translate and synthesize everything into Thai

### STRICT RULES (DO NOT VIOLATE):
1. Use ONLY the provided materials. Do NOT use internal or external knowledge.
2. Do NOT mention, compare, or refer to opponents.
3. Official policy documents override all Q&A answers.
4. Do NOT infer or guess timelines, budgets, or guarantees.
   - If missing, set the field to null.
5. Detect and flag contradictions across Q&A pairs.
6. Red Lines must clearly state what candidates MUST NOT say.

### TONE REQUIREMENTS:
- Canonical Answer: neutral, factual, disciplined
- Persuasive Answer: values-based, motivating, campaign-ready
- What / Why / How: derive ONLY from Thai policy text

If information is unclear or missing, prioritize safety and accuracy over completeness.`

export function buildPolicySynthesisPrompt(input: {
  qaPairs: Array<{ question: string; answer: string }> // English
  policies: Array<{ title: string; content: string; url: string }> // Thai
}) {
  return `
### INPUT DATA

RAW QUESTION–ANSWER PAIRS (ENGLISH):
${input.qaPairs
  .map(
    (qa, i) => `
Pair ${i + 1}
Question:
${qa.question}

Answer:
${qa.answer}
`,
  )
  .join("\n")}

OFFICIAL POLICY DOCUMENTS (THAI – AUTHORITATIVE):
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

---

### TASK:
Synthesize all materials into ONE structured output
that conforms EXACTLY to PolicySynthesisSchema.

### VERY IMPORTANT:
- OUTPUT EVERYTHING IN THAI ONLY
- Normalize all question phrasings into ONE Canonical Question (Thai)
- Synthesize all answers into:
  - Canonical Answer
  - Persuasive Answer
  - Short Answer
  - Long Answer
- Detect contradictions across answers and reference them by "Pair X"
- Extract What / Why / How ONLY from Thai policy documents
- If timeline or resources are not explicitly stated, set them to null
- Create Red Lines to protect candidates from risky statements
- Do NOT mention opponents
- Do NOT invent data

Generate the final structured JSON now.
`
}
