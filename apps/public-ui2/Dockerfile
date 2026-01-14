FROM oven/bun AS base
WORKDIR /app
RUN bun i -g turbo@2.7.2

FROM base AS turbo-prune
WORKDIR /app
COPY . .
RUN bun x turbo prune public-ui2 --docker

FROM base AS build
COPY --from=turbo-prune /app/out/json/ .
RUN bun i
COPY --from=turbo-prune /app/out/full/ .
RUN bun turbo build

FROM oven/bun:1-alpine AS final
WORKDIR /app
COPY --from=build /app/apps/public-ui2/.output/ .

CMD [ "bun", "/app/server/index.mjs" ]