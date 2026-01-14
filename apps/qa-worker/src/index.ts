import { Workers } from "@repo/queues"

console.log(`
    .d88b.    db       Yb        dP       8
    8P  Y8   dPYb       Yb  db  dP  .d8b. 8.dP .d88b 8d8b
    8b wd8  dPwwYb       YbdPYbdP   8' .8 88b  8.dP' 8P
    \`Y88Pw dP    Yb       YP  YP    \`Y8P' 8 Yb \`Y88P 8
    `)
console.log("all envs", Bun.env)
Workers.startQAWorker()
