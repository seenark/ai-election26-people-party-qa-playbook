import { S3Client } from "bun"
import { Data, Effect } from "effect"

export class S3WriteError extends Data.TaggedError("S3/Write/Error")<{
  error: unknown
  data: Record<string, any>
}> {}

export class S3Service extends Effect.Service<S3Service>()("S3Service", {
  effect: Effect.gen(function* () {
    const bucketName = Bun.env.S3_BUCKET_NAME || "mybucket"
    const credentials = {
      accessKeyId: Bun.env.S3_KEY_ID,
      secretAccessKey: Bun.env.S3_ACCESS_KEY,
    }

    const s3Client = new S3Client({
      ...credentials,
      bucket: bucketName,
      endpoint: Bun.env.S3_URL || "http://localhost:9000",
    })

    const write = (
      ...args: Parameters<typeof s3Client.write>
    ): Effect.Effect<number, S3WriteError, never> => {
      return Effect.tryPromise({
        try: () => s3Client.write(...args),
        catch: (error) => new S3WriteError({ error, data: args }),
      })
    }

    return {
      write,
    }
  }),
}) {}
