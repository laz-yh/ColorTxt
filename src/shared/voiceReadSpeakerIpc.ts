import type { AITokenUsageTotals } from "./aiTokenUsage";

/** AI 对引号内文本的朗读分类 */
export type VoiceReadQuoteVoiceKind =
  | "narration"
  | "male"
  | "female"
  | "unknown";

export type VoiceReadQuoteAttribution = {
  kind: VoiceReadQuoteVoiceKind;
  speaker: string | null;
  /** AI 标注朗读情绪；auto 表示由引擎推断 */
  emotion?: import("./voiceReadEmotion").VoiceReadEmotionId;
};

export type VoiceReadAttributeSpeakersRequest = {
  line: string;
  /** 按出现顺序的引号内文本（不含引号本身） */
  dialogueTexts: string[];
  roster: { displayName: string; aliases: string[] }[];
  /** 为 true 时 AI 同时标注情绪（需引擎支持） */
  includeEmotion?: boolean;
};

export type VoiceReadAttributeSpeakersResult =
  | {
      ok: true;
      quotes: VoiceReadQuoteAttribution[];
      /** 本行引号外旁白段的整体情绪 */
      narrationEmotion?: import("./voiceReadEmotion").VoiceReadEmotionId;
      tokenUsage?: AITokenUsageTotals | null;
      tokenUsageAvailable?: boolean;
    }
  | { ok: false; error: string };
