import { PrismaPg } from "@prisma/adapter-pg"
import { Effect } from "effect"

import { PrismaClient } from "../../generated/prisma/client"

export class PrismaClientProvider extends Effect.Service<PrismaClientProvider>()(
  "Provider/PrismaClient",
  {
    effect: Effect.gen(function* () {
      const connectionString = Bun.env.DATABASE_URL

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

      return {
        prismaClient,
      }
    }),
  },
) {}
