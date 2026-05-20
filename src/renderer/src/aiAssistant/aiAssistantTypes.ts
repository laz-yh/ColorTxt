export type UiToolEntry = {
  id: string;
  toolCallId: string;
  name: string;
  argsPreview: string;
  status: "running" | "done" | "error";
  preview: string;
  full: string;
  open: boolean;
  /** 工具执行中：折叠标题（简短） */
  progressTitle?: string;
  /** 工具执行中：折叠正文（可含换行） */
  progressMessage?: string;
};

/** 思考块：未封存 =「正在思考…」+ 脉冲；封存后 =「思考过程」+ 大脑 */
export type UiThinkSegment = {
  kind: "think";
  sealed: boolean;
  text: string;
  open: boolean;
};

export type UiToolRefSegment = {
  kind: "toolRef";
  toolCallId: string;
};

export type UiAssistantSegment = UiThinkSegment | UiToolRefSegment;

export type UiUserMsg = {
  id: string;
  role: "user";
  content: string;
  aborted?: boolean;
  createdAt?: number;
  error?: boolean;
  errorDetail?: string;
};

export type UiAssistantMsg = {
  id: string;
  role: "assistant";
  /** 交错排列：思考 ↔ 工具，保证工具后再出现「正在思考」 */
  segments: UiAssistantSegment[];
  tools: UiToolEntry[];
  answer: string;
  aborted?: boolean;
  createdAt?: number;
  error?: boolean;
  errorDetail?: string;
  /** 流式进行中，尚未落库刷新 */
  agentLive?: boolean;
};

/** 仅界面展示：建索引 / 向量化进度，不入库；插在列表末尾随滚动 */
/** 本轮对话 token 预估（仅 live，不落库） */
export type UiTokenEstimateMsg = {
  id: string;
  role: "tokenEstimate";
  requestId: number;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  ragEnabled: boolean;
};

/** 本轮对话 token 实际消耗（live 或自 DB payload 还原） */
export type UiTokenUsageMsg = {
  id: string;
  role: "tokenUsage";
  requestId: number;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  available: boolean;
};

export type UiIndexBannerMsg =
  | {
      id: "__indexBanner";
      role: "indexBanner";
      phase: "chunking" | "embedding" | "indexing";
      embedCurrent: number;
      embedTotal: number;
    }
  | {
      id: "__indexBanner";
      role: "indexBanner";
      phase: "error";
      errorText: string;
    };

export type UiMsg =
  | UiUserMsg
  | UiAssistantMsg
  | UiTokenEstimateMsg
  | UiTokenUsageMsg
  | UiIndexBannerMsg;

export type UiRenderSegRow =
  | { rowKind: "think"; think: UiThinkSegment; segIdx: number }
  | { rowKind: "tool"; tool: UiToolEntry; segIdx: number };

export type AiThreadListRow = {
  id: string;
  title: string;
  updatedAt: number;
  /** 用户手动改过标题后不再首条智能起名 */
  titleLocked: boolean;
};

export type AiHistoryThreadGroup = {
  dayKey: string;
  label: string;
  threads: AiThreadListRow[];
};

export type DbMsgRow = Awaited<
  ReturnType<typeof window.colorTxt.ai.messageList>
>[number];
