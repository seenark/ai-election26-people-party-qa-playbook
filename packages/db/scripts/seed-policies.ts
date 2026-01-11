import { ChunkingService, VectorService } from "@repo/ai"
import { Effect } from "effect"

import meta from "../../../policies-meta/meta.json"
import { cleanLinks } from "../src/lib/markdown"
import { PolicyRepository } from "../src/policies/repository"
import { PolicyChunkRepository } from "../src/policy-chunks/repository"
import { Runtime } from "../src/runtime"

const seedPolicy = async (md: { filename: string; url: string }) => {
  console.log(md)
  const slug = md.filename.replace(/\.md$/, "")
  const file = await Bun.file(`./policies/${md.filename}`).text()
  const newFile = cleanLinks(file)
  console.log("file", newFile)

  const data = await Effect.gen(function* () {
    const policyRepo = yield* PolicyRepository
    const policyChunkRepo = yield* PolicyChunkRepository
    const chunkSvc = yield* ChunkingService
    const vectorSvc = yield* VectorService

    const policy = yield* policyRepo
      .upsert({
        slug,
        updates: {
          title: slug,
          markdown: newFile,
          category: null,
          level: "national",
          region: null,
          url: md.url,
          status: "approved",
          created_at: new Date(),
          updated_at: new Date(),
        },
      })
      .pipe(Effect.tapError((error) => Effect.logInfo("error", error)))

    const { count: deletedCount } = yield* policyChunkRepo.deleteManyBySinglePolicyId(policy.id)
    yield* Effect.logInfo(`deleted ${deletedCount} existing chunks`)

    const chunks = chunkSvc.chunkMarkdown(newFile)

    const policyChunkIds = yield* Effect.forEach(chunks, (chunk, i) =>
      vectorSvc.embedText(chunk).pipe(
        Effect.flatMap((embedding) =>
          policyChunkRepo.insertPolicyChunk({
            chunkIndex: i,
            content: chunk,
            embedding: embedding,
            policyId: policy.id,
          }),
        ),
      ),
    )

    return {
      chunks,
      policyChunkIds,
    }
  }).pipe(Runtime.runPromise)

  return data
}

async function main() {
  for (const md of meta.slice(0, 1)) {
    const data = await seedPolicy(md)
    console.log("data", data)
  }
}

await main()
