import { Data, Effect } from "effect"

import { PrismaClientProvider } from "../lib/prisma"
import type { Prisma } from "../generated/prisma/client"

export type QuestionClusterIncludeParams = {
  qa_cluster_links?: boolean
  canonical_answers?: boolean
}

export class CreateQuestionClusterError extends Data.TaggedError(
  "Repository/QuestionCluster/Create/Error",
)<{
  error: unknown
  data: {
    canonical_question: string
    topic_category?: string
    region?: string
    status?: Prisma.QuestionClusterCreateInput["status"]
  }
}> {}

export class FindQuestionClusterByIdError extends Data.TaggedError(
  "Repository/QuestionCluster/FindById/Error",
)<{
  error: unknown
  data: { id: string }
}> {}

export class FindManyQuestionClustersError extends Data.TaggedError(
  "Repository/QuestionCluster/FindMany/Error",
)<{
  error: unknown
  data: {
    where?: Prisma.QuestionClusterWhereInput
    limit?: number
    offset?: number
  }
}> {}

export class UpdateQuestionClusterError extends Data.TaggedError(
  "Repository/QuestionCluster/Update/Error",
)<{
  error: unknown
  data: {
    id: string
    updates: Prisma.QuestionClusterUpdateInput
  }
}> {}

export class DeleteQuestionClusterError extends Data.TaggedError(
  "Repository/QuestionCluster/Delete/Error",
)<{
  error: unknown
  data: { id: string }
}> {}

export class UpsertQuestionClusterError extends Data.TaggedError(
  "Repository/QuestionCluster/Upsert/Error",
)<{
  error: unknown
  data: {
    id: string
    updates: Prisma.QuestionClusterUpdateInput
  }
}> {}

export class QuestionClusterRepository extends Effect.Service<QuestionClusterRepository>()(
  "Repository/QuestionCluster",
  {
    dependencies: [PrismaClientProvider.Default],
    effect: Effect.gen(function* () {
      const { prismaClient } = yield* PrismaClientProvider

      const create = (params: {
        canonical_question: string
        topic_category?: string
        region?: string
        status?: Prisma.QuestionClusterCreateInput["status"]
      }) => {
        const id = Bun.randomUUIDv7()
        const { canonical_question, topic_category, region, status } = params

        return Effect.tryPromise({
          try: () =>
            prismaClient.questionCluster.create({
              data: {
                id,
                canonical_question,
                topic_category,
                region,
                status,
              },
            }),
          catch: (error) =>
            new CreateQuestionClusterError({ error, data: params }),
        })
      }

      const findById = (
        id: string,
        include?: QuestionClusterIncludeParams,
      ) => {
        return Effect.tryPromise({
          try: () =>
            prismaClient.questionCluster.findUnique({
              where: { id },
              include: include as Prisma.QuestionClusterInclude,
            }),
          catch: (error) =>
            new FindQuestionClusterByIdError({ error, data: { id } }),
        })
      }

      const findMany = (params: {
        where?: Prisma.QuestionClusterWhereInput
        include?: QuestionClusterIncludeParams
        limit?: number
        offset?: number
      }) => {
        const { where, include, limit, offset } = params

        return Effect.tryPromise({
          try: () =>
            prismaClient.questionCluster.findMany({
              where,
              include: include as Prisma.QuestionClusterInclude,
              take: limit,
              skip: offset,
            }),
          catch: (error) =>
            new FindManyQuestionClustersError({ error, data: params }),
        })
      }

      const update = (params: {
        id: string
        updates: Prisma.QuestionClusterUpdateInput
      }) => {
        const { id, updates } = params

        return Effect.tryPromise({
          try: () =>
            prismaClient.questionCluster.update({
              where: { id },
              data: updates,
            }),
          catch: (error) =>
            new UpdateQuestionClusterError({ error, data: params }),
        })
      }

      const deleteById = (id: string) => {
        return Effect.tryPromise({
          try: () =>
            prismaClient.questionCluster.delete({
              where: { id },
            }),
          catch: (error) =>
            new DeleteQuestionClusterError({ error, data: { id } }),
        })
      }

      const upsert = (params: {
        id: string
        updates: Prisma.QuestionClusterUpdateInput
      }) => {
        const { id, updates } = params

        return Effect.tryPromise({
          try: () =>
            prismaClient.questionCluster.upsert({
              where: { id },
              create: {
                id,
                ...updates,
              } as Prisma.QuestionClusterCreateInput,
              update: updates,
            }),
          catch: (error) =>
            new UpsertQuestionClusterError({ error, data: params }),
        })
      }

      return {
        create,
        findById,
        findMany,
        update,
        deleteById,
        upsert,
      }
    }),
  },
) {}
