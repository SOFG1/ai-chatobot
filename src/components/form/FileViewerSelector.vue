<script setup lang="ts">
import { computed, ref, watchEffect } from 'vue'
import FolderItem from './FolderItem.vue'
import FileCheckbox from '@/components/form/FileCheckbox.vue'
import type { File, Folder } from '@/types/internal'

export interface Props {
  folders: Folder[]
  files: File[]
  modelValue: string[]
}

const props = withDefaults(defineProps<Props>(), {
  folders: () => [],
  files: () => [],
  modelValue: () => []
})

const emit = defineEmits(['update:modelValue'])

const selectedFiles = ref<string[]>([])
const selectedFolders = ref<Folder[]>([])
const activeFolder = ref<Folder | null>(props.folders[0] || null)

const visibleFiles = computed(() =>
  !activeFolder.value || activeFolder.value.id === 1
    ? props.files
    : props.files.filter((file) => file.folderId === activeFolder.value?.id)
)

const isSelected = {
  file: (file: File) => selectedFiles.value.includes(file.id),
  folder: (folder: Folder) => selectedFolders.value.includes(folder)
}

const updateSelection = (items: (File | Folder)[], select: boolean) => {
  items.forEach((item) => {
    if ('folderId' in item) {
      // File
      const index = selectedFiles.value.indexOf(item.id)
      if (select && index === -1) selectedFiles.value.push(item.id)
      else if (!select && index !== -1) selectedFiles.value.splice(index, 1)
    } else {
      // Folder
      const index = selectedFolders.value.indexOf(item)
      if (select && index === -1) selectedFolders.value.push(item)
      else if (!select && index !== -1) selectedFolders.value.splice(index, 1)
      updateSelection(item.children || [], select)
      updateSelection(
        props.files.filter((f) => f.folderId === item.id),
        select
      )
    }
  })
  emit('update:modelValue', selectedFiles.value)
}

const toggleSelection = (item: File | Folder) => {
  const fileType = Object.hasOwn(item, 'folderId') ? 'folder' : 'file'
  const selected = !isSelected[fileType](item)
  updateSelection([item], selected)
}

const selectFolder = (folder: Folder) => {
  activeFolder.value = folder
}

watchEffect(() => {
  selectedFiles.value = props.modelValue
})
</script>

<template>
  <div class="file-selector">
    <div class="sidebar">
      <ul class="folder-list">
        <FolderItem
          v-for="folder in folders"
          :key="folder.id"
          :folder="folder"
          :activeFolder="activeFolder"
          :selectedFolders="selectedFolders"
          :selectedFiles="selectedFiles"
          :files="files"
          :isFolderSelected="isSelected.folder"
          :isFileSelected="isSelected.file"
          @toggleFolderSelection="toggleSelection"
          @selectFolder="selectFolder"
        />
      </ul>
    </div>
    <div class="content">
      <ul class="file-list">
        <li v-for="file in visibleFiles" :key="file.id">
          <FileCheckbox
            :title="file.name"
            :value="file"
            :checked="isSelected.file(file)"
            @change="toggleSelection(file)"
          />
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped lang="scss">
.file-selector {
  display: flex;
  border: 1px solid var(--color-btn-border);
  border-radius: 5px;
  font-family: Mulish, sans-serif;

  .sidebar {
    width: 38%;
    background-color: var(--color-background);
    border-right: 1px solid var(--color-btn-border);
    padding: 0.7rem;

    .folder-list {
      list-style-type: none;
      padding: 0;
      margin: 0;
    }
  }

  .content {
    width: 70%;
    padding: 1rem;

    .file-list {
      list-style-type: none;
      padding: 0;
      margin: 0;
    }

    :deep(.tsai-checkbox-wrapper .cbx) {
      padding: 4px 8px;
    }
  }
}

@media screen and (max-width: 600px) {
  .sidebar,
  .content {
    width: 50% !important;
    padding: 0.3rem !important;
  }

  :deep(.tsai-checkbox-wrapper) {
    max-width: 100%;
    overflow-x: hidden;
  }
}
@media screen and (max-width: 380px) {
  :deep(.tsai-checkbox-wrapper) {
    max-width: 100%;
    overflow-x: hidden;
    font-size: 12px;
  }
}
</style>
