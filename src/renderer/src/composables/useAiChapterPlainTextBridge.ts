import { onMounted, onBeforeUnmount, type Ref } from "vue";
import type { Chapter } from "../chapter";
import {
  getChapterPlainTextByIndex,
  type ReaderLinesSource,
} from "../utils/currentChapterPlainText";
import type ReaderMain from "../components/ReaderMain.vue";

const CHAPTER_PLAIN_HARD_CAP = 512_000;

/**
 * 响应主进程 ragContext：按章节索引返回阅读器展示层正文切片。
 */
export function useAiChapterPlainTextBridge(
  readerMainRef: Ref<InstanceType<typeof ReaderMain> | null>,
  chapters: Ref<Chapter[]>,
): void {
  let offRequest: (() => void) | undefined;

  onMounted(() => {
    offRequest = window.colorTxt.onChapterPlainRequest((payload) => {
      const reader = readerMainRef.value as unknown as ReaderLinesSource | null;
      const max =
        typeof payload.maxChars === "number" && payload.maxChars > 0
          ? Math.min(payload.maxChars, CHAPTER_PLAIN_HARD_CAP)
          : CHAPTER_PLAIN_HARD_CAP;
      const text = getChapterPlainTextByIndex(
        reader,
        chapters.value,
        payload.chapterIndex,
        max,
      );
      window.colorTxt.replyChapterPlainText(payload.replyChannel, text);
    });
  });

  onBeforeUnmount(() => {
    offRequest?.();
    offRequest = undefined;
  });
}
