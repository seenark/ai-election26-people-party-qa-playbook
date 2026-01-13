/**/
interface Env {
  S3_KEY_ID: string
  S3_ACCESS_KEY: string
  S3_BUCKET_NAME: string
  S3_URL: string
}

declare global {
  namespace NodeJS {
    interface ProcessEnv extends Env {
      NODE_ENV: "development" | "production" | "test" | "uat"
    }
  }
}

export type IEnv = Env
