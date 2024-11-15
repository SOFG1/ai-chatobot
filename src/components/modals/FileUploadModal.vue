<script setup lang="ts">
import FileUploadBox from '@/components/files/FileUploadBox.vue'
import { VueFinalModal } from 'vue-final-modal'

defineProps<{
  title?: string
}>()

const emit = defineEmits<{
  (e: 'confirm'): void
  (e: 'close'): void
}>()
</script>

<template>
  <VueFinalModal
    class="final-modal"
    content-class="final-modal-content file-upload-modal-content"
    overlay-transition="vfm-fade"
    content-transition="vfm-fade"
  >
    <button class="final-modal-close" @click="$emit('close')" />
    <h1>{{ title }}</h1>
    <slot />
    <FileUploadBox @confirm="emit('confirm')" @close="emit('close')" />
  </VueFinalModal>
</template>

<style lang="scss">
.file-upload-modal-content {
  max-width: 680px;

  h1 {
    font-size: 1.375rem;
  }
}
</style>
