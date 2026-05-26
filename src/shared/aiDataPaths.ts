/** AI 数据/模型缓存默认路径（renderer / preload 与主进程 aiPaths 对齐） */

export const AI_DATA_SUBDIR = "ai";
export const AI_DATA_CACHE_DEFAULT_SUBDIR = "data";
export const AI_MODEL_CACHE_DEFAULT_SUBDIR = "model-cache";

function joinPathSegments(...segments: string[]): string {
  const cleaned = segments
    .map((s) => s.replace(/[/\\]+$/, "").replace(/^[/\\]+/, "").trim())
    .filter(Boolean);
  if (cleaned.length === 0) return "";
  const sep = cleaned[0].includes("\\") ? "\\" : "/";
  return cleaned.join(sep);
}

export function defaultAiDataCacheRoot(userDataAbs: string): string {
  return joinPathSegments(
    userDataAbs,
    AI_DATA_SUBDIR,
    AI_DATA_CACHE_DEFAULT_SUBDIR,
  );
}

export function defaultBuiltinModelCacheRoot(userDataAbs: string): string {
  return joinPathSegments(
    userDataAbs,
    AI_DATA_SUBDIR,
    AI_MODEL_CACHE_DEFAULT_SUBDIR,
  );
}
