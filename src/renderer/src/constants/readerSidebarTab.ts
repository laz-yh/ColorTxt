/** 阅读侧栏活动栏与面板对应的 tab id */
export type ReaderSidebarTab =
  | "files"
  | "chapters"
  | "bookmarks"
  | "highlights"
  | "notes"
  | "aiAssistant"
  | "character"
  | "search";

/** 所有合法侧栏标签页的常量数组，供 fileMetaStore 守卫/类型派生 */
export const VALID_SIDEBAR_TABS = [
  "files",
  "chapters",
  "bookmarks",
  "highlights",
  "notes",
  "aiAssistant",
  "character",
  "search",
] as const;
