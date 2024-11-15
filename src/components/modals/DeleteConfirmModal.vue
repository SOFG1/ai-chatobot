<script setup lang="ts">
import { VueFinalModal } from 'vue-final-modal'

defineProps<{
  title?: string
  text?: string
  isDeleting?: any // Ref<boolean>
  processingMessage?: string
}>()

const emit = defineEmits<{
  (e: 'confirm'): void
  (e: 'close'): void
}>()
</script>

<template>
  <VueFinalModal
    class="final-modal"
    content-class="final-modal-content"
    overlay-transition="vfm-fade"
    content-transition="vfm-fade"
    teleport-to="body"
  >
    <div class="content" data-testId="delete-modal">
      <button class="final-modal-close" @click="$emit('close')" />
      <h1>{{ title }}</h1>
      <p v-html="text"></p>
      <div class="button-section">
        <button class="tsai-button secondary" @click="emit('close')" role="button">
          {{ $t('delete-modal.cancel-action') }}
        </button>
        <button class="tsai-button danger" @click="emit('confirm')" role="button" :disabled="isDeleting">
          {{ $t('delete-modal.confirm-action') }}
        </button>
        <p v-if="isDeleting">{{ processingMessage }}</p>
      </div>
    </div>
  </VueFinalModal>
</template>

<style lang="scss" scoped>
.content {
  width: 500px;
}

p {
  word-wrap: break-word;
  padding: 14px 0;
}

h1 {
  font-size: 1.375rem;
}

@media screen and (max-width: 600px) {
  .content {
    width: 100%;
  }
}

@media screen and (max-width: 360px) {
  .button-section button {
    width: 100%;
  }
}
</style>
