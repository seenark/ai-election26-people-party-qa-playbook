import { Layer, Logger, ManagedRuntime } from "effect"

import { ChunkingService } from "../../ai/src/chunking"
import { VectorService } from "../../ai/src/vector"
import { CanonicalQARepository } from "./canonical-qa/repository"
import { PolicyRepository } from "./policies/repository"
import { PolicyChunkRepository } from "./policy-chunks/repository"
import { SurrealProvider } from "./surreal-provider"

export const liveLayer = Layer.mergeAll(
  CanonicalQARepository.Default,
  PolicyRepository.Default,
  PolicyChunkRepository.Default,
  VectorService.Default,
  ChunkingService.Default,
  Logger.pretty,
).pipe(Layer.provideMerge(SurrealProvider.Default))

export const Runtime = ManagedRuntime.make(liveLayer)
