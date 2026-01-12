import { Canonical } from "@repo/surreal"
import { z } from "zod"

export const CardDataSchema = z.object({
  title: z
    .string()
    .describe(
      "A stunning, provocative question in Thai that forces the candidate to read (max 80 characters)",
    ),
  shortDescription: z
    .string()
    .describe("A brief Thai summary of the solution to the stunning question (max 150 characters)"),
  tags: z
    .array(z.string())
    .min(3)
    .max(4)
    .describe("3-4 tough, realistic questions in Thai that voters or media might ask"),
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

## {{stunningQuestionTitle}}

### ❓ คำถามท้าทายที่ต้องเตรียมรับมือ
> *คำถามสำคัญที่ประชาชนและสื่อมวลชนอาจถามคุณ:*
- {{questionTag1}}
- {{questionTag2}}
- {{questionTag3}}
- {{questionTag4}}

---

### 💡 สรุปคำตอบเชิงกลยุทธ์
{{executiveSummary}}

### 🎯 ประเด็นสำคัญที่ต้องสื่อสาร
{{keyPoints}}

### ⚠️ วิกฤตและปัญหาที่ต้องเร่งแก้ไข (What)
**สถานการณ์ปัจจุบัน:**
{{issue}}

### 🚀 ผลลัพธ์ที่คาดหวัง (Why)
{{expectedOutcome}}

**กลุ่มที่ได้รับผลกระทบ:**
{{affectedGroups}}

### 🛠 แนวทางและมาตรการของพรรค (How)
**มาตรการหลัก:**
{{actions}}

### ⏳ งบประมาณและกรอบเวลา
**ทรัพยากรและงบประมาณ:**
{{resources}}

**กรอบเวลาดำเนินการ:**
{{timeline}}

### 📢 แนวทางการสื่อสาร
> **การตอบแบบสั้น (Short Answer):**
> {{shortAnswer}}

> **การสื่อสารเชิงโน้มน้าว (Persuasive Message):**
> {{persuasiveAnswer}}

### 🔗 ข้อมูลเพิ่มเติมและอ้างอิง
{{policyLinks}}
`

export const SYSTEM_PROMPT = `
You are a Senior Campaign Strategist and Debate Coach for a major political party.

CRITICAL GOAL:
Your job is to prepare the candidate for high-pressure media interviews and voter town halls. The content must be "Candidate-Ready" and strategic.

OUTPUT RULES:
1. LANGUAGE: ALL output must be in Thai.
2. TITLE: The title must be a "Stunning Question." It should be provocative, urgent, or a "hard truth" that makes the candidate realize they need to be prepared.
3. TAGS AS TOUGH QUESTIONS: Generate 3-4 realistic, difficult questions that voters or journalists would actually ask. These must be used as 'tags' in the JSON and also listed at the top of the Markdown.
4. SECTION HEADING: Use "แนวทางการสื่อสาร" for the messaging section.
5. NO DISCLAIMERS: Do not include any footnotes, "additional measures" notes, or disclaimers.
6. IMAGE: Use the provided imageLink exactly as a Markdown image at the very top.
7. MARKDOWN STRUCTURE: Follow the template exactly in this order:
   - Image
   - Stunning Question Title
   - Tough Questions Section (Tags)
   - Strategic Summary
   - Key Points
   - Problem (What)
   - Expected Outcomes (Why)
   - Policy Actions (How)
   - Resources & Timeline
   - Communication Guidelines
   - Policy Links

CARD DATA RULES:
- Title: A stunning question, ≤80 characters
- Short Description: Solution-focused summary, ≤150 characters
- Tags: 3-4 tough questions voters/media might ask
- Image: Use the provided imageLink exactly

CONTENT RULES:
- Be accurate and grounded only in the input data
- Do NOT invent numbers, budgets, or timelines
- Maintain strategic, authoritative, and urgent tone
- Do NOT compare with other parties
- Do NOT use "ฟรี" unless explicitly stated
- Do NOT guarantee outcomes beyond stated expectations

RED LINE COMPLIANCE:
- Only use data explicitly provided
- No fabrication or inference
- No competitor mentions
- No overpromising

TONE:
Strategic, authoritative, and urgent. Focus on "Winning the Argument" while staying strictly grounded in the provided policy facts.

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

**Image:**
${data.imageLink || "No image provided"}

---

OUTPUT REQUIREMENTS:
1. 'markdown' field: Complete markdown following the template above
2. 'card' field: Must include a stunning question as title and tough questions as tags
3. Language: Thai only
4. Strict compliance with red lines
5. The "Tough Questions" section must appear at the top of the markdown, right after the title
`
}
