import type { Repository } from "../canonical-qa"

export const cleanLinks = (text: string) =>
  text.replace("![](https://election69.peoplesparty.or.th/images/logos/logo-main.svg)", "")

export * from "./repository"
