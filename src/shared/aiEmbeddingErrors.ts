/** 内置嵌入加载/推理错误码（IPC → UI） */

export type AiEmbeddingErrorCode =
  | "HF_DOWNLOAD_TIMEOUT"
  | "HF_DOWNLOAD_FAILED"
  | "MODEL_NOT_DOWNLOADED"
  | "MODEL_NOT_LOADED"
  | "DIMENSION_MISMATCH"
  | "UNKNOWN";

export function classifyEmbeddingErrorMessage(raw: string): AiEmbeddingErrorCode {
  const m = raw.toLowerCase();
  if (m.includes("abort")) return "UNKNOWN";
  if (m.includes("timeout") || m.includes("etimedout")) return "HF_DOWNLOAD_TIMEOUT";
  if (m.includes("not downloaded") || m.includes("model_not_downloaded"))
    return "MODEL_NOT_DOWNLOADED";
  if (m.includes("not loaded") || m.includes("model not loaded"))
    return "MODEL_NOT_LOADED";
  if (m.includes("dimension")) return "DIMENSION_MISMATCH";
  if (
    m.includes("fetch") ||
    m.includes("network") ||
    m.includes("http") ||
    m.includes("enotfound") ||
    m.includes("download") ||
    (m.includes("local") && m.includes("not found"))
  ) {
    return "HF_DOWNLOAD_FAILED";
  }
  return "UNKNOWN";
}

export function userFacingEmbeddingError(
  code: AiEmbeddingErrorCode,
  detail?: string,
): string {
  switch (code) {
    case "HF_DOWNLOAD_TIMEOUT":
      return "从模型站下载超时。可尝试更换国内镜像地址，或改用远程 API。";
    case "HF_DOWNLOAD_FAILED":
      return `下载失败。请检查网络与镜像地址，或改用远程 API。${detail ? `\n${detail}` : ""}`;
    case "MODEL_NOT_DOWNLOADED":
      return "请先在「设置」→「向量模型」中下载内置模型。";
    case "MODEL_NOT_LOADED":
      return "内置模型加载失败，请重试或在「向量模型」设置中重新下载。";
    case "DIMENSION_MISMATCH":
      return "向量维度与配置不符，请检查所选内置模型与维度设置。";
    default:
      return detail?.trim() || "内置嵌入失败，请重试或改用远程 API。";
  }
}
