import { ChunkingService, VectorService } from "@repo/ai"
import { Effect, Option } from "effect"

import meta from "../../../policies-meta/meta.json"
import { cleanLinks } from "../src/markdown"
import { PolicyRepository } from "../src/policies/repository"
import { PolicyChunkRepository } from "../src/policy-chunks/repository"
import { Runtime } from "../src/runtime"

const seedPolicy = async (md: { filename: string; url: string }) => {
  console.log(md)
  const title = md.filename.replace(/\.md$/, "")
  const file = await Bun.file(`../../policies/${md.filename}`).text()
  const newFile = cleanLinks(file)
  console.log("file", newFile)

  const data = await Effect.gen(function* () {
    const policyRepo = yield* PolicyRepository
    const policyChunkRepo = yield* PolicyChunkRepository
    const chunkSvc = yield* ChunkingService
    const vectorSvc = yield* VectorService

    const existingPolicy = yield* policyRepo
      .getByTitle(title)
      .pipe(Effect.map(Option.some), Effect.orElseSucceed(Option.none))

    console.log("existing policy", existingPolicy)

    if (Option.isSome(existingPolicy)) {
      const data = yield* policyChunkRepo.deleteAllByPolicyId(existingPolicy.value.id)
      yield* Effect.logInfo(`deleted existing chunks`, data)
    }

    const policy = yield* policyRepo
      .upsert({
        id: Bun.randomUUIDv7(),
        title: title,
        url: md.url,
        markdown: newFile,
      })
      .pipe(
        Effect.tapError((error) => Effect.logInfo("error", error)),
        Effect.tapErrorTag("Repository/Policy/Upsert/Error", (error) =>
          Effect.logInfo("error", error.data, error.error),
        ),
      )

    const chunks = chunkSvc.chunkMarkdown(newFile)

    const policyChunkIds = yield* Effect.forEach(chunks, (chunk, i) =>
      vectorSvc.embedText(chunk).pipe(
        Effect.flatMap((embedding) =>
          policyChunkRepo.create({
            chunk_index: i,
            markdown_chunk: chunk,
            embedding: embedding,
            policy_id: policy.id,
          }),
        ),
      ),
    )

    return {
      chunks,
      policyChunkIds,
    }
  }).pipe(
    Effect.tapError((error) => Effect.logInfo(error)),
    Runtime.runPromise,
  )

  return data
}

async function main() {
  for (const md of meta.slice(1)) {
    const data = await seedPolicy(md)
    console.log("data", data)
  }
}

await main().then(() => process.exit(0))
