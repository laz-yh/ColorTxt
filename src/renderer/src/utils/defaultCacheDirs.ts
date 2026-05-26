import { EBOOK_CONVERT_DEFAULT_SUBDIR } from "@shared/ebookConvertPaths";
import { defaultAiDataCacheRoot, defaultBuiltinModelCacheRoot } from "@shared/aiDataPaths";
import { defaultCharacterPortraitCacheRoot } from "@shared/characterPortraitPaths";
import { joinFs } from "../ebook/pathUtils";

/**
 * 与 preload `getDefaultEbookConvertOutputDir` / `useAppPersistence` 一致：
 * 优先 preload 默认；若为空则用 `userData` + `ConvertedTxt`。
 */
export function resolveDefaultEbookConvertOutputDirSync(): string {
  try {
    const p = window.colorTxt?.getDefaultEbookConvertOutputDir?.();
    if (typeof p === "string") {
      const t = p.trim();
      if (t) return t;
    }
  } catch {
    /* ignore */
  }
  try {
    const ud = window.colorTxt?.getUserDataPath?.();
    if (typeof ud === "string") {
      const t = ud.trim();
      if (t) return joinFs(t, EBOOK_CONVERT_DEFAULT_SUBDIR);
    }
  } catch {
    /* ignore */
  }
  return "";
}

/**
 * 与 preload `getDefaultCharacterPortraitCacheDir` 一致：
 * 优先 preload 默认；若为空则用 `userData` + 默认子目录名。
 */
export function resolveDefaultCharacterPortraitCacheDirSync(): string {
  try {
    const p = window.colorTxt?.getDefaultCharacterPortraitCacheDir?.();
    if (typeof p === "string") {
      const t = p.trim();
      if (t) return t;
    }
  } catch {
    /* ignore */
  }
  try {
    const ud = window.colorTxt?.getUserDataPath?.();
    if (typeof ud === "string") {
      const t = ud.trim();
      if (t) return defaultCharacterPortraitCacheRoot(t);
    }
  } catch {
    /* ignore */
  }
  return "";
}

/**
 * 与 preload `getDefaultAiDataCacheDir` 一致：
 * 优先 preload 默认；若为空则用 `userData` + `ai/data`。
 */
export function resolveDefaultAiDataCacheDirSync(): string {
  try {
    const p = window.colorTxt?.getDefaultAiDataCacheDir?.();
    if (typeof p === "string") {
      const t = p.trim();
      if (t) return t;
    }
  } catch {
    /* ignore */
  }
  try {
    const ud = window.colorTxt?.getUserDataPath?.();
    if (typeof ud === "string") {
      const t = ud.trim();
      if (t) return defaultAiDataCacheRoot(t);
    }
  } catch {
    /* ignore */
  }
  return "";
}

/**
 * 与 preload `getDefaultBuiltinModelCacheDir` 一致：
 * 优先 preload 默认；若为空则用 `userData` + `ai/model-cache`。
 */
export function resolveDefaultBuiltinModelCacheDirSync(): string {
  try {
    const p = window.colorTxt?.getDefaultBuiltinModelCacheDir?.();
    if (typeof p === "string") {
      const t = p.trim();
      if (t) return t;
    }
  } catch {
    /* ignore */
  }
  try {
    const ud = window.colorTxt?.getUserDataPath?.();
    if (typeof ud === "string") {
      const t = ud.trim();
      if (t) return defaultBuiltinModelCacheRoot(t);
    }
  } catch {
    /* ignore */
  }
  return "";
}

export async function resolveEffectiveAiDataCacheDir(
  configured: string,
): Promise<string> {
  const trimmed = configured.trim();
  if (trimmed) return trimmed;
  const syncDefault = resolveDefaultAiDataCacheDirSync();
  if (syncDefault) return syncDefault;
  try {
    const p = await window.colorTxt?.getDefaultAiDataCacheDir?.();
    if (typeof p === "string" && p.trim()) return p.trim();
  } catch {
    /* ignore */
  }
  return "";
}

export async function resolveEffectiveBuiltinModelCacheDir(
  configured: string,
): Promise<string> {
  const trimmed = configured.trim();
  if (trimmed) return trimmed;
  const syncDefault = resolveDefaultBuiltinModelCacheDirSync();
  if (syncDefault) return syncDefault;
  try {
    const p = window.colorTxt?.getDefaultBuiltinModelCacheDir?.();
    if (typeof p === "string" && p.trim()) return p.trim();
  } catch {
    /* ignore */
  }
  return "";
}
