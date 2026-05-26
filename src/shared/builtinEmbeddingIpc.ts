import type { AIConfig, EmbeddingProvider } from "./aiTypes";

/** 内置嵌入 IPC 所需配置（plain object，可安全经 contextBridge 传递） */
export interface BuiltinEmbeddingIpcConfig {
  embedding: {
    provider: EmbeddingProvider;
    hfRemoteHost: string;
    builtinModelCacheDir: string;
    builtinModel: string;
  };
}

export interface BuiltinEmbeddingIpcPayload {
  modelId: string;
  config: BuiltinEmbeddingIpcConfig;
}

export function buildBuiltinEmbeddingIpcPayload(
  modelId: string,
  cfg: AIConfig,
): BuiltinEmbeddingIpcPayload {
  const e = cfg.embedding;
  return {
    modelId: modelId.trim(),
    config: {
      embedding: {
        provider: e.provider,
        hfRemoteHost: e.hfRemoteHost,
        builtinModelCacheDir: e.builtinModelCacheDir,
        builtinModel: e.builtinModel,
      },
    },
  };
}
