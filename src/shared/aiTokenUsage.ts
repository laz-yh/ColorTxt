/** OpenAI 兼容 chat/completions 返回的 usage 汇总 */
export type AITokenUsageTotals = {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
};

export const ZERO_TOKEN_USAGE: AITokenUsageTotals = {
  promptTokens: 0,
  completionTokens: 0,
  totalTokens: 0,
};

export function addTokenUsage(
  acc: AITokenUsageTotals,
  part: AITokenUsageTotals | null | undefined,
): AITokenUsageTotals {
  if (!part) return acc;
  const promptTokens = acc.promptTokens + (part.promptTokens || 0);
  const completionTokens =
    acc.completionTokens + (part.completionTokens || 0);
  const totalTokens =
    part.totalTokens > 0
      ? acc.totalTokens + part.totalTokens
      : promptTokens + completionTokens;
  return { promptTokens, completionTokens, totalTokens };
}

/** 与向量分块 estimateTokens 一致：中文约 1.5 字符 / token */
export function estimateTextTokens(text: string): number {
  if (!text) return 0;
  return Math.max(1, Math.ceil(text.length / 1.5));
}

/** 按字符数估算 token（勿对数字做 String(chars) 再估，否则会严重偏小） */
export function estimateCharCountTokens(charCount: number): number {
  if (charCount <= 0) return 0;
  return Math.max(1, Math.ceil(charCount / 1.5));
}

/**
 * 阅读助手单轮对话 token 粗估（含多轮 tool + ragContext 二次送入上下文）。
 * 仅为参考，实际以 API usage 为准。
 */
export function estimateAgentTurnTokens(opts: {
  systemContent: string;
  /** 已写入线程、将送入模型的 API 消息（不含 system） */
  historyJsonCharCount: number;
  maxCompletionTokens: number;
  ragEnabled: boolean;
}): AITokenUsageTotals {
  const systemTokens = estimateTextTokens(opts.systemContent);
  const historyTokens = estimateCharCountTokens(opts.historyJsonCharCount);

  const toolsRoundTokens = 2000;
  const toolResultTokens = opts.ragEnabled ? 2800 : 0;

  const secondRoundPromptTokens = Math.round(
    (systemTokens + historyTokens + toolsRoundTokens) * 0.45,
  );

  const promptTokens =
    systemTokens +
    historyTokens +
    toolsRoundTokens +
    secondRoundPromptTokens +
    toolResultTokens;

  const completionTokens = Math.min(
    opts.maxCompletionTokens,
    Math.max(256, Math.floor(opts.maxCompletionTokens * 0.12)),
  );

  return {
    promptTokens,
    completionTokens,
    totalTokens: promptTokens + completionTokens,
  };
}

export function extractUsageFromChatJson(
  json: unknown,
): AITokenUsageTotals | null {
  if (!json || typeof json !== "object") return null;
  const u = (json as Record<string, unknown>).usage;
  if (!u || typeof u !== "object") return null;
  const usage = u as Record<string, unknown>;
  const promptTokens =
    typeof usage.prompt_tokens === "number" ? usage.prompt_tokens : 0;
  const completionTokens =
    typeof usage.completion_tokens === "number" ? usage.completion_tokens : 0;
  let totalTokens =
    typeof usage.total_tokens === "number" ? usage.total_tokens : 0;
  if (totalTokens <= 0) totalTokens = promptTokens + completionTokens;
  if (promptTokens <= 0 && completionTokens <= 0 && totalTokens <= 0) {
    return null;
  }
  return { promptTokens, completionTokens, totalTokens };
}

export function formatTokenCount(n: number): string {
  return Math.max(0, Math.round(n)).toLocaleString("zh-CN");
}

export function formatTokenUsageEstimateLine(
  usage: AITokenUsageTotals,
  ragEnabled: boolean,
): string {
  // const tail = ragEnabled
  //   ? "；含工具调用或超长章节需分段压缩时可能更高"
  //   : "；含多轮对话与工具时可能更高";
  const tail = ragEnabled ? "" : "";
  return `预计消耗 Token：${formatTokenCount(usage.totalTokens)}（输入 ${formatTokenCount(usage.promptTokens)}，输出 ${formatTokenCount(usage.completionTokens)}${tail}）`;
}

export function formatTokenUsageActualLine(
  usage: AITokenUsageTotals,
  available: boolean,
): string {
  if (!available) {
    return "未能从模型服务获取本次 token 用量（请确认接口支持 usage / stream_options.include_usage）";
  }
  return `本次对话消耗 Token：${formatTokenCount(usage.totalTokens)}（输入 ${formatTokenCount(usage.promptTokens)}，输出 ${formatTokenCount(usage.completionTokens)}）`;
}
