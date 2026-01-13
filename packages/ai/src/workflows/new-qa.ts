import type { EmbeddingModelV3Embedding } from "@ai-sdk/provider"

import { S3Service } from "@repo/s3"
import { Canonical, Policy, PolicyChunk, Markdown } from "@repo/surreal"
import { Effect, Array as A, Option, Data } from "effect"

import { AgentService, FindSameCanonicalQAError } from "../agents/service"
import { EmbedTextError, VectorService } from "../vector"

export type QARaw = {
  text: string
  source: string
  url: string
  speaker: string
}

export type QA = {
  question: string
  answer: string
}

export class NoNeedToUpdate extends Data.TaggedError("NoNeedToUpdate") {}

export class NewQAWorkflow extends Effect.Service<NewQAWorkflow>()("Workflow/NewQA", {
  dependencies: [
    AgentService.Default,
    VectorService.Default,
    Policy.Repository.PolicyRepository.Default,
    PolicyChunk.Repository.PolicyChunkRepository.Default,
    Canonical.Repository.CanonicalQARepository.Default,
    Markdown.MarkdownRepository.Default,
    S3Service.Default,
  ],
  effect: Effect.gen(function* () {
    const agentSvc = yield* AgentService
    const policyChunkRepo = yield* PolicyChunk.Repository.PolicyChunkRepository
    const vectorSvc = yield* VectorService
    const policyRepo = yield* Policy.Repository.PolicyRepository
    const canonicalRepo = yield* Canonical.Repository.CanonicalQARepository
    const markdownRepo = yield* Markdown.MarkdownRepository
    const s3Svc = yield* S3Service

    const searchPolicyForQA = (qa: { question: string; answer: string }) =>
      Effect.gen(function* () {
        const questionVector = yield* vectorSvc.embedText(
          `Question: ${qa.question}\nAnswer: ${qa.answer}`,
        )
        console.log("question vector", questionVector)
        const results = yield* policyChunkRepo.vectorSearch(questionVector, 10)
        return results
      })

    // const askForTopic = (data: {
    //   qa: QA
    //   qaRaw: QARaw
    //   existingTopics: string[]
    //   policiesTopics: string[]
    // }) =>
    //   agentSvc.inferTopic(`Question: ${data.qa.question}\nAnswer: ${data.qa.answer}
    //     EXISTING TOPICS: ${data.existingTopics.join(", ")}
    //     POLICIES TOPICS: ${data.policiesTopics.join(", ")}
    //     `)

    const findSameCanonical = (input: {
      question: string
      answer: string
    }): Effect.Effect<
      Option.Option<Omit<Canonical.Repository.CanonicalQA, "embedding">>,
      EmbedTextError | Canonical.Repository.VectorSearchError | FindSameCanonicalQAError,
      never
    > =>
      Effect.gen(function* () {
        const qaEmbedding = yield* vectorSvc.embedText(
          `QUESTION: ${input.question}, ANSWER: ${input.answer}`,
        )

        const top3ExistingCanonical = yield* canonicalRepo.vectorSearch(qaEmbedding, 3)
        console.log("top3 existing", top3ExistingCanonical)
        console.log(
          "ids",
          top3ExistingCanonical.map((d) => d.id.toString()),
        )

        const canonicalQaResult = yield* agentSvc.findSameCanonicalQA({
          newQuestion: `Question: ${input.question}`,
          newAnswer: `Answer:  ${input.answer}`,
          oldCanonicalQAs: top3ExistingCanonical.map((d) => ({
            canonicalQuestion: `Question: ${d.canonicalQuestion} Answer: ${d.longAnswer}`,
            id: d.id.toString(),
          })),
        })

        console.log("old canonical", canonicalQaResult)

        if (canonicalQaResult.decision === "NEW" || canonicalQaResult.matchedId === null)
          return Option.none()

        const mostMatched = top3ExistingCanonical.find((d) => {
          console.log(
            d.id.toString(),
            canonicalQaResult.matchedId,
            d.id.toString() === canonicalQaResult.matchedId,
          )
          return d.id.toString() === canonicalQaResult.matchedId
        })
        console.log("most matched", mostMatched)
        if (!mostMatched) return Option.none()

        return Option.some(mostMatched)
      })

    const singleQAWorkflow = (qa: { question: string; answer: string; raw: QARaw }) =>
      Effect.gen(function* () {
        const policyChunks = yield* searchPolicyForQA(qa)
        console.log("policy chunks", policyChunks)
        const noDuplicatedPolicies = (() => {
          const map = new Map(policyChunks.map((d) => [d.id, d]))
          const set = new Set(policyChunks.map((d) => d.id))
          const noDupPolicies = [...set].map((id) => map.get(id)).filter((d) => !!d)
          return noDupPolicies
        })()
        const policyIds = noDuplicatedPolicies.map((d) => d.policy_id.toString())
        const policies = yield* policyRepo.getByMultipleId(policyIds)
        console.log("qa", qa)
        console.log("policies", policies)

        // const allCanonicalQAs = yield* canonicalRepo.getAll.pipe(
        //   Effect.tap((d) => Effect.logInfo("all canonical", d)),
        // )

        const oldCanonical = yield* findSameCanonical({
          question: qa.question,
          answer: qa.answer,
        }).pipe(Effect.retry(agentSvc.retryN(2)))

        console.log("oldCanonical", oldCanonical)

        // const canonicalSameTopic = allCanonicalQAs.filter((d) => d.topic === topicFromLLM.topic)
        // const firstCanonicalQA = Option.fromNullable(canonicalSameTopic[0])

        const currentPair: Canonical.Repository.QA = {
          question: qa.question,
          answer: qa.answer,
          raw_text: qa.raw.text,
          source: qa.raw.source,
          id: Bun.randomUUIDv7(),
          policy_ids: policyIds,
          url: qa.raw.url,
          speaker: qa.raw.speaker,
        }

        const allQAs = (() => {
          return Option.match(oldCanonical, {
            onNone: () => [currentPair],
            onSome: (value) => [...value.qa, currentPair],
          })
        })()
        console.log("all qas", allQAs)

        yield* Option.match(oldCanonical, {
          onNone: () => Effect.void,
          onSome: (value) =>
            agentSvc
              .synthesizeGatekeeper({
                newPair: {
                  question: currentPair.question,
                  answer: currentPair.answer,
                },
                existingSynthesisJson: JSON.stringify(value),
                policies: policies.map((p) => ({
                  content: p.markdown,
                  title: p.title,
                  url: p.url,
                })),
              })
              .pipe(
                Effect.retry(agentSvc.retryN(2)),
                Effect.tap((d) => Effect.logInfo("need update?", d)),
                // TODO: send msg to discord or line show this message qa is no need to update
                Effect.andThen((d) => {
                  if (d.needsUpdate) return Effect.void
                  return Effect.fail(new NoNeedToUpdate())
                }),
              ),
        })

        const newCanonicalQA = yield* agentSvc
          .synthesizeCanonical({
            qaPairs: allQAs,
            policies: policies.map((p) => ({
              content: p.markdown,
              title: p.title,
              url: p.url,
            })),
          })
          .pipe(Effect.retry(agentSvc.retryN(2)))

        console.log("new canonical qa", newCanonicalQA)

        yield* Effect.gen(function* () {
          yield* Option.match(oldCanonical, {
            onNone: () => Effect.void,
            onSome: (value) => canonicalRepo.deleteById(value.id),
          })

          const embedding: EmbeddingModelV3Embedding = yield* vectorSvc
            .embedText(
              `QUESTION: ${newCanonicalQA.canonicalQuestion}, ANSWER: ${newCanonicalQA.longAnswer}`,
            )
            .pipe(Effect.retry(agentSvc.retryN(2)))

          const image: {
            file: Uint8Array<ArrayBufferLike>
            filename: string
            extension: string
          } = yield* agentSvc
            .infographicAgent(JSON.stringify(newCanonicalQA))
            .pipe(Effect.retry(agentSvc.retryN(2)))
          // const filePath = yield* agentSvc.saveImage({
          //   ...image,
          //   folder: "./images/",
          // })
          const saveSuccessCount = yield* s3Svc.write(image.filename, image.file)

          const saved: Canonical.Repository.CanonicalQA = yield* canonicalRepo.create({
            embedding: embedding,
            qa: allQAs,
            ...newCanonicalQA,
            imageLink: `${Bun.env.S3_URL}/${Bun.env.S3_BUCKET_NAME}/${image.filename}`,
          })

          const markdown = yield* agentSvc.genMarkdown(saved)
          console.log("markdown", markdown)

          const markdownCreated = yield* markdownRepo.create({
            ...markdown,
            canonicalQAID: saved.id,
          })
          console.log("markdownCreated", markdownCreated)

          return yield* Effect.void
          // .pipe(Effect.tap((value) => agentSvc.infographicAgent(JSON.stringify(value))))
        })

        return yield* Effect.void
      }).pipe(
        Effect.tapErrorTag("NoNeedToUpdate", () =>
          Effect.logInfo("no need to update for this question", qa),
        ),
        Effect.catchTag("NoNeedToUpdate", () => Effect.void),
      )

    const addQAWorkflow = (qaRaw: QARaw) =>
      Effect.gen(function* () {
        console.log("qa raw", qaRaw)
        const qaList = yield* agentSvc.extractQA(qaRaw.text).pipe(Effect.retry(agentSvc.retryN(2)))
        // const qaList = [
        //   {
        //     question: "เชื้อเพลิง",
        //     answer:
        //       "ลดการอุดหนุนเชื้อเพลิงฟอสซิล ทุกประเภท: เพื่อแสดงเจตจำนงที่จะเปลี่ยนผ่านสู่พลังงานหมุนเวียนที่เป็นธรรม",
        //   },
        // ]
        // TODO: send msg to discord show this text can split into many qa what qa are there in the list
        console.log("qa list", qaList)
        return yield* Effect.forEach(qaList.slice(0, 1), (qa) =>
          singleQAWorkflow({ question: qa.question, answer: qa.answer, raw: qaRaw }),
        )
      })

    return {
      addQAWorkflow,
      singleQAWorkflow,
    }
  }),
}) {}
