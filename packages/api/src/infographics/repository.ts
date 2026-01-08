import { Data, Effect } from "effect"
import { ulid } from "ulid"

import { PrismaClientProvider } from "../lib/prisma"
import type { Infographic, Prisma } from "../generated/prisma/client"

export type InfographicIncludeParams = {
  canonical_answer?: boolean
}

export class CreateInfographicError extends Data.TaggedError(
  "Repository/Infographic/Create/Error",
)<{
  error: unknown
  data: {
    canonical_id: string
    image_url?: string
    prompt?: string
    status?: Prisma.InfographicCreateInput["status"]
  }
}> {}

export class FindInfographicByIdError extends Data.TaggedError(
  "Repository/Infographic/FindById/Error",
)<{
  error: unknown
  data: { id: string }
}> {}

export class FindManyInfographicsError extends Data.TaggedError(
  "Repository/Infographic/FindMany/Error",
)<{
  error: unknown
  data: {
    where?: Prisma.InfographicWhereInput
    limit?: number
    offset?: number
  }
}> {}

export class UpdateInfographicError extends Data.TaggedError(
  "Repository/Infographic/Update/Error",
)<{
  error: unknown
  data: {
    id: string
    updates: Prisma.InfographicUpdateInput
  }
}> {}

export class DeleteInfographicError extends Data.TaggedError(
  "Repository/Infographic/Delete/Error",
)<{
  error: unknown
  data: { id: string }
}> {}

export class InfographicRepository extends Effect.Service<InfographicRepository>()(
  "Repository/Infographic",
  {
    dependencies: [PrismaClientProvider.Default],
    effect: Effect.gen(function* () {
      const { prismaClient } = yield* PrismaClientProvider

      const create = (params: {
        canonical_id: string
        image_url?: string
        prompt?: string
        status?: Prisma.InfographicCreateInput["status"]
      }) => {
        const id = ulid()
        const { canonical_id, image_url, prompt, status } = params

        return Effect.tryPromise({
          try: () =>
            prismaClient.infographic.create({
              data: {
                id,
                canonical_id,
                image_url,
                prompt,
                status,
              },
            }),
          catch: (error) => new CreateInfographicError({ error, data: params }),
        })
      }

      const findById = (
        id: string,
        include?: InfographicIncludeParams,
      ) => {
        return Effect.tryPromise({
          try: () =>
            prismaClient.infographic.findUnique({
              where: { id },
              include: include as Prisma.InfographicInclude,
            }),
          catch: (error) => new FindInfographicByIdError({ error, data: { id } }),
        })
      }

      const findMany = (params: {
        where?: Prisma.InfographicWhereInput
        include?: InfographicIncludeParams
        limit?: number
        offset?: number
      }) => {
        const { where, include, limit, offset } = params

        return Effect.tryPromise({
          try: () =>
            prismaClient.infographic.findMany({
              where,
              include: include as Prisma.InfographicInclude,
              take: limit,
              skip: offset,
            }),
          catch: (error) =>
            new FindManyInfographicsError({ error, data: params }),
        })
      }

      const update = (params: {
        id: string
        updates: Prisma.InfographicUpdateInput
      }) => {
        const { id, updates } = params

        return Effect.tryPromise({
          try: () =>
            prismaClient.infographic.update({
              where: { id },
              data: updates,
            }),
          catch: (error) => new UpdateInfographicError({ error, data: params }),
        })
      }

      const deleteById = (id: string) => {
        return Effect.tryPromise({
          try: () =>
            prismaClient.infographic.delete({
              where: { id },
            }),
          catch: (error) => new DeleteInfographicError({ error, data: { id } }),
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
