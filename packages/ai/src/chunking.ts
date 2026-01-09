import { Effect } from "effect"

export class ChunkingService extends Effect.Service<ChunkingService>()("Service/Chunking", {
  dependencies: [],
  effect: Effect.gen(function* () {
    const MIN_CHARS = 1200
    const MAX_CHARS = 2400
    const OVERLAP_CHARS = 300

    const splitIntoParagraphs = (text: string) =>
      text
        .split(/\n\n+/)
        .map((p) => p.trim())
        .filter((p) => p.length > 0)

    const shouldFinalize = (current: string, next: string) => {
      // If we don't have anything yet, we can't finalize
      if (current.length === 0) return false

      // Calculate how big the chunk would be if we added the next paragraph
      const estimatedNewSize = current.length + next.length + 2

      // If it exceeds our limit, return true to "cut" the chunk here
      return estimatedNewSize > MAX_CHARS
    }

    const isLargeEnough = (text: string) => text.length >= MIN_CHARS

    const joinParagraphs = (a: string, b: string) => (a ? `${a}\n\n${b}` : b)

    const takeOverlap = (text: string) => text.slice(Math.max(0, text.length - OVERLAP_CHARS))

    const chunkMarkdown = (markdown: string) => {
      const paragraphs = splitIntoParagraphs(markdown)
      const { chunks, current } = paragraphs.reduce(
        (acc, paragraph) => {
          const current = acc.current
          if (shouldFinalize(current, paragraph)) {
            return {
              chunks: [...acc.chunks, current],
              current: `${takeOverlap(current)}\n\n${paragraph}`,
            }
          }
          const combined = joinParagraphs(acc.current, paragraph)

          if (isLargeEnough(combined)) {
            return { chunks: [...acc.chunks, combined], current: takeOverlap(combined) }
          }

          return { ...acc, current: combined }
        },
        { chunks: [] as string[], current: "" },
      )

      const result = current ? [...chunks, current] : chunks
      return result.length > 0 ? result : [markdown.trim()]
    }
    return {
      chunkMarkdown,
    }
  }),
}) {}
