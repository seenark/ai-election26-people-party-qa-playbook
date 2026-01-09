import { Data, Effect } from "effect"

import { PrismaClientProvider } from "../lib/prisma"
import type { Prisma } from "../generated/prisma/client"

export type QAPolicyLinkIncludeParams = {
  qa_pair?: boolean
  policy?: boolean
}

export class CreateQAPolicyLinkError extends Data.TaggedError(
  "Repository/QAPolicyLink/Create/Error",
)<{
  error: unknown
  data: {
    qa_id: string
    policy_id: string
    relevance_score: number
  }
}> {}

export class FindQAPolicyLinkError extends Data.TaggedError(
  "Repository/QAPolicyLink/Find/Error",
)<{
  error: unknown
  data: { qa_id: string; policy_id: string }
}> {}

export class FindManyQAPolicyLinksError extends Data.TaggedError(
  "Repository/QAPolicyLink/FindMany/Error",
)<{
  error: unknown
  data: {
    where?: Prisma.QAPolicyLinkWhereInput
    limit?: number
    offset?: number
  }
}> {}

export class UpdateQAPolicyLinkError extends Data.TaggedError(
  "Repository/QAPolicyLink/Update/Error",
)<{
  error: unknown
  data: {
    qa_id: string
    policy_id: string
    updates: Prisma.QAPolicyLinkUpdateInput
  }
}> {}

export class DeleteQAPolicyLinkError extends Data.TaggedError(
  "Repository/QAPolicyLink/Delete/Error",
)<{
  error: unknown
  data: { qa_id: string; policy_id: string }
}> {}

export class UpsertQAPolicyLinkError extends Data.TaggedError(
  "Repository/QAPolicyLink/Upsert/Error",
)<{
  error: unknown
  data: {
    qa_id: string
    policy_id: string
    relevance_score: number
  }
}> {}

export class QAPolicyLinkRepository extends Effect.Service<QAPolicyLinkRepository>()(
  "Repository/QAPolicyLink",
  {
    dependencies: [PrismaClientProvider.Default],
    effect: Effect.gen(function* () {
      const { prismaClient } = yield* PrismaClientProvider

      const create = (params: {
        qa_id: string
        policy_id: string
        relevance_score: number
      }) => {
        const { qa_id, policy_id, relevance_score } = params

        return Effect.tryPromise({
          try: () =>
            prismaClient.qAPolicyLink.create({
              data: {
                qa_id,
                policy_id,
                relevance_score,
              },
            }),
          catch: (error) => new CreateQAPolicyLinkError({ error, data: params }),
        })
      }

      const find = (
        qa_id: string,
        policy_id: string,
        include?: QAPolicyLinkIncludeParams,
      ) => {
        return Effect.tryPromise({
          try: () =>
            prismaClient.qAPolicyLink.findUnique({
              where: {
                qa_id_policy_id: {
                  qa_id,
                  policy_id,
                },
              },
              include: include as Prisma.QAPolicyLinkInclude,
            }),
          catch: (error) =>
            new FindQAPolicyLinkError({
              error,
              data: { qa_id, policy_id },
            }),
        })
      }

      const findMany = (params: {
        where?: Prisma.QAPolicyLinkWhereInput
        include?: QAPolicyLinkIncludeParams
        limit?: number
        offset?: number
      }) => {
        const { where, include, limit, offset } = params

        return Effect.tryPromise({
          try: () =>
            prismaClient.qAPolicyLink.findMany({
              where,
              include: include as Prisma.QAPolicyLinkInclude,
              take: limit,
              skip: offset,
            }),
          catch: (error) =>
            new FindManyQAPolicyLinksError({ error, data: params }),
        })
      }

      const update = (params: {
        qa_id: string
        policy_id: string
        updates: Prisma.QAPolicyLinkUpdateInput
      }) => {
        const { qa_id, policy_id, updates } = params

        return Effect.tryPromise({
          try: () =>
            prismaClient.qAPolicyLink.update({
              where: {
                qa_id_policy_id: {
                  qa_id,
                  policy_id,
                },
              },
              data: updates,
            }),
          catch: (error) =>
            new UpdateQAPolicyLinkError({ error, data: params }),
        })
      }

      const deleteById = (qa_id: string, policy_id: string) => {
        return Effect.tryPromise({
          try: () =>
            prismaClient.qAPolicyLink.delete({
              where: {
                qa_id_policy_id: {
                  qa_id,
                  policy_id,
                },
              },
            }),
          catch: (error) =>
            new DeleteQAPolicyLinkError({
              error,
              data: { qa_id, policy_id },
            }),
        })
      }

      const upsert = (params: {
        qa_id: string
        policy_id: string
        relevance_score: number
      }) => {
        const { qa_id, policy_id, relevance_score } = params

        return Effect.tryPromise({
          try: () =>
            prismaClient.qAPolicyLink.upsert({
              where: {
                qa_id_policy_id: {
                  qa_id,
                  policy_id,
                },
              },
              create: {
                qa_id,
                policy_id,
                relevance_score,
              },
              update: {
                relevance_score,
              },
            }),
          catch: (error) =>
            new UpsertQAPolicyLinkError({
              error,
              data: {
                qa_id,
                policy_id,
                relevance_score,
              },
            }),
        })
      }

      return {
        create,
        find,
        findMany,
        update,
        deleteById,
        upsert,
      }
    }),
  },
) {}
