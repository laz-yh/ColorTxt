<script setup lang="ts">
import type { StyleValue } from "vue";
import HexColorPickerField from "./HexColorPickerField.vue";
import SwitchToggle from "./SwitchToggle.vue";
import {
  isReaderSurfaceOptionalColorKey,
  READER_SURFACE_LABELS,
  READER_SURFACE_TABLE_ROWS,
  type ReaderSurfaceColorEnabled,
  type ReaderSurfaceOptionalColorKey,
  type ReaderSurfacePalette,
} from "../constants/appUi";

defineProps<{
  displaySurface: ReaderSurfacePalette;
  editingSurface: ReaderSurfacePalette;
  colorEnabled: ReaderSurfaceColorEnabled;
  previewBoxStyle: StyleValue;
}>();

const emit = defineEmits<{
  "update-surface-key": [key: keyof ReaderSurfacePalette, color: string];
  "update-color-enabled": [key: ReaderSurfaceOptionalColorKey, enabled: boolean];
  "draft-hex": [key: keyof ReaderSurfacePalette, hex: string];
  "draft-end": [];
}>();

function switchAriaLabel(key: ReaderSurfaceOptionalColorKey): string {
  return `${READER_SURFACE_LABELS[key]}独立配色`;
}
</script>

<template>
  <div class="colorSchemeReader" role="tabpanel">
    <div class="readerPalettePreview" :style="previewBoxStyle">
      <p class="readerPalettePreviewP">
        <span :style="{ color: displaySurface.chapterTitle }">第6章 实力测试</span>
      </p>
      <p class="readerPalettePreviewP">
        <span class="readerPalettePreviewIndent">　　</span>
        <span :style="{ color: displaySurface.txtrSpecialMarker }"
          >＊＊＊＊＊＊＊＊＊＊</span
        >
      </p>
      <p class="readerPalettePreviewP">
        <span class="readerPalettePreviewIndent">　　</span>
        <span :style="{ color: displaySurface.bodyText }">可靠</span>
        <span :style="{ color: displaySurface.txtrPunctuation }">《</span>
        <span :style="{ color: displaySurface.txtrBracketInner }">九重雷刀</span>
        <span :style="{ color: displaySurface.txtrPunctuation }">》</span>
        <span :style="{ color: displaySurface.bodyText }">发力方法</span>
        <span :style="{ color: displaySurface.txtrPunctuation }">，</span>
        <span :style="{ color: displaySurface.bodyText }">却达到初级战将级</span>
        <span :style="{ color: displaySurface.txtrPunctuation }">，</span>
        <span :style="{ color: displaySurface.bodyText }">而且是远超底线</span>
        <span :style="{ color: displaySurface.txtrNumber }">8000</span>
        <span :style="{ color: displaySurface.txtrEnglish }">kg</span>
        <span :style="{ color: displaySurface.txtrPunctuation }">。</span>
      </p>
      <p class="readerPalettePreviewP">
        <span class="readerPalettePreviewIndent">　　</span>
        <span :style="{ color: displaySurface.txtrPunctuation }">“</span>
        <span :style="{ color: displaySurface.txtrQuoteInner }"
          >最后测试一下神经反应速度。</span
        >
        <span :style="{ color: displaySurface.txtrPunctuation }">”</span>
      </p>
    </div>

    <div class="schemePanelTableScroll">
      <table class="colorSchemeTable">
        <colgroup>
          <col class="colorSchemeColLabel" />
          <col class="colorSchemeColValue" />
          <col class="colorSchemeColLabel" />
          <col class="colorSchemeColValue" />
        </colgroup>
        <tbody>
          <tr v-for="(row, rowIdx) in READER_SURFACE_TABLE_ROWS" :key="rowIdx">
            <template v-if="row.length === 2">
              <td class="colorSchemeRowLabel">
                <div class="colorSchemeRowLabelInner">
                  <SwitchToggle
                    v-if="isReaderSurfaceOptionalColorKey(row[0])"
                    :model-value="colorEnabled[row[0]]"
                    size="sm"
                    :aria-label="switchAriaLabel(row[0])"
                    @update:model-value="
                      emit('update-color-enabled', row[0], $event)
                    "
                  />
                  <span
                    v-else
                    class="colorSchemeSwitchSpacer"
                    aria-hidden="true"
                  />
                  <span>{{ READER_SURFACE_LABELS[row[0]] }}</span>
                </div>
              </td>
              <td>
                <HexColorPickerField
                  class="colorSchemePicker"
                  :class="{
                    'colorSchemePicker--off':
                      isReaderSurfaceOptionalColorKey(row[0]) &&
                      !colorEnabled[row[0]],
                  }"
                  :disabled="
                    isReaderSurfaceOptionalColorKey(row[0]) &&
                    !colorEnabled[row[0]]
                  "
                  :model-value="editingSurface[row[0]]"
                  @update:model-value="
                    emit('update-surface-key', row[0], $event)
                  "
                  @draft-hex="emit('draft-hex', row[0], $event)"
                  @draft-end="emit('draft-end')"
                />
              </td>
              <td class="colorSchemeRowLabel">
                <div class="colorSchemeRowLabelInner">
                  <SwitchToggle
                    v-if="isReaderSurfaceOptionalColorKey(row[1])"
                    :model-value="colorEnabled[row[1]]"
                    size="sm"
                    :aria-label="switchAriaLabel(row[1])"
                    @update:model-value="
                      emit('update-color-enabled', row[1], $event)
                    "
                  />
                  <span
                    v-else
                    class="colorSchemeSwitchSpacer"
                    aria-hidden="true"
                  />
                  <span>{{ READER_SURFACE_LABELS[row[1]] }}</span>
                </div>
              </td>
              <td>
                <HexColorPickerField
                  class="colorSchemePicker"
                  :class="{
                    'colorSchemePicker--off':
                      isReaderSurfaceOptionalColorKey(row[1]) &&
                      !colorEnabled[row[1]],
                  }"
                  :disabled="
                    isReaderSurfaceOptionalColorKey(row[1]) &&
                    !colorEnabled[row[1]]
                  "
                  :model-value="editingSurface[row[1]]"
                  @update:model-value="
                    emit('update-surface-key', row[1], $event)
                  "
                  @draft-hex="emit('draft-hex', row[1], $event)"
                  @draft-end="emit('draft-end')"
                />
              </td>
            </template>
            <template v-else>
              <td class="colorSchemeRowLabel">
                <div class="colorSchemeRowLabelInner">
                  <span class="colorSchemeSwitchSpacer" aria-hidden="true" />
                  <span>{{ READER_SURFACE_LABELS[row[0]] }}</span>
                </div>
              </td>
              <td>
                <HexColorPickerField
                  :model-value="editingSurface[row[0]]"
                  @update:model-value="
                    emit('update-surface-key', row[0], $event)
                  "
                  @draft-hex="emit('draft-hex', row[0], $event)"
                  @draft-end="emit('draft-end')"
                />
              </td>
              <td colspan="2" class="colorSchemeTablePadCell" />
            </template>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.readerPalettePreview {
  margin-bottom: 8px;
  padding: 14px 16px;
  border: 1px solid var(--border);
  white-space: pre-wrap;
  word-break: break-word;
}

