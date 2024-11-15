<script setup lang="ts">
import UploadSvgIcon from '@/assets/icons/upload.svg'
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

defineProps<{ isOver: boolean }>()
defineEmits<{
  (e: 'change', event: Event): void
}>()

const fileInput = ref<HTMLInputElement | null>(null)
</script>

<template>
  <div @click="fileInput?.click" :class="['input-box', isOver ? 'over-dropzone' : '']">
    <h4 class="flex items-center">
      <UploadSvgIcon style="width: 20px; margin-right: 8px" /> {{ t('files.upload-modal.file-drop-area-label') }}
    </h4>
    <input ref="fileInput" accept="application/pdf" type="file" hidden @change="$emit('change', $event)" multiple />
  </div>
</template>

<style lang="scss" scoped>
.input-box {
  padding: 20px;
  min-height: 16vh;
  display: grid;
  place-items: center;
  border: 2px dashed var(--color-light-grey);
  border-radius: 5px;
  margin-bottom: 5px;
  cursor: pointer;
  transition: all 0.1s ease-in-out;

  &.over-dropzone {
    border: 3px dashed var(--color-dark-grey);
    color: var(--color-text-dark) !important;
  }

  &.over-dropzone :deep(g) {
    stroke: var(--color-dark-grey);
  }

  h4 {
    margin: 0;
  }
}
</style>
