<script setup lang="ts">
import { onUnmounted, ref } from 'vue'
import { useConversationsStore } from '@/stores/conversations'
import { useI18n } from 'vue-i18n'
import { useFilesStore } from '@/stores/files'
import ActionButton from '@/components/ActionButton.vue'
import DropZone from '@/components/files/DropZone.vue'
import DatePicker from '@/components/DatePicker.vue'
import type { ModelValue } from '@vuepic/vue-datepicker'
import { useDropZone } from '@vueuse/core'

const { t } = useI18n()
// Stores
useConversationsStore()
const filesStore = useFilesStore()

const emit = defineEmits<{
  (e: 'confirm'): void
  (e: 'close'): void
}>()

const date = ref<ModelValue>()

function handleFileChange(event: Event) {
  const fileList = (event.target as HTMLInputElement).files
  if (fileList) {
    for (let i = 0; i < fileList.length; i++) {
      filesStore.filesToUpload.push({
        file: fileList[i],
        name: fileList[i].name,
        size: fileList[i].size,
        uploaded: false
      })
    }
  }
  // Reset the input value to allow selecting the same file again
  ;(event.target as HTMLInputElement).value = ''
}

function onDrop(files: File[] | null) {
  if (files) {
    for (let i = 0; i < files.length; i++) {
      filesStore.filesToUpload.push({
        file: files[i],
        name: files[i].name,
        size: files[i].size,
        uploaded: false
      })
    }
  }
}

function formatFileSize(size: number) {
  const units = ['B', 'KB', 'MB', 'GB']
  let index = 0

  while (size >= 1024 && index < units.length - 1) {
    size /= 1024
    index++
  }

  return `${size.toFixed(2)} ${units[index]}`
}

function removeFile(index: number) {
  filesStore.filesToUpload.splice(index, 1)
}

onUnmounted(() => {
  filesStore.filesToUpload = []
})

// Drag & Drop
const { isOverDropZone } = useDropZone(window.document.body, {
  onDrop,
  // specify the types of data to be received.
  dataTypes: ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
})
</script>

<template>
  <div class="file-input-box">
    <div class="wrapper-file-input">
      <DropZone :isOver="isOverDropZone" @change="handleFileChange" data-testId="file-upload-zone"/>
      <div class="below-drop-zone">
        <small>
          {{ t('files.upload-modal.restrictions-label-file-types') }}<br />
          {{ t('files.upload-modal.restrictions-label-file-size') }}
        </small>
        <DatePicker
          v-model="date"
          :timePicker="true"
          class="date-picker"
          :minDate="new Date()"
          placeholder="Ablaufdatum"
        />
      </div>
    </div>

    <div class="wrapper-file-section">
      <div class="selected-files" v-if="filesStore.filesToUpload.length">
        <h5>{{ t('files.upload-modal.selected-files-label') }}</h5>
        <ul class="file-list" :style="filesStore.filesToUpload.length ? 'max-height:220px' : 'height:auto'">
          <transition-group name="fade">
            <li
              v-for="(f, index) in filesStore.filesToUpload"
              :class="['item', f.uploaded ? 'uploaded' : '']"
              :key="f.name"
            >
              <span class="name"> {{ f.name }} ({{ formatFileSize(f.size) }}) </span>
              <ActionButton icon="delete" @click="removeFile(index)" />
            </li>
          </transition-group>
        </ul>
      </div>
    </div>
    <div class="button-section">
      <button class="tsai-button secondary" @click="emit('close')" role="button">
        {{ t('files.upload-modal.cancel-action') }}
      </button>
      <button
        class="tsai-button primary"
        @click="() => filesStore.uploadFiles(date).then(() => $emit('close'))"
        role="button"
        :disabled="filesStore.isUploading || filesStore.filesToUpload.length === 0"
      >
        {{ filesStore.isUploading ? t('files.upload-modal.uploading-label') : t('files.upload-modal.upload-label') }}
      </button>
    </div>
  </div>
</template>

<style scoped lang="scss">
::-webkit-scrollbar {
  width: 4px;
  height: 6px;
}

::-webkit-scrollbar-track {
  -webkit-box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.2);
  border-radius: 10px;
}

::-webkit-scrollbar-thumb {
  -webkit-box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.4);
  background-color: var(--color-files-scrollbar);
  border-radius: 10px;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease-in-out;
}

.fade-enter,
.fade-leave-to {
  opacity: 0;
}

.file-input-box {
  display: flex;
  flex-direction: column;
  border-radius: 10px;
  margin-top: 16px;
  //box-shadow: 0 5px 10px 0 rgba(0, 0, 0, 0.2);
  min-width: 600px;
  height: auto;
  background-color: var(--color-background);
  //padding: 10px;
}

.file-list {
  overflow-y: auto;
  list-style-type: none;
  padding: 0;
  transition: 0.3s all ease-in-out;
  margin: 0 0 8px 0;
}

.item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border: 1px solid var(--color-light-grey);
  border-radius: 5px;
  padding: 10px;
  font-size: 14px;

  &:not(:last-child) {
    margin-bottom: 5px;
  }
}

.uploaded {
  border-color: var(--color-file-uploaded);
}

small {
  display: inline-block;
  font-size: 12px;
  line-height: 1.6;
  color: var(--color-files-size-grey);
  margin-top: 6px;
}

h5 {
  margin: 4px 0;
}

.below-drop-zone {
  display: flex;
  flex-direction: row;
  justify-content: space-between;

  .date-picker {
    margin: 10px 0;
  }
}

@media screen and (max-width: 700px) {
  .file-input-box {
    min-width: 0;
  }
  .button-section {
    margin: 0 auto !important;
  }
}

@media screen and (max-width: 370px) {
  .date-picker {
    width: 100%;
  }
}
</style>
