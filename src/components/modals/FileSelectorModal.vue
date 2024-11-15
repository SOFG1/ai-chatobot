<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { VueFinalModal } from 'vue-final-modal'
import { useFilesStore } from '@/stores/files'
import FileSelector from '@/components/form/FileSelector.vue'

interface Props {
  title?: string
  preselectedFiles?: string[]
  onConfirm?: (files: File[]) => void
  onClose?: () => void
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'confirm', files: string[]): void
  (e: 'close'): void
}>()

const filesStore = useFilesStore()
filesStore.fetchFiles()

const selectedFiles = ref<string[]>([...(props.preselectedFiles || [])])
const changesHistory = ref<string[][]>([]) //Store history for ctrl+z restoration

const handleChange = (val: string[]) => {
  changesHistory.value = changesHistory.value.slice(0, 10) // Store only last 10 changes
  changesHistory.value.push(selectedFiles.value)
  selectedFiles.value = val
}

const handleConfirm = () => {
  emit('confirm', selectedFiles.value)
}

const handleBackward = (e: KeyboardEvent) => {
  //on CTRL+Z
  if (e.ctrlKey && e.keyCode === 90 && changesHistory.value.at(-1)) {
    selectedFiles.value = changesHistory.value.at(-1)
    changesHistory.value.pop()
  }
}

onMounted(() => document.addEventListener('keydown', handleBackward))
onUnmounted(() => document.removeEventListener('keydown', handleBackward))
</script>

<template>
  <VueFinalModal
    class="final-modal"
    content-class="final-modal-content"
    overlay-transition="vfm-fade"
    content-transition="vfm-fade"
  >
    <button class="final-modal-close" @click="$emit('close')" />
    <div class="content">
      <h1>{{ title }}</h1>
      <slot />

      <FileSelector @update:model-value="handleChange" :model-value="selectedFiles" />
      <div class="button-section">
        <button class="tsai-button secondary" @click="emit('close')" role="button">Abbrechen</button>
        <button class="tsai-button primary" @click="handleConfirm" role="button">Verbinden</button>
      </div>
    </div>
  </VueFinalModal>
</template>

<style lang="scss" scoped>
.content {
  max-width: 980px;

  .file-selector {
    margin: 10px 0;

    .sidebar {
      overflow: auto;
    }

    .content {
      overflow: auto;
    }
  }
}

h1 {
  font-size: 1.375rem;
}

.file-selector {
  margin: 10px 0;
}
</style>
