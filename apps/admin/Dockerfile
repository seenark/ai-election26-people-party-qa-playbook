FROM oven/bun AS base
WORKDIR /app
RUN bun i -g turbo@2.7.2

FROM base AS turbo-prune
WORKDIR /app
COPY . .
RUN bun x turbo prune admin --docker

FROM base AS build
COPY --from=turbo-prune /app/out/json/ .
RUN bun i

ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}

COPY --from=turbo-prune /app/out/full/ .
RUN  bun run turbo build

FROM joseluisq/static-web-server:2 AS final
COPY --from=build /app/apps/admin/dist /dist

EXPOSE 3002

CMD ["--port", "3002", "--root", "/dist"]