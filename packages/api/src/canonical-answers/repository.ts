import { Data, Effect } from "effect"
import { ulid } from "ulid"

import { PrismaClientProvider } from "../lib/prisma"
import type { CanonicalAnswer, Prisma } from "../generated/prisma/client"

export type CanonicalAnswerIncludeParams = {
  cluster?: boolean
  infographics?: boolean
}

export class CreateCanonicalAnswerError extends Data.TaggedError(
  "Repository/CanonicalAnswer/Create/Error",
)<{
  error: unknown
  data: {
    cluster_id: string
    version: number
    short_answer: string
    long_answer: string
    what: string
    why: string
    how: string
    bullet_points: string[]
    red_lines: string[]
    change_summary?: string
    status?: Prisma.CanonicalAnswerCreateInput["status"]
  }
}> {}

export class FindCanonicalAnswerByIdError extends Data.TaggedError(
  "Repository/CanonicalAnswer/FindById/Error",
)<{
  error: unknown
  data: { id: string }
}> {}

export class FindManyCanonicalAnswersError extends Data.TaggedError(
  "Repository/CanonicalAnswer/FindMany/Error",
)<{
  error: unknown
  data: {
    where?: Prisma.CanonicalAnswerWhereInput
    limit?: number
    offset?: number
  }
}> {}

export class UpdateCanonicalAnswerError extends Data.TaggedError(
  "Repository/CanonicalAnswer/Update/Error",
)<{
  error: unknown
  data: {
    id: string
    updates: Prisma.CanonicalAnswerUpdateInput
  }
}> {}

export class DeleteCanonicalAnswerError extends Data.TaggedError(
  "Repository/CanonicalAnswer/Delete/Error",
)<{
  error: unknown
  data: { id: string }
}> {}

export class CanonicalAnswerRepository extends Effect.Service<CanonicalAnswerRepository>()(
  "Repository/CanonicalAnswer",
  {
    dependencies: [PrismaClientProvider.Default],
    effect: Effect.gen(function* () {
      const { prismaClient } = yield* PrismaClientProvider

      const create = (params: {
        cluster_id: string
        version: number
        short_answer: string
        long_answer: string
        what: string
        why: string
        how: string
        bullet_points: string[]
        red_lines: string[]
        change_summary?: string
        status?: Prisma.CanonicalAnswerCreateInput["status"]
      }) => {
        const id = ulid()
        const {
          cluster_id,
          version,
          short_answer,
          long_answer,
          what,
          why,
          how,
          bullet_points,
          red_lines,
          change_summary,
          status,
        } = params

        return Effect.tryPromise({
          try: () =>
            prismaClient.canonicalAnswer.create({
              data: {
                id,
                cluster_id,
                version,
                short_answer,
                long_answer,
                what,
                why,
                how,
                bullet_points,
                red_lines,
                change_summary,
                status,
              },
            }),
          catch: (error) =>
            new CreateCanonicalAnswerError({ error, data: params }),
        })
      }

      const findById = (
        id: string,
        include?: CanonicalAnswerIncludeParams,
      ) => {
        return Effect.tryPromise({
          try: () =>
            prismaClient.canonicalAnswer.findUnique({
              where: { id },
              include: include as Prisma.CanonicalAnswerInclude,
            }),
          catch: (error) =>
            new FindCanonicalAnswerByIdError({ error, data: { id } }),
        })
      }

      const findMany = (params: {
        where?: Prisma.CanonicalAnswerWhereInput
        include?: CanonicalAnswerIncludeParams
        limit?: number
        offset?: number
      }) => {
        const { where, include, limit, offset } = params

        return Effect.tryPromise({
          try: () =>
            prismaClient.canonicalAnswer.findMany({
              where,
              include: include as Prisma.CanonicalAnswerInclude,
              take: limit,
              skip: offset,
            }),
          catch: (error) =>
            new FindManyCanonicalAnswersError({ error, data: params }),
        })
      }

      const update = (params: {
        id: string
        updates: Prisma.CanonicalAnswerUpdateInput
      }) => {
        const { id, updates } = params

        return Effect.tryPromise({
          try: () =>
            prismaClient.canonicalAnswer.update({
              where: { id },
              data: updates,
            }),
          catch: (error) =>
            new UpdateCanonicalAnswerError({ error, data: params }),
        })
      }

      const deleteById = (id: string) => {
        return Effect.tryPromise({
          try: () =>
            prismaClient.canonicalAnswer.delete({
              where: { id },
            }),
          catch: (error) =>
            new DeleteCanonicalAnswerError({ error, data: { id } }),
        })
      }

      return {
        create,
        findById,
        findMany,
        update,
        deleteById,
      }
    }),
  },
) {}
