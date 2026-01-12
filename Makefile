newqa:
	bun --env-file ./envs/.env packages/ai/src/workflows/new-qa.test.ts

seedpolicies:
	bun --env-file ./envs/.env packages/surreal/scripts/seed-policies.ts
