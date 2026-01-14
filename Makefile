newqa:
	bun --env-file ./envs/.env packages/ai/src/workflows/new-qa.test.ts

seedpolicies:
	bun --env-file ./envs/.env packages/surreal/scripts/seed-policies.ts

dev-public-ui2:
	cd apps/public-ui2 && bun --env-file ../../envs/.env --bun dev

qa-worker-prune:
	bun x turbo prune qa-worker --docker

qa-worker-docker:
	docker build -t qaworker -f apps/qa-worker/Dockerfile .
