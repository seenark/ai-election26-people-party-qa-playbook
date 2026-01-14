import cors from "@elysiajs/cors"
import openapi from "@elysiajs/openapi"
import { Agents } from "@repo/ai"
import { Queues, JOB_NAMES } from "@repo/queues"
import { Data, Effect } from "effect"
import { Elysia, t } from "elysia"

export class AddBulkToQueueError extends Data.TaggedError("API/Queue/AddBulk/Error")<{
  error: unknown
}> {}

const app = new Elysia()
  .use(cors())
  .use(
    openapi({
      path: "/docs",
    }),
  )
  .post(
    "/new-source",
    async ({ body }) => {
      return await Effect.gen(function* () {
        const agentSvc = yield* Agents.AgentService
        const qaList = yield* agentSvc.extractQA(body.text).pipe(Effect.retry(agentSvc.retryN(2)))
        console.log("qa list", qaList)
        // sent each qa to queue
        yield* Effect.tryPromise({
          try: () =>
            Queues.qaQueue.addBulk(
              qaList.map((d) => ({
                name: JOB_NAMES.QA,
                data: {
                  answer: d.answer,
                  question: d.question,
                  raw: body,
                },
                opts: {
                  removeOnComplete: true,
                  removeOnFail: 1000,
                },
              })),
            ),
          catch: (error) => new AddBulkToQueueError({ error }),
        })
        return qaList
      }).pipe(Effect.provide(Agents.AgentService.Default), Effect.runPromise)
    },
    {
      body: t.Object({
        source: t.String(),
        text: t.String(),
        url: t.String(),
        speaker: t.String(),
      }),
    },
  )
  .get("/", () => "Hello Elysia")
  .listen(3001)

console.log(`
    ___   ___  ____
   / _ | / _ \\/  _/
  / __ |/ ___// /
 /_/ |_/_/  /___/
    `)
console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`)
