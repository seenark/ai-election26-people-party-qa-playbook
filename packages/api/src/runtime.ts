import { ChunkingService, VectorService } from "@repo/ai"
import { Layer, Logger, ManagedRuntime } from "effect"

import { CanonicalAnswerRepository } from "./canonical-answers/repository"
import { InfographicRepository } from "./infographics/repository"
import { PrismaClientProvider } from "./lib/prisma"
import { PolicyRepository } from "./policies/repository"
import { PolicyChunkRepository } from "./policy-chunks/repository"
import { QAClusterLinkRepository } from "./qa-cluster-links/repository"
import { QAPairRepository } from "./qa-pairs/repository"
import { QAPolicyLinkRepository } from "./qa-policy-links/repository"
import { QuestionClusterRepository } from "./question-clusters/repository"
import { SourceRepository } from "./sources/repository"

const layerLive = Layer.mergeAll(
  ChunkingService.Default,
  VectorService.Default,
  PolicyChunkRepository.Default,
  SourceRepository.Default,
  QAPairRepository.Default,
  PolicyRepository.Default,
  QAPolicyLinkRepository.Default,
  QuestionClusterRepository.Default,
  QAClusterLinkRepository.Default,
  CanonicalAnswerRepository.Default,
  InfographicRepository.Default,
  Logger.pretty,
).pipe(Layer.provideMerge(PrismaClientProvider.Default))

export const Runtime = ManagedRuntime.make(layerLive)
