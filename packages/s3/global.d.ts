/**/
interface Env {
  S3_KEY_ID: string
  S3_ACCESS_KEY: string
}

declare global {
  namespace NodeJS {
    interface ProcessEnv extends Env {
      NODE_ENV: "development" | "production" | "test" | "uat"
    }
  }
}

export type IEnv = Env