.readerPalettePreviewP {
  margin: 0;
}

.readerPalettePreviewIndent {
  color: var(--fg);
}

.colorSchemeTable {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
  table-layout: fixed;
}

.colorSchemeTable col.colorSchemeColLabel {
  width: 30%;
}

.colorSchemeTable col.colorSchemeColValue {
  width: 20%;
}

.colorSchemeTable td {
  padding: 8px 10px;
  text-align: left;
  border-bottom: 1px solid var(--border);
  vertical-align: middle;
}

.colorSchemeTable tbody tr:last-child td {
  border-bottom: none;
}

.colorSchemeTablePadCell {
  padding: 0;
}

.colorSchemeRowLabel {
  font-weight: normal;
  color: var(--fg);
}

.colorSchemeTable .colorSchemeRowLabel {
  white-space: nowrap;
}

.colorSchemeRowLabelInner {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

/* 与 SwitchToggle size="sm" 轨道同宽，无开关项用于对齐标签文字 */
.colorSchemeSwitchSpacer {
  flex: 0 0 32px;
  width: 32px;
}

.colorSchemePicker {
  flex: 0 0 auto;
}

.colorSchemePicker--off {
  opacity: 0.45;
}

.colorSchemeReader {
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
  min-height: 0;
}

.schemePanelTableScroll {
  overflow-x: hidden;
  overflow-y: auto;
  max-height: min(50vh, 420px);
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--bg);
}
</style>
