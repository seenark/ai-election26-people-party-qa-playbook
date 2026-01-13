import { Effect } from "effect"
import { Queue } from "effect"

const queue = Queue.unbounded<number>()

async function main() {
  setInterval(() => {
    Effect.gen(function* () {
      const q = yield* queue
      yield* Queue.offer(q, 1)
    }).pipe(Effect.runSync)
  }, 1000)

  await Effect.gen(function* () {
    const q = yield* queue

    yield* Queue.take(q).pipe(
      Effect.tap((data) => {
        console.log(data)
      }),
      Effect.forever,
    )
  }).pipe(Effect.runPromise)
}

await main().then(() => process.exit(0))
