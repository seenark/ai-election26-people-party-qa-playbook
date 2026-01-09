import { PrismaPg } from "@prisma/adapter-pg"
import { Data, Effect } from "effect"

import { PrismaClient } from "../../generated/prisma/client"

export class PrismaDisconnectError extends Data.TaggedError(
  "Provider/PrismaClient/Disconnect/Error",
)<{
  error: unknown
}> {}

export class PrismaClientProvider extends Effect.Service<PrismaClientProvider>()(
  "Provider/PrismaClient",
  {
    effect: Effect.gen(function* () {
      const connectionString = Bun.env.DATABASE_URL
      console.log("connection string", connectionString)

      const adapter = new PrismaPg({ connectionString })

      const prismaClient = new PrismaClient({
        log: (() => {
          if (Bun.env.NODE_ENV === "development") {
            return ["query", "error", "warn"]
          }
          return ["error"]
        })(),
        adapter: adapter,
      })

      // yield* Effect.tryPromise({
      //   try: () => prismaClient.$connect(),
      //   catch: (error) => new Error("a"),
      // })

      const disconnect = Effect.tryPromise({
        try: () => prismaClient.$disconnect(),
        catch: (error) => new PrismaDisconnectError({ error }),
      })

      return {
        prismaClient,
        disconnect,
      }
    }),
  },
) {}
