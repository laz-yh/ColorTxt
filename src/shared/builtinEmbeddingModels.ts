/** 内置嵌入模型（Transformers.js，经 HF 镜像在线下载） */

export interface BuiltinEmbeddingModel {
  id: string;
  hfModelId: string;
  name: string;
  size: string;
  dimension: number;
  recommended?: boolean;
  /** 设置页下拉主标题（含大小与维度） */
  uiListLabel: string;
  /** 设置页下拉副标题 */
  uiListDescription: string;
}

/** 内置嵌入走与远程 API 相同的向量检索，支持 ragTopK */
export const BUILTIN_EMBEDDING_SUPPORTS_RAG_TOP_K = true;

export const BUILTIN_EMBEDDING_MODELS: BuiltinEmbeddingModel[] = [
  {
    id: "bge-small-zh-v1.5",
    hfModelId: "Xenova/bge-small-zh-v1.5",
    name: "BGE Small ZH v1.5",
    size: "~47 MB",
    dimension: 512,
    recommended: true,
    uiListLabel: "BGE Small ZH v1.5（~47 MB，维度：512）",
    uiListDescription: "高质量中文嵌入",
  },
  {
    id: "multilingual-e5-small",
    hfModelId: "Xenova/multilingual-e5-small",
    name: "Multilingual E5 Small",
    size: "~118 MB",
    dimension: 384,
    uiListLabel: "Multilingual E5 Small（~118MB，维度：384）",
    uiListDescription: "多语言支持（100+ 语言），综合性能好",
  },
];

export const DEFAULT_BUILTIN_EMBEDDING_MODEL_ID = "bge-small-zh-v1.5";

/** Hugging Face 官方下载源；配置留空时使用 */
export const OFFICIAL_HF_REMOTE_HOST = "https://huggingface.co";

/** 面向中文用户的默认镜像（写入默认配置，用户可清空以改用官方源） */
export const DEFAULT_HF_REMOTE_HOST = "https://hf-mirror.com";

export function resolveHfRemoteHost(configured: string): string {
  const t = configured.trim();
  return t || OFFICIAL_HF_REMOTE_HOST;
}

export function getBuiltinEmbeddingModel(
  id: string,
): BuiltinEmbeddingModel | undefined {
  const t = id.trim();
  return BUILTIN_EMBEDDING_MODELS.find((m) => m.id === t);
}

export function isBuiltinEmbeddingModel(id: string): boolean {
  return Boolean(getBuiltinEmbeddingModel(id));
}
