import cors from "@elysiajs/cors"
import openapi from "@elysiajs/openapi"
import { Agents } from "@repo/ai"
import { Effect } from "effect"
import { Elysia, t } from "elysia"

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
      await Effect.gen(function* () {
        const agentSvc = yield* Agents.AgentService
        const qaList = yield* agentSvc.extractQA(body.text).pipe(Effect.retry(agentSvc.retryN(2)))
        // sent each qa to queue
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

console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`)
