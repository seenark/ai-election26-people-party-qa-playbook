import { Layer, ManagedRuntime } from "effect"

import { PrismaClientProvider } from "./lib/prisma"
import { PolicyChunkRepository } from "./policy-chunks/repository"
import { SourceRepository } from "./sources/repository"
import { QAPairRepository } from "./qa-pairs/repository"
import { PolicyRepository } from "./policies/repository"
import { QAPolicyLinkRepository } from "./qa-policy-links/repository"
import { QuestionClusterRepository } from "./question-clusters/repository"
import { QAClusterLinkRepository } from "./qa-cluster-links/repository"
import { CanonicalAnswerRepository } from "./canonical-answers/repository"
import { InfographicRepository } from "./infographics/repository"

const layerLive = Layer.mergeAll(
  PolicyChunkRepository.Default,
  SourceRepository.Default,
  QAPairRepository.Default,
  PolicyRepository.Default,
  QAPolicyLinkRepository.Default,
  QuestionClusterRepository.Default,
  QAClusterLinkRepository.Default,
  CanonicalAnswerRepository.Default,
  InfographicRepository.Default,
).pipe(Layer.provideMerge(PrismaClientProvider.Default))

export const Runtime = ManagedRuntime.make(layerLive)
