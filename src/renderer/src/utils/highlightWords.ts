import type { HighlightWord, HighlightWordsByIndex } from "../stores/fileMetaStore";

export type HighlightListTerm = {
  /** 侧栏展示与正文查找（只读转换后可能与 `storedText` 不同） */
  text: string;
  /** 持久化词表中的原文（删除/收藏等操作用） */
  storedText: string;
  color: string;
  colorIndex: number;
  /** 已收藏 = 全局词表；未收藏 = 当前文件词表 */
  scope: "global" | "book";
  isFavorited: boolean;
  /** 当前文件中该词的出现次数 */
  matchCount: number;
  /** 是否为正则表达式 */
  isRegex: boolean;
};

const MAX_HIGHLIGHT_TERM_LEN = 100;

function trimWord(w: HighlightWord): HighlightWord | undefined {
  const text = w.text.trim();
  if (!text) return undefined;
  if (text.length > MAX_HIGHLIGHT_TERM_LEN) {
    const trimmed = text.slice(0, MAX_HIGHLIGHT_TERM_LEN);
    return { text: trimmed, isRegex: w.isRegex };
  }
  return { text, isRegex: w.isRegex };
}

function wordText(w: HighlightWord): string {
  return w.text;
}

function removeWordFromMap(
  map: HighlightWordsByIndex,
  word: HighlightWord,
): boolean {
  const txt = wordText(word);
  let changed = false;
  for (const k of Object.keys(map)) {
    const prevList = map[k]!;
    const next = prevList.filter((w) => wordText(w) !== txt);
    if (next.length !== prevList.length) changed = true;
    if (next.length === 0) delete map[k];
    else map[k] = next;
  }
  return changed;
}

/** 将词归到指定高亮色索引；先从所有桶移除同一词，再写入目标桶 */
export function assignHighlightTermToColorMap(
  map: HighlightWordsByIndex | undefined,
  colorIndex: number,
  word: HighlightWord,
): HighlightWordsByIndex | undefined {
  const trimmed = trimWord(word);
  if (!trimmed || colorIndex < 0 || !Number.isFinite(colorIndex)) return map;
  const base = { ...(map ?? {}) };
  removeWordFromMap(base, trimmed);
  const targetKey = String(Math.floor(colorIndex));
  const list = [...(base[targetKey] ?? [])];
  if (!list.some((w) => wordText(w) === wordText(trimmed))) list.push(trimmed);
  base[targetKey] = list;
  return base;
}

export function removeHighlightTermFromMap(
  map: HighlightWordsByIndex | undefined,
  word: HighlightWord,
): HighlightWordsByIndex | undefined {
  const trimmed = trimWord(word);
  if (!trimmed || !map) return map;
  const base = { ...map };
  if (!removeWordFromMap(base, trimmed)) return map;
  return Object.keys(base).length > 0 ? base : undefined;
}

export function termExistsInHighlightMap(
  map: HighlightWordsByIndex | undefined,
  word: HighlightWord,
): boolean {
  const trimmed = trimWord(word);
  if (!trimmed || !map) return false;
  return Object.values(map).some((words) =>
    words.some((w) => wordText(w) === wordText(trimmed)),
  );
}

export function findHighlightColorIndexInMap(
  map: HighlightWordsByIndex | undefined,
  word: HighlightWord,
): number | null {
  const trimmed = trimWord(word);
  if (!trimmed || !map) return null;
  for (const [k, words] of Object.entries(map)) {
    if (!words.some((w) => wordText(w) === wordText(trimmed))) continue;
    const idx = Number.parseInt(k, 10);
    if (Number.isFinite(idx) && idx >= 0) return idx;
  }
  return null;
}

/** 从全局或本书词表中查找完整 HighlightWord 对象（优先全局词） */
export function findHighlightWordInMaps(
  globalMap: HighlightWordsByIndex | undefined,
  bookMap: HighlightWordsByIndex | undefined,
  text: string,
): HighlightWord | undefined {
  const maps = [globalMap, bookMap];
  for (const map of maps) {
    if (!map) continue;
    for (const bucket of Object.values(map)) {
      const found = bucket.find((w) => w.text === text);
      if (found) return found;
    }
  }
  return undefined;
}

/** 查找词并返回完整的 HighlightWord 对象，若未找到则返回默认对象 */
export function findHighlightWordWithDefault(
  globalMap: HighlightWordsByIndex | undefined,
  bookMap: HighlightWordsByIndex | undefined,
  text: string,
  defaultWord?: HighlightWord,
): HighlightWord {
  const found = findHighlightWordInMaps(globalMap, bookMap, text);
  return found ?? defaultWord ?? { text: text.trim() };
}

/**
 * 合并全局与本书词表供 Monarch 上色：同一词本书颜色优先。
 */
export function mergeHighlightWordsByIndex(
  global: HighlightWordsByIndex | undefined,
  book: HighlightWordsByIndex | undefined,
): HighlightWordsByIndex | undefined {
  if (!global && !book) return undefined;
  const out: HighlightWordsByIndex = {};
  if (global) {
    for (const [k, words] of Object.entries(global)) {
      out[k] = [...words];
    }
  }
  if (!book) {
    return Object.keys(out).length > 0 ? out : undefined;
  }
  for (const [k, words] of Object.entries(book)) {
    const idx = Number.parseInt(k, 10);
    if (!Number.isFinite(idx) || idx < 0) continue;
    for (const w of words) {
      if (!w.text) continue;
      removeWordFromMap(out, w);
      const key = String(idx);
      const list = [...(out[key] ?? [])];
      if (!list.some((existing) => wordText(existing) === wordText(w))) {
        list.push(w);
      }
      out[key] = list;
    }
  }
  return Object.keys(out).length > 0 ? out : undefined;
}

function expandHighlightMapToListTerms(
  map: HighlightWordsByIndex | undefined,
  scope: "global" | "book",
  colors: readonly string[],
  bodyText: string,
  toDisplayText?: (word: HighlightWord) => string,
): HighlightListTerm[] {
  if (!map) return [];
  const isFavorited = scope === "global";
  const out: HighlightListTerm[] = [];
  for (const [idxKey, terms] of Object.entries(map)) {
    const idx = Number.parseInt(idxKey, 10);
    if (!Number.isFinite(idx) || idx < 0) continue;
    const color = idx < colors.length ? colors[idx]! : bodyText;
    for (const word of terms) {
      if (!word.text) continue;
      const text = toDisplayText?.(word) ?? word.text;
      out.push({
        text,
        storedText: word.text,
        color,
        colorIndex: idx,
        scope,
        isFavorited,
        matchCount: 0,
        isRegex: word.isRegex === true,
      });
    }
  }
  return out;
}

/** 侧栏列表：已收藏（全局）在前，未收藏（本书）在后 */
export function buildHighlightListTerms(
  global: HighlightWordsByIndex | undefined,
  book: HighlightWordsByIndex | undefined,
  colors: readonly string[],
  bodyText: string,
  toDisplayText?: (word: HighlightWord) => string,
): HighlightListTerm[] {
  return [
    ...expandHighlightMapToListTerms(
      global,
      "global",
      colors,
      bodyText,
      toDisplayText,
    ),
    ...expandHighlightMapToListTerms(
      book,
      "book",
      colors,
      bodyText,
      toDisplayText,
    ),
  ];
}
