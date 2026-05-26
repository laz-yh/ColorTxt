<script setup lang="ts">
import type { AITokenPricePerMillion } from "@shared/aiTypes";
import type { AITokenUsageTotals } from "@shared/aiTokenUsage";
import { formatTokenUsageActualLine } from "@shared/aiTokenUsage";

defineProps<{
  usage: AITokenUsageTotals;
  available: boolean;
  tokenPricePerMillion?: AITokenPricePerMillion | null;
}>();
</script>

<template>
  <p class="aiTokenUsageBanner" role="status" aria-live="polite">
    {{
      formatTokenUsageActualLine(usage, available, tokenPricePerMillion ?? null)
    }}
  </p>
</template>
<style scoped>
.aiTokenUsageBanner {
  margin: 0;
  font-size: 12px;
  padding: 8px;
  border-radius: 6px;
  line-height: 1.45;
  white-space: pre-wrap;
  background: var(--info-bg);
  border: 1px solid var(--info-border);
  color: var(--info);
}
</style>
