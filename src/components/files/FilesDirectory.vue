<script setup lang="ts">
import { useFilesStore } from '@/stores/files'
import { useI18n } from 'vue-i18n'
import { useModal } from 'vue-final-modal'
import InTitleAddButton from '@/components/InTitleAddButton.vue'
import DirectoryItem from '@/components/files/DirectoryItem.vue'
import NameModal from '@/components/modals/NameModal.vue'
import { ref } from 'vue'
import { useDraggableFilesUtils } from '@/composables/useDraggableFilesUtils'
import { folderNameValidator } from '@/utils/folderNameValidator'

const { t } = useI18n()

const filesStore = useFilesStore()
const isDragover = ref<string | null>(null) //ID or null

const { drop } = useDraggableFilesUtils()

const createModal = useModal({
  component: NameModal,
  attrs: {
    title: t('files.folders.create-modal.title'),
    label: t('files.folders.create-modal.label'),
    placeholder: t('files.folders.create-modal.placeholder'),
    buttonText: t('files.folders.create-modal.action'),
    buttonVariant: 'primary',
    validator: folderNameValidator,
    onClose() {
      createModal.close()
    },
    onSubmit(name: string) {
      filesStore.createDirectory(name)
      createModal.close()
    }
  }
})

const handleChange = (index: number) => {
  filesStore.location = filesStore.location.slice(0, index + 1)
}

const onDrop = (e: Event, target_id: string) => {
  isDragover.value = null
  drop(e, target_id)
}

function allowDrop(ev: any) {
  ev.preventDefault()
}
</script>

<template>
  <div class="wrapper">
    <p class="directory">
      <button
        @dragover="allowDrop"
        @drop="(e) => onDrop(e, filesStore.location[0]!.id)"
        @dragenter="isDragover = filesStore.location[0]!.id"
        @dragleave="isDragover = null"
        class="root-btn"
        :class="{ dragging: isDragover === filesStore.location[0]!.id }"
        @click="filesStore.resetLocation"
      >
        {{ t('files.subtitle') }}
      </button>
      <DirectoryItem
        v-for="(d, i) in filesStore.location"
        :class="{ dragging: isDragover === d.id }"
        @dragover="allowDrop"
        @drop="(e) => onDrop(e, d.id)"
        @dragenter="isDragover = d.id"
        @dragleave="isDragover = null"
        :name="d.name"
        @click="() => handleChange(i)"
        :key="d.id"
      />
    </p>
    <InTitleAddButton class="add-btn" @click="createModal.open" />
  </div>
</template>

<style scoped>
.wrapper {
  display: flex;
  align-items: center;
  max-width: 100%;
  overflow-x: auto;
  flex-shrink: 0;
  padding: 3px 0;
  margin-bottom: 25px;
}

.directory {
  white-space: nowrap;
}

.root-btn {
  font-size: 18px;
  background-color: transparent;
  font-weight: 600;
  cursor: pointer;
  padding: 3px 3px 3px 0;
  border-radius: 10px;
  border: 0;
}
.root-btn.dragging,
.dragging :deep(button) {
  box-shadow: 0 0 5px var(--color-primary) !important;
}

.add-btn {
  height: 24px;
  width: 24px;
  font-size: 18px;
  margin-left: 9px !important;
}
</style>
