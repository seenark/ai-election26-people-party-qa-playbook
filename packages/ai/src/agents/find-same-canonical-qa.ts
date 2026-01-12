import { z } from "zod"

export const FindSameCanonicalQASchema = z.object({
  decision: z.enum(["MATCH", "NEW"]),
  matchedId: z
    .string()
    .nullable()
    .describe("If decision=MATCH, must be one of the candidate IDs. Else null."),
  matchedIndex: z
    .number()
    .int()
    .min(1)
    .max(3)
    .nullable()
    .describe("1..3 for which candidate matched. Else null."),
  confidence: z.number().min(0).max(100),
  reason: z
    .string()
    .describe("Short reason. Prefer Thai if possible, but keep it short and operational."),
})

export type FindSameCanonicalQA = z.infer<typeof FindSameCanonicalQASchema>

export const SYSTEM_PROMPT = `
You are the "Political Intent Router." Your job is to determine if a new Question/Answer pair belongs to an existing "Canonical Question" group or if it is a "NEW" unique issue.

### CORE TASK:
Compare the [New Q&A] against 3 [Candidate Canonical Questions].
Decide if the new question asks for the EXACT SAME policy intent as one of the candidates.

### DEFINITION OF "SAME INTENT":
Two questions have the same intent ONLY if a candidate can give the SAME disciplined answer to both without changing the core facts, values, or policy commitments.
- MATCH if: They test the same policy trade-off, timeline, or budget commitment.
- NEW if: The new question introduces a different nuance, a different target group (e.g., SMEs vs Large Corp), or a different risk factor.

### STRICT RULES:
1. CONSERVATIVE MATCHING: If you are unsure or if there is a meaningful nuance difference, choose "NEW". It is safer to have two separate records than to incorrectly merge two different political issues.
2. SINGLE CHOICE: You must pick exactly ONE ID from the candidates if you choose "MATCH".
3. IGNORE KEYWORDS: Do not match based on similar words (e.g., "Economy"). Match based on the "Policy Challenge" being presented.
4. LANGUAGE AGNOSTIC: The input may be in Thai or English. Focus on the underlying meaning.

### OUTPUT RULES:
- decision: "MATCH" or "NEW"
- matchedId: Must be the exact ID string from the provided candidates.
- confidence: 0-100 score of how certain you are that the intent is identical.
`

export function buildUserPrompt(input: {
  newQuestion: string
  newAnswer?: string | null
  oldCanonicalQAs: Array<{ id: string; canonicalQuestion: string }>
}) {
  // Ensure we only ever send 3 candidates to keep the decision sharp
  const c = input.oldCanonicalQAs.slice(0, 3)

  return `
### DATA FOR ANALYSIS

NEW QUESTION/ANSWER PAIR:
- Question: "${input.newQuestion}"
- Answer: "${input.newAnswer ?? "No answer provided"}"

EXISTING CANONICAL CANDIDATES:
1. [ID: ${c[0]?.id ?? "N/A"}] -> Question: "${c[0]?.canonicalQuestion ?? "N/A"}"
2. [ID: ${c[1]?.id ?? "N/A"}] -> Question: "${c[1]?.canonicalQuestion ?? "N/A"}"
3. [ID: ${c[2]?.id ?? "N/A"}] -> Question: "${c[2]?.canonicalQuestion ?? "N/A"}"

### INSTRUCTIONS:
1. Analyze the "Policy Intent" of the New Question. Use the Answer to clarify the context if needed.
2. Compare this intent against the 3 Candidates.
3. If the New Question is a rephrasing of a Candidate (same policy goal, same trade-off), return "MATCH" and the corresponding ID.
4. If the New Question introduces a new angle, a different target group, or a different specific problem, return "NEW".
5. If no candidates are provided or all are "N/A", you MUST return "NEW".

Final Decision (MATCH or NEW):
`
}
