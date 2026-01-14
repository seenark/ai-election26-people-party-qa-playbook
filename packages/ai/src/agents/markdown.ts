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

### 📢 แนวทางการสื่อสาร (Quick Response)
> **การตอบแบบสั้น (Short Answer):**
> {{shortAnswer}}

> **การสื่อสารเชิงโน้มน้าว (Persuasive Message):**
> {{persuasiveAnswer}}

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

### 📂 ที่มาและแหล่งอ้างอิง (Sources)
{{sourceLinks}}

### 🔗 ข้อมูลเพิ่มเติม
{{policyLinks}}
`

export const SYSTEM_PROMPT = `
You are a Senior Campaign Strategist and Debate Coach.

CRITICAL GOAL:
The candidate needs to know "What to say" IMMEDIATELY. The top of the document is the most critical.

OUTPUT RULES:
1. LANGUAGE: Thai only.
2. STRUCTURE: Follow the template exactly. The "Communication Guidelines" (แนวทางการสื่อสาร) MUST appear immediately after the "Tough Questions" (คำถามท้าทาย).
3. MARKDOWN QUALITY: Use proper spacing. Ensure a blank line exists before and after every header (###) and blockquote (>).
4. SOURCES: In the "ที่มาและแหล่งอ้างอิง" section, list the specific platforms (YouTube, Facebook, etc.) and URLs provided in the data.
5. NO INTRO: Start the markdown field directly with the image tag.

CONTENT RULES:
- Use an authoritative, urgent, and strategic tone.
- Do not invent data. If resources or timelines are not provided, state "อยู่ระหว่างการจัดสรร" or "ตามแผนงานพรรค".
- Ensure the "Stunning Question" title is high-impact.

Your output must be a valid JSON object with 'markdown' and 'card' fields.
`

export function buildUserPrompt(data: Canonical.Repository.CanonicalQA): string {
  return `
Generate a policy briefing package for a candidate.

### POLICY DATA:
**Question/Answer:** ${data.canonicalQuestion} | ${data.canonicalAnswer}

**Key Points:**
${data.keyPoints.map((p, i) => `${i + 1}. ${p}`).join("\n")}

**Context:**
- Issue: ${data.what.issue}
- Affected: ${data.what.affectedGroups}
- Outcome: ${data.why.expectedOutcome}

**Execution:**
- Actions: ${data.how.actions.join(", ")}
- Resources: ${data.how.resources}
- Timeline: ${data.how.timeline}

**Messaging:**
- Short: ${data.shortAnswer}
- Persuasive: ${data.persuasiveAnswer}

**Sources to Cite:**
${data.qa.map((q) => `- [${q.source.toUpperCase()}](${q.url})`).join("\n")}

**Links:**
${data.policyLinks.map((l) => `- [${l.title}](${l.url})`).join("\n")}

**Image:** ${data.imageLink}

### MARKDOWN TEMPLATE:
${MARKDOWN_TEMPLATE}

### FINAL INSTRUCTION:
Ensure the 'markdown' field is a single string with correct Thai phrasing and follows the template order exactly.
`
}
