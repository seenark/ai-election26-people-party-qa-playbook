import { Data, Effect } from "effect"

import { PrismaClientProvider } from "../lib/prisma"
import type { Prisma } from "../generated/prisma/client"

export type QAClusterLinkIncludeParams = {
  qa_pair?: boolean
  cluster?: boolean
}

export class CreateQAClusterLinkError extends Data.TaggedError(
  "Repository/QAClusterLink/Create/Error",
)<{
  error: unknown
  data: {
    qa_id: string
    cluster_id: string
    similarity_score: number
  }
}> {}

export class FindQAClusterLinkError extends Data.TaggedError(
  "Repository/QAClusterLink/Find/Error",
)<{
  error: unknown
  data: { qa_id: string; cluster_id: string }
}> {}

export class FindManyQAClusterLinksError extends Data.TaggedError(
  "Repository/QAClusterLink/FindMany/Error",
)<{
  error: unknown
  data: {
    where?: Prisma.QAClusterLinkWhereInput
    limit?: number
    offset?: number
  }
}> {}

export class UpdateQAClusterLinkError extends Data.TaggedError(
  "Repository/QAClusterLink/Update/Error",
)<{
  error: unknown
  data: {
    qa_id: string
    cluster_id: string
    updates: Prisma.QAClusterLinkUpdateInput
  }
}> {}

export class DeleteQAClusterLinkError extends Data.TaggedError(
  "Repository/QAClusterLink/Delete/Error",
)<{
  error: unknown
  data: { qa_id: string; cluster_id: string }
}> {}

export class UpsertQAClusterLinkError extends Data.TaggedError(
  "Repository/QAClusterLink/Upsert/Error",
)<{
  error: unknown
  data: {
    qa_id: string
    cluster_id: string
    similarity_score: number
  }
}> {}

export class QAClusterLinkRepository extends Effect.Service<QAClusterLinkRepository>()(
  "Repository/QAClusterLink",
  {
    dependencies: [PrismaClientProvider.Default],
    effect: Effect.gen(function* () {
      const { prismaClient } = yield* PrismaClientProvider

      const create = (params: {
        qa_id: string
        cluster_id: string
        similarity_score: number
      }) => {
        const { qa_id, cluster_id, similarity_score } = params

        return Effect.tryPromise({
          try: () =>
            prismaClient.qAClusterLink.create({
              data: {
                qa_id,
                cluster_id,
                similarity_score,
              },
            }),
          catch: (error) =>
            new CreateQAClusterLinkError({ error, data: params }),
        })
      }

      const find = (
        qa_id: string,
        cluster_id: string,
        include?: QAClusterLinkIncludeParams,
      ) => {
        return Effect.tryPromise({
          try: () =>
            prismaClient.qAClusterLink.findUnique({
              where: {
                qa_id_cluster_id: {
                  qa_id,
                  cluster_id,
                },
              },
              include: include as Prisma.QAClusterLinkInclude,
            }),
          catch: (error) =>
            new FindQAClusterLinkError({
              error,
              data: { qa_id, cluster_id },
            }),
        })
      }

      const findMany = (params: {
        where?: Prisma.QAClusterLinkWhereInput
        include?: QAClusterLinkIncludeParams
        limit?: number
        offset?: number
      }) => {
        const { where, include, limit, offset } = params

        return Effect.tryPromise({
          try: () =>
            prismaClient.qAClusterLink.findMany({
              where,
              include: include as Prisma.QAClusterLinkInclude,
              take: limit,
              skip: offset,
            }),
          catch: (error) =>
            new FindManyQAClusterLinksError({ error, data: params }),
        })
      }

      const update = (params: {
        qa_id: string
        cluster_id: string
        updates: Prisma.QAClusterLinkUpdateInput
      }) => {
        const { qa_id, cluster_id, updates } = params

        return Effect.tryPromise({
          try: () =>
            prismaClient.qAClusterLink.update({
              where: {
                qa_id_cluster_id: {
                  qa_id,
                  cluster_id,
                },
              },
              data: updates,
            }),
          catch: (error) =>
            new UpdateQAClusterLinkError({ error, data: params }),
        })
      }

      const deleteById = (qa_id: string, cluster_id: string) => {
        return Effect.tryPromise({
          try: () =>
            prismaClient.qAClusterLink.delete({
              where: {
                qa_id_cluster_id: {
                  qa_id,
                  cluster_id,
                },
              },
            }),
          catch: (error) =>
            new DeleteQAClusterLinkError({
              error,
              data: { qa_id, cluster_id },
            }),
        })
      }

      const upsert = (params: {
        qa_id: string
        cluster_id: string
        similarity_score: number
      }) => {
        const { qa_id, cluster_id, similarity_score } = params

        return Effect.tryPromise({
          try: () =>
            prismaClient.qAClusterLink.upsert({
              where: {
                qa_id_cluster_id: {
                  qa_id,
                  cluster_id,
                },
              },
              create: {
                qa_id,
                cluster_id,
                similarity_score,
              },
              update: {
                similarity_score,
              },
            }),
          catch: (error) =>
            new UpsertQAClusterLinkError({
              error,
              data: {
                qa_id,
                cluster_id,
                similarity_score,
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
