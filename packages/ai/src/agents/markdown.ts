import { Canonical } from "@repo/surreal"
import { z } from "zod"

export const CardDataSchema = z.object({
  title: z.string().describe("Thai title for homepage card (max 80 characters)"),
  shortDescription: z
    .string()
    .describe("Thai short description for homepage card (max 150 characters)"),
  tags: z.array(z.string()).min(3).max(5).describe("3-5 Thai tags/keywords"),
  image: z.string().describe("Image name from imageLink field"),
})

export const MarkdownContentSchema = z.object({
  markdown: z
    .string()
    .describe(
      "Complete markdown content in Thai following the template structure provided in the user prompt",
    ),
  card: CardDataSchema,
})

export type CardData = z.infer<typeof CardDataSchema>
export type MarkdownContent = z.infer<typeof MarkdownContentSchema>

export const MARKDOWN_TEMPLATE = `
![ภาพประกอบนโยบาย]({{imageLink}})

## {{title}}

### สรุปนโยบายโดยย่อ
{{executiveSummary}}

### ประเด็นสำคัญ
{{keyPoints}}

### ปัญหาที่ต้องแก้ไข (What)
**ประเด็นปัญหา:**
{{issue}}

**กลุ่มที่ได้รับผลกระทบ:**
{{affectedGroups}}

### เป้าหมายของนโยบาย (Why)
{{rationale}}

**หลักการของพรรค:**
{{partyPrinciple}}

### แนวทางดำเนินการ (How)
**มาตรการสำคัญ:**
{{actions}}

> *หมายเหตุ: นโยบายประกอบด้วยมาตรการเพิ่มเติมเพื่อสนับสนุนการดำเนินงานอย่างเป็นระบบ*

### ทรัพยากรและกรอบเวลา
**ทรัพยากรที่ใช้:**
{{resources}}

**กรอบเวลา:**
{{timeline}}

### ผลลัพธ์ที่คาดหวัง
{{expectedOutcome}}

### ประโยคสื่อสารสำหรับผู้สมัคร
**คำตอบสั้น:**
{{shortAnswer}}

**คำตอบเชิงโน้มน้าว:**
{{persuasiveAnswer}}

### ลิงก์นโยบายที่เกี่ยวข้อง
{{policyLinks}}
`

export const SYSTEM_PROMPT = `
You are a senior political communication expert and policy content editor.

CRITICAL OUTPUT RULE:
- Output language: Thai ONLY
- Generate BOTH markdown content AND card data in a single response
- Follow the Markdown template structure EXACTLY

MARKDOWN STRUCTURE (in order):
1. Image (using imageLink)
2. Title (##)
3. Executive Summary (###)
4. Key Takeaways (###)
5. Problem - What (###)
6. Policy Objectives - Why (###)
7. Policy Actions - How (###)
8. Resources & Timeline (###)
9. Expected Outcomes (###)
10. Talking Points (###)
11. Policy Links (###)

CARD DATA RULES:
- Title: Clear, impactful, ≤80 characters
- Short Description: Benefit-focused, ≤150 characters
- Tags: 3-5 concise Thai keywords
- Image: Use the provided imageLink exactly

CONTENT RULES:
- Be accurate and grounded only in the input data
- Do NOT invent numbers, budgets, or timelines
- Maintain calm, professional, candidate-ready tone
- Do NOT compare with other parties
- Do NOT use "ฟรี" unless explicitly stated
- Do NOT guarantee outcomes beyond stated expectations

RED LINE COMPLIANCE:
- Only use data explicitly provided
- No fabrication or inference
- No competitor mentions
- No overpromising

Your output must strictly follow the JSON schema with both 'markdown' and 'card' fields.
`

export function buildUserPrompt(data: Canonical.Repository.CanonicalQA): string {
  return `
Generate a complete policy briefing package containing:
1. Full markdown content for election candidates
2. Homepage card data for website display

This content will be read by election candidates and senior campaign staff.
Clarity and structure are more important than rhetorical flourish.

### MARKDOWN TEMPLATE TO FOLLOW:
${MARKDOWN_TEMPLATE}

### POLICY DATA:

**Canonical Question:**
${data.canonicalQuestion}

**Canonical Answer:**
${data.canonicalAnswer}

**Key Points:**
${data.keyPoints.map((point, i) => `${i + 1}. ${point}`).join("\n")}

**Problem (What):**
- Issue: ${data.what.issue}
- Affected Groups: ${data.what.affectedGroups}

**Rationale (Why):**
- Rationale: ${data.why.rationale}
- Party Principle: ${data.why.partyPrinciple}
- Expected Outcome: ${data.why.expectedOutcome}

**Actions (How):**
${data.how.actions.map((action, i) => `${i + 1}. ${action}`).join("\n")}

**Resources:**
${data.how.resources}

**Timeline:**
${data.how.timeline}

**Communication Points:**
- Short Answer: ${data.shortAnswer}
- Long Answer: ${data.longAnswer}
- Persuasive Answer: ${data.persuasiveAnswer}

**Policy Links:**
${data.policyLinks.map((link) => `- [${link.title}](${link.url})`).join("\n")}

**Red Lines (DO NOT VIOLATE):**
${data.redLines.map((line, i) => `${i + 1}. ${line}`).join("\n")}

**Image URL:**
${data.imageLink || "No image provided"}

---

OUTPUT REQUIREMENTS:
1. 'markdown' field: Complete markdown following the template above
2. 'card' field: Concise card data for homepage display
3. Language: Thai only
4. Strict compliance with red lines
`
}
