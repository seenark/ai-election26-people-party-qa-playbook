import cors from "@elysiajs/cors"
import openapi from "@elysiajs/openapi"
import { Elysia } from "elysia"

const app = new Elysia()
  .use(cors())
  .use(
    openapi({
      path: "/docs",
    }),
  )
  .post("/new-source", () => {})
  .get("/", () => "Hello Elysia")
  .listen(3001)

console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`)
