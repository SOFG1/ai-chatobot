<script setup lang="ts">
import TsaiDropdown from '@/components/form/TsaiDropdown.vue'
import { useConversationsStore } from '@/stores/conversations'
import type { DropdownOption } from '@/types/internal'
import { useI18n } from 'vue-i18n'
import axios from 'axios'
import type { LLM } from '@/types'
import { onMounted, ref } from 'vue'

const { t } = useI18n()

const llms = ref<Record<string, DropdownOption>>({})

onMounted(async () => {
  ;(await axios.get<LLM[]>('/api/llms')).data.forEach((llm) => {
    llms.value[llm.id] = { value: llm.id, label: llm.display_name }
  })
})

const conversationsStore = useConversationsStore()

const updateLLM = (v: DropdownOption | null) => {
  conversationsStore.selectedLLM = v?.value || null
}
</script>

<template>
  <TsaiDropdown
    @update:model-value="updateLLM"
    :modelValue="conversationsStore.selectedLLM ? llms[conversationsStore.selectedLLM] : llms[0]"
    :label="t('settings.llm-label')"
    :options="Object.values(llms)"
  />
  <p>
    {{ $t('settings.llm-description') }}
  </p>
</template>

<style lang="scss" scoped>
.form-group {
  margin-bottom: 6px;
  max-width: 644px;
}
p {
  color: var(--color-light-grey);
  font-family: Mulish, sans-serif;
  font-size: 12px;
  line-height: 1.2;
  max-width: 644px;
}
</style>
