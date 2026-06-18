import { normalizeDashscopeTtsModel } from "./voiceReadDashscopeModels";
import { normalizeMinimaxTtsModel } from "./voiceReadMinimaxModels";

/** 语音朗读引擎连接配置（主进程 / preload / renderer 对齐） */

export type VoiceReadEngineConfig = {
  dashscopeApiKey?: string;
  dashscopeModel?: string;
  minimaxApiKey?: string;
  minimaxModel?: string;
};

export const defaultVoiceReadEngineConfig = (): VoiceReadEngineConfig => ({});

function normalizeOptionalString(raw: unknown): string | undefined {
  if (typeof raw !== "string") return undefined;
  const t = raw.trim();
  return t || undefined;
}

function hasOwnStringField(
  src: Record<string, unknown>,
  key: string,
): boolean {
  return Object.prototype.hasOwnProperty.call(src, key);
}

function mergeOptionalSecretField(
  src: Record<string, unknown>,
  key: "dashscopeApiKey" | "minimaxApiKey",
  fallback?: string,
): string | undefined {
  if (hasOwnStringField(src, key)) {
    return normalizeOptionalString(src[key]);
  }
  return normalizeOptionalString(fallback);
}

export function mergeVoiceReadEngineConfig(
  raw: unknown,
  legacyDashscopeApiKey?: string,
): VoiceReadEngineConfig {
  const src =
    raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  return {
    dashscopeApiKey: mergeOptionalSecretField(
      src,
      "dashscopeApiKey",
      legacyDashscopeApiKey,
    ),
    dashscopeModel: normalizeDashscopeTtsModel(src.dashscopeModel),
    minimaxApiKey: mergeOptionalSecretField(src, "minimaxApiKey"),
    minimaxModel: normalizeMinimaxTtsModel(src.minimaxModel),
  };
}

export function engineConfigFingerprint(
  config: VoiceReadEngineConfig,
): string {
  const secretMark = (v?: string) => (v?.trim() ? `#${v.trim().length}` : "");
  return [
    secretMark(config.dashscopeApiKey),
    config.dashscopeModel?.trim() ?? "",
    secretMark(config.minimaxApiKey),
    config.minimaxModel?.trim() ?? "",
  ].join("\u0002");
}

export type VoiceReadProfileSecrets = {
  dashscopeApiKey?: string;
  minimaxApiKey?: string;
};

export function extractProfileSecrets(
  config: VoiceReadEngineConfig,
): VoiceReadProfileSecrets {
  const out: VoiceReadProfileSecrets = {};
  const d = config.dashscopeApiKey?.trim();
  if (d) out.dashscopeApiKey = d;
  const m = config.minimaxApiKey?.trim();
  if (m) out.minimaxApiKey = m;
  return out;
}

export function hydrateEngineConfigSecrets(
  config: VoiceReadEngineConfig,
  secrets: VoiceReadProfileSecrets,
): void {
  if (secrets.dashscopeApiKey) config.dashscopeApiKey = secrets.dashscopeApiKey;
  if (secrets.minimaxApiKey) config.minimaxApiKey = secrets.minimaxApiKey;
}

export function parseProfileSecretsBlob(blob: string): Record<string, VoiceReadProfileSecrets> {
  if (!blob.trim()) return {};
  try {
    const parsed = JSON.parse(blob) as unknown;
    if (!parsed || typeof parsed !== "object") return {};
    const out: Record<string, VoiceReadProfileSecrets> = {};
    for (const [profileId, value] of Object.entries(parsed)) {
      if (!profileId.trim() || !value || typeof value !== "object") continue;
      const v = value as Record<string, unknown>;
      const legacyDash = typeof v.dashscopeApiKey === "string" ? v.dashscopeApiKey : undefined;
      const legacyFlat = typeof v === "string" ? (v as string) : undefined;
      if (legacyFlat && !legacyDash) {
        out[profileId] = { dashscopeApiKey: legacyFlat.trim() };
        continue;
      }
      const secrets: VoiceReadProfileSecrets = {};
      if (typeof v.dashscopeApiKey === "string" && v.dashscopeApiKey.trim()) {
        secrets.dashscopeApiKey = v.dashscopeApiKey.trim();
      }
      if (typeof v.minimaxApiKey === "string" && v.minimaxApiKey.trim()) {
        secrets.minimaxApiKey = v.minimaxApiKey.trim();
      }
      if (Object.keys(secrets).length > 0) out[profileId] = secrets;
    }
    return out;
  } catch {
    return {};
  }
}

export function serializeProfileSecretsBlob(
  secretsByProfile: Record<string, VoiceReadProfileSecrets>,
): string {
  return JSON.stringify(secretsByProfile);
}
