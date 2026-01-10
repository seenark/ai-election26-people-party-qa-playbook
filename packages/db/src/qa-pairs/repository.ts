import { Data, Effect } from "effect"

import { PrismaClientProvider } from "../lib/prisma"
import type { Prisma } from "../generated/prisma/client"

export type QAPairIncludeParams = {
  source?: boolean
  qa_policy_links?: boolean
  qa_cluster_links?: boolean
}

export class CreateQAPairError extends Data.TaggedError(
  "Repository/QAPair/Create/Error",
)<{
  error: unknown
  data: {
    source_id: string
    question_text: string
    answer_text: string
    ts_start_seconds?: number
    ts_end_seconds?: number
    topic_category?: string
    region?: string
    status?: Prisma.QAPairCreateInput["status"]
  }
}> {}

export class FindQAPairByIdError extends Data.TaggedError(
  "Repository/QAPair/FindById/Error",
)<{
  error: unknown
  data: { id: string }
}> {}

export class FindManyQAPairsError extends Data.TaggedError(
  "Repository/QAPair/FindMany/Error",
)<{
  error: unknown
  data: {
    where?: Prisma.QAPairWhereInput
    limit?: number
    offset?: number
  }
}> {}

export class UpdateQAPairError extends Data.TaggedError(
  "Repository/QAPair/Update/Error",
)<{
  error: unknown
  data: {
    id: string
    updates: Prisma.QAPairUpdateInput
  }
}> {}

export class DeleteQAPairError extends Data.TaggedError(
  "Repository/QAPair/Delete/Error",
)<{
  error: unknown
  data: { id: string }
}> {}

export class UpsertQAPairError extends Data.TaggedError(
  "Repository/QAPair/Upsert/Error",
)<{
  error: unknown
  data: {
    id: string
    updates: Prisma.QAPairUpdateInput
  }
}> {}

export class QAPairRepository extends Effect.Service<QAPairRepository>()(
  "Repository/QAPair",
  {
    dependencies: [PrismaClientProvider.Default],
    effect: Effect.gen(function* () {
      const { prismaClient } = yield* PrismaClientProvider

      const create = (params: {
        source_id: string
        question_text: string
        answer_text: string
        ts_start_seconds?: number
        ts_end_seconds?: number
        topic_category?: string
        region?: string
        status?: Prisma.QAPairCreateInput["status"]
      }) => {
        const id = Bun.randomUUIDv7()
        const {
          source_id,
          question_text,
          answer_text,
          ts_start_seconds,
          ts_end_seconds,
          topic_category,
          region,
          status,
        } = params

        return Effect.tryPromise({
          try: () =>
            prismaClient.qAPair.create({
              data: {
                id,
                source_id,
                question_text,
                answer_text,
                ts_start_seconds,
                ts_end_seconds,
                topic_category,
                region,
                status,
              },
            }),
          catch: (error) => new CreateQAPairError({ error, data: params }),
        })
      }

      const findById = (
        id: string,
        include?: QAPairIncludeParams,
      ) => {
        return Effect.tryPromise({
          try: () =>
            prismaClient.qAPair.findUnique({
              where: { id },
              include: include as Prisma.QAPairInclude,
            }),
          catch: (error) => new FindQAPairByIdError({ error, data: { id } }),
        })
      }

      const findMany = (params: {
        where?: Prisma.QAPairWhereInput
        include?: QAPairIncludeParams
        limit?: number
        offset?: number
      }) => {
        const { where, include, limit, offset } = params

        return Effect.tryPromise({
          try: () =>
            prismaClient.qAPair.findMany({
              where,
              include: include as Prisma.QAPairInclude,
              take: limit,
              skip: offset,
            }),
          catch: (error) => new FindManyQAPairsError({ error, data: params }),
        })
      }

      const update = (params: {
        id: string
        updates: Prisma.QAPairUpdateInput
      }) => {
        const { id, updates } = params

        return Effect.tryPromise({
          try: () =>
            prismaClient.qAPair.update({
              where: { id },
              data: updates,
            }),
          catch: (error) => new UpdateQAPairError({ error, data: params }),
        })
      }

      const deleteById = (id: string) => {
        return Effect.tryPromise({
          try: () =>
            prismaClient.qAPair.delete({
              where: { id },
            }),
          catch: (error) => new DeleteQAPairError({ error, data: { id } }),
        })
      }

      const upsert = (params: {
        id: string
        updates: Prisma.QAPairUpdateInput
      }) => {
        const { id, updates } = params

        return Effect.tryPromise({
          try: () =>
            prismaClient.qAPair.upsert({
              where: { id },
              create: {
                id,
                ...updates,
              } as Prisma.QAPairCreateInput,
              update: updates,
            }),
          catch: (error) => new UpsertQAPairError({ error, data: params }),
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
