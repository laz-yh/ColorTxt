import { open } from "node:fs/promises";
import iconv from "iconv-lite";
import jschardet from "jschardet";

const SAMPLE_BYTES = 64 * 1024;
/** 短样本上 chardet 统计不可靠，需结合字节结构启发式 */
const SHORT_SAMPLE_BYTES = 512;
const CHARDET_CONFIDENCE_MIN = 0.7;

const WESTERN_CHARDET_ENCODINGS = new Set([
  "ascii",
  "iso-8859-1",
  "iso-8859-2",
  "iso-8859-15",
  "windows-1250",
  "windows-1252",
  "latin1",
  "latin-1",
  "cp1252",
]);

function normalizeEncodingName(raw: string): string {
  const u = raw.trim().toLowerCase().replace(/\s+/g, "").replace(/_/g, "-");
  if (!u) return "utf8";
  if (u === "utf-8" || u === "utf8") return "utf8";
  if (u === "gb2312" || u === "gbk" || u === "gb-2312") return "gb18030";
  if (u === "utf-16le" || u === "utf-16-le") return "utf16le";
  if (u === "utf-16be" || u === "utf-16-be") return "utf16be";
  return raw.trim();
}

function encodingFromBom(sample: Buffer): string | null {
  if (
    sample.length >= 3 &&
    sample[0] === 0xef &&
    sample[1] === 0xbb &&
    sample[2] === 0xbf
  ) {
    return "utf8";
  }
  if (sample.length >= 2) {
    if (sample[0] === 0xff && sample[1] === 0xfe) return "utf16le";
    if (sample[0] === 0xfe && sample[1] === 0xff) return "utf16be";
  }
  return null;
}

function isAsciiOnly(sample: Buffer): boolean {
  for (let i = 0; i < sample.length; i++) {
    if (sample[i]! >= 0x80) return false;
  }
  return true;
}

function isValidUtf8(sample: Buffer): boolean {
  try {
    new TextDecoder("utf-8", { fatal: true }).decode(sample);
    return true;
  } catch {
    return false;
  }
}

function isGbkLead(byte: number): boolean {
  return byte >= 0x81 && byte <= 0xfe;
}

function isGbkTrail(byte: number): boolean {
  return (byte >= 0x40 && byte <= 0x7e) || (byte >= 0x80 && byte <= 0xfe);
}

/** 非 ASCII 字节是否均可按 GBK/GB18030 双字节序列解析（含尾部不完整时仍视为可能为中文 ANSI） */
function looksLikeGbkFamily(sample: Buffer): boolean {
  let i = 0;
  let hasHighByte = false;
  while (i < sample.length) {
    const b = sample[i]!;
    if (b < 0x80) {
      i++;
      continue;
    }
    hasHighByte = true;
    if (!isGbkLead(b)) return false;
    if (i + 1 >= sample.length) return true;
    if (!isGbkTrail(sample[i + 1]!)) return false;
    i += 2;
  }
  return hasHighByte;
}

function isChineseLocale(locale: string | undefined): boolean {
  const l = (locale ?? "").toLowerCase();
  return l.startsWith("zh");
}

function shouldPreferGbkFamily(
  sample: Buffer,
  chardetEncoding: string | undefined,
  confidence: number,
  locale: string | undefined,
): boolean {
  if (!looksLikeGbkFamily(sample) || isValidUtf8(sample)) return false;

  const enc = (chardetEncoding ?? "").toLowerCase().replace(/\s+/g, "");
  if (sample.length < SHORT_SAMPLE_BYTES) return true;
  if (confidence < CHARDET_CONFIDENCE_MIN) return true;
  if (enc && WESTERN_CHARDET_ENCODINGS.has(enc)) return true;
  if (isChineseLocale(locale) && enc !== "gb18030" && enc !== "gb2312" && enc !== "gbk") {
    return confidence < 0.9;
  }
  return false;
}

/**
 * 根据文件头字节推断文本编码（供 iconv-lite 解码）。
 * @param locale 可选，如 Electron `app.getLocale()`（`zh-CN`），用于低置信度时的中文 ANSI 回退。
 */
export function detectEncodingFromSample(
  sample: Buffer,
  locale?: string,
): string {
  if (sample.length === 0) return "utf8";

  const bom = encodingFromBom(sample);
  if (bom) return bom;
  if (isAsciiOnly(sample)) return "utf8";
  if (isValidUtf8(sample)) return "utf8";

  const detected = jschardet.detect(sample);
  const chardetEnc =
    typeof detected?.encoding === "string" ? detected.encoding.trim() : "";
  const confidence =
    typeof detected?.confidence === "number" ? detected.confidence : 0;

  if (
    shouldPreferGbkFamily(sample, chardetEnc || undefined, confidence, locale)
  ) {
    return "gb18030";
  }

  if (chardetEnc && confidence >= CHARDET_CONFIDENCE_MIN) {
    const normalized = normalizeEncodingName(chardetEnc);
    if (iconv.encodingExists(normalized)) return normalized;
  }

  if (chardetEnc) {
    const normalized = normalizeEncodingName(chardetEnc);
    if (iconv.encodingExists(normalized)) return normalized;
  }

  if (looksLikeGbkFamily(sample)) return "gb18030";
  return "utf8";
}

export async function detectTextFileEncoding(
  filePath: string,
  locale?: string,
): Promise<string> {
  const fd = await open(filePath, "r");
  const header = Buffer.alloc(SAMPLE_BYTES);
  const { bytesRead } = await fd.read(header, 0, header.length, 0);
  await fd.close();
  if (bytesRead === 0) return "utf8";
  return detectEncodingFromSample(header.subarray(0, bytesRead), locale);
}
