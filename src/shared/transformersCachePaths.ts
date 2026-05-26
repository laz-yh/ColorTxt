/** Transformers.js FSCache：HF model id `org/name` → 缓存子路径段 `['org','name']` */
export function hfModelIdToCachePathSegments(hfModelId: string): string[] {
  return hfModelId
    .trim()
    .split("/")
    .filter((s) => s.length > 0);
}
