<script setup lang="ts">
import BinIcon from '@/assets/icons/bin.svg'
import EditIcon from '@/assets/icons/edit.svg'
import UploadIcon from '@/assets/icons/upload.svg'
import PreviewIcon from '@/assets/icons/preview.svg'
import RedoUrl from '@/assets/icons/redo.svg'
import MoveIcon from '@/assets/icons/move.svg'
import { PhDownload } from '@phosphor-icons/vue'

type IconType = 'delete' | 'edit' | 'upload' | 'preview' | 'redo' | 'move' | 'download'

defineProps<{ text?: string; icon: IconType }>()
</script>

<template>
  <!-- TODO: Refactor to use dynamic component when migrated to Phosphor Icons -->
  <button>
    <UploadIcon v-if="icon === 'upload'" />
    <BinIcon v-if="icon === 'delete'" />
    <EditIcon v-if="icon === 'edit'" />
    <PreviewIcon v-if="icon === 'preview'" />
    <RedoUrl class="redo" v-if="icon === 'redo'" />
    <MoveIcon v-if="icon === 'move'" />
    <PhDownload v-if="icon === 'download'" />
    <span v-if="text">{{ text }}</span>
  </button>
</template>

<style lang="scss" scoped>
button {
  display: inline-flex;
  align-items: center;
  gap: 13px;
  padding: 0;
  border: 0;
  cursor: pointer;
  background-color: transparent;
}

button svg {
  height: 24px;
  width: 24px;
}

button:hover :deep(path) {
  stroke: var(--color-primary) !important;
  transition: 150ms;
}

button:hover :deep(.redo path) {
  stroke: none !important;
  fill: var(--color-primary);
}

span {
  font-size: 14px;
  font-weight: 600;
  font-family: 'Mulish', sans-serif;
  color: var(--color-dark-grey);
}
</style>
