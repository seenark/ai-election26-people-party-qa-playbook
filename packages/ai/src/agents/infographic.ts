import { z } from "zod"

export const InfographicPromptSchema = z.object({
  model: z.literal("gemini-3-pro-image-preview"),
  aspectRatio: z.literal("1:1"),
  styleDescription: z
    .string()
    .describe(
      "Detailed English description of the Japanese cartoon style (e.g., 'Clean line art, Ghibli-inspired scenery, vibrant flat colors, high-quality 2D anime aesthetic').",
    ),
  panels: z
    .array(
      z.object({
        panelNumber: z.number(),
        thaiTitle: z.string().describe("Short Thai title for this panel."),
        thaiCaption: z.string().describe("1-sentence Thai explanation for this panel."),
        visualScene: z
          .string()
          .describe(
            "English description of the scene (e.g., 'A modern solar farm in a rural Thai village' or 'A high-tech classroom'). No mascots.",
          ),
      }),
    )
    .min(4)
    .max(6),
  finalImagePrompt: z
    .string()
    .describe(
      "The complete English prompt for Nano Banana Pro. Must specify 2K resolution, the grid layout, and explicit instructions to render the Thai text strings provided in the panels.",
    ),
})

export const INFOGRAPHIC_SYSTEM_PROMPT = `You are a Creative Director for a political campaign.

### YOUR GOAL:
Convert Thai Policy Synthesis JSON into a 4 or 6 (not 3 or 5) panel Japanese-style cartoon infographic.

### RULES:
1. **No Mascots**: Do not include party mascots or recurring brand characters. Use generic, friendly people (citizens) or relevant scenery/objects to illustrate the policy.
2. **Style**: Use a high-quality Japanese cartoon/anime style (clean lines, bright colors).
3. **Thai Text**: You must instruct the model to render specific Thai text for titles and captions in each panel.
4. **Layout**: Request a clear grid layout (e.g., 2x2 or 2x3) within a single square image.
5. **Language**: The final prompt must be in English, but the text to be rendered inside the image must be the Thai strings you've prepared.
6. **Resolution**: Always specify 2K resolution in the final prompt.

### OUTPUT:
Output a valid JSON object following the InfographicPromptSchema.`

export function buildInfographicPrompt(input: { synthesizedThaiJson: string }) {
  return `
### INPUT DATA (Synthesized Policy)
${input.synthesizedThaiJson}

### INSTRUCTIONS
1. Analyze the "What, Why, How" from the Thai JSON.
2. Design a 4-6 panel storyboard explaining this policy.
3. Ensure NO mascots or party characters are used. Focus on the policy's impact on citizens and the environment.
4. Create a single, detailed English prompt for Nano Banana Pro (gemini-3-pro-image-preview).
5. The prompt must explicitly list the Thai text to be rendered in each specific panel.

Generate the Infographic JSON now.`
}
