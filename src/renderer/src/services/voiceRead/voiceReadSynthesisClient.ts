import type { VoiceReadEmotionId } from "@shared/voiceReadEmotion";
import type { VoiceReadSettings } from "../../constants/voiceRead";
import type { VoiceReadSynthesisRequest } from "@shared/voiceReadSynthesis";
import type { VoiceReadSynthesizeIpcResult } from "@shared/voiceReadSynthesisIpc";
import {
  VOICE_READ_IPC_HEALTH_CHECK,
  VOICE_READ_IPC_LIST_VOICES,
  VOICE_READ_IPC_SYNTHESIZE,
} from "@shared/voiceReadSynthesisIpc";
import type { VoiceReadEngineConfig } from "@shared/voiceReadEngineConfig";
import type { VoiceReadEngineId } from "@shared/voiceReadEngines";
import {
  toPlainVoiceReadEngineConfig,
  toPlainVoiceReadHealthCheckPayload,
  toPlainVoiceReadSynthesisRequest,
} from "@shared/voiceReadIpcSerialize";

export function toVoiceReadSynthesisRequest(
  settings: VoiceReadSettings,
  text: string,
  voiceId: string,
  emotion?: VoiceReadEmotionId,
): VoiceReadSynthesisRequest {
  return toPlainVoiceReadSynthesisRequest({
    engine: settings.engine,
    text,
    voiceId,
    rate: settings.rate,
    pitch: settings.pitch,
    emotion,
    engineConfig: toPlainVoiceReadEngineConfig(
      settings.engineConfig,
      settings.dashscopeApiKey,
    ),
  });
}

export async function synthesizeVoiceReadViaIpc(
  req: VoiceReadSynthesisRequest,
  signal?: AbortSignal,
): Promise<VoiceReadSynthesizeIpcResult> {
  if (signal?.aborted) {
    return { ok: false, error: "interrupted" };
  }
  const r = (await window.colorTxt.voiceReadSynthesize(
    toPlainVoiceReadSynthesisRequest(req),
  )) as VoiceReadSynthesizeIpcResult;
  if (signal?.aborted) {
    return { ok: false, error: "interrupted" };
  }
  return r;
}

export async function listVoiceReadVoicesViaIpc(
  engine: VoiceReadEngineId,
  engineConfig: VoiceReadEngineConfig,
) {
  return window.colorTxt.voiceReadListVoices(
    toPlainVoiceReadHealthCheckPayload(engine, engineConfig),
  );
}

export async function healthCheckVoiceReadViaIpc(
  engine: VoiceReadEngineId,
  engineConfig: VoiceReadEngineConfig,
) {
  return window.colorTxt.voiceReadHealthCheck(
    toPlainVoiceReadHealthCheckPayload(engine, engineConfig),
  );
}

export {
  VOICE_READ_IPC_HEALTH_CHECK,
  VOICE_READ_IPC_LIST_VOICES,
  VOICE_READ_IPC_SYNTHESIZE,
};
