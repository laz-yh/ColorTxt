<script setup lang="ts">
export type AiIndexProgressPhase =
  | "chunking"
  | "embedding"
  | "indexing"
  | "error";

defineProps<{
  phase: AiIndexProgressPhase;
  embedCurrent?: number;
  embedTotal?: number;
  errorText?: string;
}>();
</script>

<template>
  <p
    v-if="phase === 'error'"
    class="aiIndexProgressBanner aiIndexProgressBanner--error"
    role="alert"
  >
    索引失败：{{ errorText }}
  </p>
  <p
    v-else
    class="aiIndexProgressBanner"
    role="status"
    aria-live="polite"
  >
    <template v-if="phase === 'chunking'">正在分块…</template>
    <template v-else-if="phase === 'embedding'">
      正在向量化 {{ embedCurrent }} / {{ embedTotal }} …
    </template>
    <template v-else>正在写入索引…</template>
  </p>
</template>

<style scoped>
.aiIndexProgressBanner {
  margin: 0;
  font-size: 12px;
  padding: 8px;
  border-radius: 6px;
  line-height: 1.45;
  white-space: pre-wrap;
  background: color-mix(in srgb, var(--accent) 12%, transparent);
  color: var(--fg);
}

.aiIndexProgressBanner--error {
  background: color-mix(in srgb, #f44 15%, transparent);
}
</style>
