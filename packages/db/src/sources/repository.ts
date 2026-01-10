import { Data, Effect } from "effect"

import { PrismaClientProvider } from "../lib/prisma"
import type { Prisma } from "../generated/prisma/client"

export type SourceIncludeParams = {
  qa_pairs?: boolean
}

export class CreateSourceError extends Data.TaggedError(
  "Repository/Source/Create/Error",
)<{
  error: unknown
  data: {
    type: Prisma.SourceCreateInput["type"]
    url?: string
    raw_text?: string
    transcript?: string
    speaker: string
    date?: Date
  }
}> {}

export class FindSourceByIdError extends Data.TaggedError(
  "Repository/Source/FindById/Error",
)<{
  error: unknown
  data: { id: string }
}> {}

export class FindManySourcesError extends Data.TaggedError(
  "Repository/Source/FindMany/Error",
)<{
  error: unknown
  data: {
    where?: Prisma.SourceWhereInput
    limit?: number
    offset?: number
  }
}> {}

export class UpdateSourceError extends Data.TaggedError(
  "Repository/Source/Update/Error",
)<{
  error: unknown
  data: {
    id: string
    updates: Prisma.SourceUpdateInput
  }
}> {}

export class DeleteSourceError extends Data.TaggedError(
  "Repository/Source/Delete/Error",
)<{
  error: unknown
  data: { id: string }
}> {}

export class UpsertSourceError extends Data.TaggedError(
  "Repository/Source/Upsert/Error",
)<{
  error: unknown
  data: {
    url?: string
    updates: Omit<Prisma.SourceCreateInput, "url">
  }
}> {}

export class SourceRepository extends Effect.Service<SourceRepository>()(
  "Repository/Source",
  {
    dependencies: [PrismaClientProvider.Default],
    effect: Effect.gen(function* () {
      const { prismaClient } = yield* PrismaClientProvider

      const create = (params: {
        type: Prisma.SourceCreateInput["type"]
        url?: string
        raw_text?: string
        transcript?: string
        speaker: string
        date?: Date
      }) => {
        const id = Bun.randomUUIDv7()
        const { type, url, raw_text, transcript, speaker, date } = params

        return Effect.tryPromise({
          try: () =>
            prismaClient.source.create({
              data: {
                id,
                type,
                url,
                raw_text,
                transcript,
                speaker,
                date,
              },
            }),
          catch: (error) => new CreateSourceError({ error, data: params }),
        })
      }

      const findById = (
        id: string,
        include?: SourceIncludeParams,
      ) => {
        return Effect.tryPromise({
          try: () =>
            prismaClient.source.findUnique({
              where: { id },
              include: include as Prisma.SourceInclude,
            }),
          catch: (error) => new FindSourceByIdError({ error, data: { id } }),
        })
      }

      const findMany = (params: {
        where?: Prisma.SourceWhereInput
        include?: SourceIncludeParams
        limit?: number
        offset?: number
      }) => {
        const { where, include, limit, offset } = params

        return Effect.tryPromise({
          try: () =>
            prismaClient.source.findMany({
              where,
              include: include as Prisma.SourceInclude,
              take: limit,
              skip: offset,
            }),
          catch: (error) => new FindManySourcesError({ error, data: params }),
        })
      }

      const update = (params: {
        id: string
        updates: Prisma.SourceUpdateInput
      }) => {
        const { id, updates } = params

        return Effect.tryPromise({
          try: () =>
            prismaClient.source.update({
              where: { id },
              data: updates,
            }),
          catch: (error) => new UpdateSourceError({ error, data: params }),
        })
      }

      const deleteById = (id: string) => {
        return Effect.tryPromise({
          try: () =>
            prismaClient.source.delete({
              where: { id },
            }),
          catch: (error) => new DeleteSourceError({ error, data: { id } }),
        })
      }

      const upsert = (params: {
        url?: string
        updates: Omit<Prisma.SourceCreateInput, "url">
      }) => {
        const { url, updates } = params

        // For sources without URL (manual), we can't upsert by URL
        // Fall back to create
        if (!url) {
          return Effect.tryPromise({
            try: () =>
              prismaClient.source.create({
                data: {
                  id: Bun.randomUUIDv7(),
                  ...updates,
                },
              }),
            catch: (error) =>
              new UpsertSourceError({
                error,
                data: params,
              }),
          })
        }

        return Effect.tryPromise({
          try: () =>
            prismaClient.source.upsert({
              where: { url },
              create: {
                id: Bun.randomUUIDv7(),
                url,
                ...updates,
              },
              update: updates,
            }),
          catch: (error) =>
            new UpsertSourceError({
              error,
              data: params,
            }),
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
