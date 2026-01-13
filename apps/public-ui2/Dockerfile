FROM oven/bun:1-alpine AS builder

WORKDIR /app

COPY ../.. .

RUN bun install

WORKDIR /app/apps/public-ui2
RUN bun run build

FROM oven/bun:1-alpine AS runner

WORKDIR /app

COPY --from=builder /app/apps/public-ui2/.output ./.output

EXPOSE 3000

CMD ["bun", ".output/server/index.mjs"]
