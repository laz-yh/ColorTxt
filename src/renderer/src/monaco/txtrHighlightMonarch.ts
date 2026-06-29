import type * as monaco from "monaco-editor";
import type { HighlightWordsByIndex } from "../stores/fileMetaStore";

/** 与装饰方案一致：更长词优先，同长则更小的高亮色索引优先 */
export type TxtrMonarchHighlightOptions = {
  enabled: boolean;
  /** 合法高亮色索引上界（与 `highlightColors.length` 一致） */
  highlightColorsLength: number;
  highlightWordsByIndex: HighlightWordsByIndex | undefined;
};

const REGEX_PREFIX = "regex:";

function escapeRegExpLiteral(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function buildHighlightPattern(phrase: string): RegExp {
  if (phrase.startsWith(REGEX_PREFIX)) {
    const pattern = phrase.slice(REGEX_PREFIX.length);
    if (!pattern) return /^$/;
    try {
      return new RegExp(pattern, "iu");
    } catch {
      return /^$/;
    }
  }
  return new RegExp(escapeRegExpLiteral(phrase), "iu");
}

function highlightPatternLength(phrase: string): number {
  if (phrase.startsWith(REGEX_PREFIX)) {
    return phrase.slice(REGEX_PREFIX.length).length;
  }
  return phrase.length;
}

/**
 * 生成自定义高亮词的 Monarch 规则（每条一词一类 token：`txtr.customHighlight.{index}`）。
 * 以 `regex:` 开头的高亮词采用正则匹配，其余走字面量匹配。
 * 与原先 `findMatches` 一致：大小写不敏感。
 */
export function buildTxtrCustomHighlightMonarchRules(
  opts: TxtrMonarchHighlightOptions,
): monaco.languages.IMonarchLanguageRule[] {
  if (
    !opts.enabled ||
    opts.highlightColorsLength <= 0 ||
    !opts.highlightWordsByIndex
  ) {
    return [];
  }

  type Entry = { pattern: RegExp; colorIndex: number; len: number };
  const entries: Entry[] = [];

  for (const [key, words] of Object.entries(opts.highlightWordsByIndex)) {
    const idx = Number.parseInt(key, 10);
    if (
      !Number.isFinite(idx) ||
      idx < 0 ||
      idx >= opts.highlightColorsLength
    ) {
      continue;
    }
    for (const phrase of words) {
      if (!phrase) continue;
      const pattern = buildHighlightPattern(phrase);
      const len = highlightPatternLength(phrase);
      entries.push({ pattern, colorIndex: idx, len });
    }
  }

  const seen = new Set<string>();
  const unique: Entry[] = [];
  for (const e of entries) {
    const k = `${e.colorIndex}\0${e.pattern.source}`;
    if (seen.has(k)) continue;
    seen.add(k);
    unique.push(e);
  }

  unique.sort((a, b) => {
    if (b.len !== a.len) return b.len - a.len;
    return a.colorIndex - b.colorIndex;
  });

  return unique.map((e) => [
    e.pattern,
    `txtr.customHighlight.${e.colorIndex}`,
  ]);
}
