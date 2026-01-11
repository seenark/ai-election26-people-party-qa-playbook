import { Canonical, Policy, PolicyChunk } from "@repo/surreal"
import { Effect, Array as A, Option, Data } from "effect"

import { AgentService } from "../agents/service"
import { VectorService } from "../vector"

type QARaw = {
  text: string
  source: string
  url: string
  speaker: string
}

type QA = {
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
  ],
  effect: Effect.gen(function* () {
    const agentSvc = yield* AgentService
    const policyChunkRepo = yield* PolicyChunk.Repository.PolicyChunkRepository
    const vectorSvc = yield* VectorService
    const policyRepo = yield* Policy.Repository.PolicyRepository
    const canonicalRepo = yield* Canonical.Repository.CanonicalQARepository

    const searchPolicyForQA = (qa: { question: string; answer: string }) =>
      Effect.gen(function* () {
        const questionVector = yield* vectorSvc.embedText(
          `Question: ${qa.question}\nAnswer: ${qa.answer}`,
        )
        console.log("question vector", questionVector)
        const results = yield* policyChunkRepo.vectorSearch(questionVector, 10)
        return results
      })

    const askForTopic = (data: {
      qa: QA
      qaRaw: QARaw
      existingTopics: string[]
      policiesTopics: string[]
    }) =>
      agentSvc.inferTopic(`Question: ${data.qa.question}\nAnswer: ${data.qa.answer}
        EXISTING TOPICS: ${data.existingTopics.join(", ")}
        POLICIES TOPICS: ${data.policiesTopics.join(", ")}
        `)

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

        const allCanonicalQAs = yield* canonicalRepo.getAll.pipe(
          Effect.tap((d) => Effect.logInfo("all canonical", d)),
        )

        const topicFromLLM = yield* askForTopic({
          qa: {
            question: qa.question,
            answer: qa.answer,
          },
          qaRaw: qa.raw,
          existingTopics: A.map(allCanonicalQAs, (d) => d.topic),
          policiesTopics: policies.map((p) => p.title),
        })

        console.log("topicFromLLM", topicFromLLM)

        const canonicalSameTopic = allCanonicalQAs.filter((d) => d.topic === topicFromLLM.topic)
        const firstCanonicalQA = Option.fromNullable(canonicalSameTopic[0])

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
          return Option.match(firstCanonicalQA, {
            onNone: () => [currentPair],
            onSome: (value) => [...value.qa, currentPair],
          })
        })()
        console.log("all qas", allQAs)

        yield* Option.match(firstCanonicalQA, {
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
                Effect.andThen((d) => {
                  if (d.needsUpdate) return Effect.void
                  return Effect.fail(new NoNeedToUpdate())
                }),
              ),
        })

        const newCanonicalQA = yield* agentSvc.synthesizeCanonical({
          qaPairs: allQAs,
          policies: policies.map((p) => ({
            content: p.markdown,
            title: p.title,
            url: p.url,
          })),
        })

        console.log("new canonical qa", newCanonicalQA)

        const saved = yield* Effect.gen(function* () {
          yield* Option.match(firstCanonicalQA, {
            onNone: () => Effect.void,
            onSome: (value) => canonicalRepo.deleteById(value.id),
          })

          return yield* canonicalRepo
            .create({
              topic: topicFromLLM.topic,
              qa: allQAs,
              ...newCanonicalQA,
            })
            .pipe(Effect.tap((value) => agentSvc.infographicAgent(JSON.stringify(value))))
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
        const qaList = yield* agentSvc.extractQA(qaRaw.text)
        // const qaList = [
        //   {
        //     question: "เชื้อเพลิง",
        //     answer:
        //       "ลดการอุดหนุนเชื้อเพลิงฟอสซิล ทุกประเภท: เพื่อแสดงเจตจำนงที่จะเปลี่ยนผ่านสู่พลังงานหมุนเวียนที่เป็นธรรม",
        //   },
        // ]
        console.log("qa list", qaList)
        return yield* Effect.forEach(qaList.slice(0, 1), (qa) =>
          singleQAWorkflow({ question: qa.question, answer: qa.answer, raw: qaRaw }),
        )
      })

    return {
      addQAWorkflow,
    }
  }),
}) {}
