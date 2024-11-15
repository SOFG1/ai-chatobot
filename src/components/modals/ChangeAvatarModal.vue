<script setup lang="ts">
import { VueFinalModal } from 'vue-final-modal'
import { ref } from 'vue'

const props = defineProps<{
  title: string
  value?: string | null
}>()

const inputRef = ref<HTMLInputElement>()
const dataValue = ref<string | null | undefined>(props.value)

// Focus on input
setTimeout(() => inputRef.value?.focus(), 1)

const emit = defineEmits<{
  (e: 'confirm', newTitle: string): void
  (e: 'close'): void
}>()
</script>

<template>
  <VueFinalModal
    class="final-modal"
    content-class="final-modal-content"
    overlay-transition="vfm-fade"
    content-transition="vfm-fade"
  >
    <button class="final-modal-close" @click="$emit('close')" />
    <h1>{{ title }}</h1>
    <slot />
    <div class="form-group">
      <input
        ref="inputRef"
        type="text"
        name="text"
        class="tsai-input"
        v-model="dataValue"
        @keyup.enter="emit('confirm', dataValue!)"
      />
    </div>
    <div class="button-section">
      <button class="tsai-button secondary" @click="emit('close')" role="button">Abbrechen</button>
      <button class="tsai-button primary" @click="emit('confirm', dataValue!)" role="button">
        Änderungen speichern
      </button>
    </div>
  </VueFinalModal>
</template>

<style lang="scss" scoped>
p {
  padding: 14px 0;
}

h1 {
  font-size: 1.375rem;
}
</style>
