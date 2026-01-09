import type { ConnectionOptions } from "bullmq"

import { redisUrl } from "@repo/redis"

export const connection: ConnectionOptions = {
  url: redisUrl,
}
