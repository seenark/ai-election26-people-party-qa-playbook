/**/
interface Env {
  GOOGLE_API_KEY: string
}

declare global {
  namespace NodeJS {
    interface ProcessEnv extends Env {
      NODE_ENV: "development" | "production" | "test" | "uat"
    }
  }
}

export type IEnv = Env
