import { Data, Effect } from "effect"
import { ulid } from "ulid"

import type { Policy, Prisma } from "../generated/prisma/client"

import { PrismaClientProvider } from "../lib/prisma"

export type PolicyIncludeParams = {
  policy_chunks?: boolean
  qa_policy_links?: boolean
}

export class CreatePolicyError extends Data.TaggedError("Repository/Policy/Create/Error")<{
  error: unknown
  data: Omit<Policy, "id">
}> {}

export class FindPolicyByIdError extends Data.TaggedError("Repository/Policy/FindById/Error")<{
  error: unknown
  data: { id: string }
}> {}

export class FindPolicyBySlugError extends Data.TaggedError("Repository/Policy/FindBySlug/Error")<{
  error: unknown
  data: { slug: string }
}> {}

export class FindManyPoliciesError extends Data.TaggedError("Repository/Policy/FindMany/Error")<{
  error: unknown
  data: {
    where?: Prisma.PolicyWhereInput
    limit?: number
    offset?: number
  }
}> {}

export class UpdatePolicyError extends Data.TaggedError("Repository/Policy/Update/Error")<{
  error: unknown
  data: {
    id: string
    updates: Prisma.PolicyUpdateInput
  }
}> {}

export class DeletePolicyError extends Data.TaggedError("Repository/Policy/Delete/Error")<{
  error: unknown
  data: { id: string }
}> {}

export class PolicyRepository extends Effect.Service<PolicyRepository>()("Repository/Policy", {
  dependencies: [PrismaClientProvider.Default],
  effect: Effect.gen(function* () {
    const { prismaClient } = yield* PrismaClientProvider

    const create = (params: Omit<Policy, "id">) => {
      const id = ulid()

      return Effect.tryPromise({
        try: () =>
          prismaClient.policy.create({
            data: {
              id,
              ...params,
            },
          }),
        catch: (error) => new CreatePolicyError({ error, data: params }),
      })
    }

    const findById = (id: string, include?: PolicyIncludeParams) => {
      return Effect.tryPromise({
        try: () =>
          prismaClient.policy.findUnique({
            where: { id },
            include: include as Prisma.PolicyInclude,
          }),
        catch: (error) => new FindPolicyByIdError({ error, data: { id } }),
      })
    }

    const findBySlug = (slug: string, include?: PolicyIncludeParams) => {
      return Effect.tryPromise({
        try: () =>
          prismaClient.policy.findUnique({
            where: { slug },
            include: include as Prisma.PolicyInclude,
          }),
        catch: (error) => new FindPolicyBySlugError({ error, data: { slug } }),
      })
    }

    const findMany = (params: {
      where?: Prisma.PolicyWhereInput
      include?: PolicyIncludeParams
      limit?: number
      offset?: number
    }) => {
      const { where, include, limit, offset } = params

      return Effect.tryPromise({
        try: () =>
          prismaClient.policy.findMany({
            where,
            include: include as Prisma.PolicyInclude,
            take: limit,
            skip: offset,
          }),
        catch: (error) => new FindManyPoliciesError({ error, data: params }),
      })
    }

    const update = (params: { id: string; updates: Prisma.PolicyUpdateInput }) => {
      const { id, updates } = params

      return Effect.tryPromise({
        try: () =>
          prismaClient.policy.update({
            where: { id },
            data: updates,
          }),
        catch: (error) => new UpdatePolicyError({ error, data: params }),
      })
    }

    const deleteById = (id: string) => {
      return Effect.tryPromise({
        try: () =>
          prismaClient.policy.delete({
            where: { id },
          }),
        catch: (error) => new DeletePolicyError({ error, data: { id } }),
      })
    }

    return {
      create,
      findById,
      findBySlug,
      findMany,
      update,
      deleteById,
    }
  }),
}) {}
