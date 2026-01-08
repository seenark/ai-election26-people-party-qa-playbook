/**/
interface Env {
  DATABASE_URL: string
}

declare global {
  namespace NodeJS {
    interface ProcessEnv extends Env {
      NODE_ENV: "development" | "production" | "test" | "uat"
    }
  }
}

export type IEnv = Env
