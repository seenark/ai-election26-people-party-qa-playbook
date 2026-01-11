# Project Conventions: Repository Pattern

All repositories must follow the **Effect-TS Service** pattern. They should be thin data-access layers that map database operations to typed, tagged errors.

## Core Rules

1. **No Throws**: Every method must return an `Effect`. Use `Effect.tryPromise` to wrap DB calls.
2. **Tagged Errors**: Every operation must have a corresponding `Data.TaggedError`.
3. **Service Pattern**: Repositories are `Effect.Service` classes.
4. **Dependencies**: Access the DB client via a Provider (e.g., `PrismaClientProvider` or `SurrealProvider`).
5. **IDs**: Use `Bun.randomUUIDv7()` for new records unless the DB handles it.

## Reference Implementation (The "Golden" Pattern)

Use this exact structure for all repositories. Replace `Policy` with your entity name.

```typescript
import { Data, Effect } from "effect";
// Import your specific DB types here
import type { Policy, Prisma } from "../generated/prisma/client";
import { PrismaClientProvider } from "../lib/prisma";

// 1. Include/Relation Params
export type PolicyIncludeParams = {
  relation_name?: boolean;
};

// 2. Tagged Errors (One per operation)
export class CreatePolicyError extends Data.TaggedError(
  "Repository/Policy/Create/Error",
)<{
  error: unknown;
  data: any;
}> {}
export class FindPolicyByIdError extends Data.TaggedError(
  "Repository/Policy/FindById/Error",
)<{
  error: unknown;
  data: { id: string };
}> {}
// ... Add FindMany, Update, Delete, etc.

// 3. The Service
export class PolicyRepository extends Effect.Service<PolicyRepository>()(
  "Repository/Policy",
  {
    dependencies: [PrismaClientProvider.Default],
    effect: Effect.gen(function* () {
      const { prismaClient } = yield* PrismaClientProvider;

      const create = (params: Omit<Policy, "id">) => {
        const id = Bun.randomUUIDv7();
        return Effect.tryPromise({
          try: () => prismaClient.policy.create({ data: { id, ...params } }),
          catch: (error) => new CreatePolicyError({ error, data: params }),
        });
      };

      const findById = (id: string, include?: PolicyIncludeParams) => {
        return Effect.tryPromise({
          try: () =>
            prismaClient.policy.findUnique({
              where: { id },
              include: include as any,
            }),
          catch: (error) => new FindPolicyByIdError({ error, data: { id } }),
        });
      };

      return { create, findById };
    }),
  },
) {}
```
