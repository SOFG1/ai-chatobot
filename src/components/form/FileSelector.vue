<script setup lang="ts">
import FileCheckbox from '@/components/form/FileCheckbox.vue'
import SelectorFolder from '@/components/form/SelectorFolder.vue'
import { useFilesStore } from '@/stores/files'
import { getFilesFoldersTree } from '@/utils/getFilesFoldersTree'
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const model = defineModel<string[]>()

const filesStore = useFilesStore()

const selectedDirectory = ref<string>('/')

const tree = computed(() => {
  return getFilesFoldersTree(filesStore.files)
})

const currentFiles = computed(() => {
  return filesStore.files.filter((f) => {
    return f.directory.canonical === selectedDirectory.value
  })
})

function changeFile(id: string) {
  if (model.value?.includes(id)) {
    model.value = model.value.filter((f) => f !== id)
  }
  if (!model.value?.includes(id)) {
    model.value?.push(id)
  }
}

function selectFolder(directory: string) {
  const dirFiles = filesStore.files.filter((f) => {
    const dir = directory === '/' ? '/' : `${directory}/`
    return f.directory.canonical.startsWith(dir) || f.directory.canonical === directory
  })
  const allAdded = dirFiles.every((f) => model.value?.includes(f.id))
  const ids = dirFiles.map((f) => f.id)
  if (!allAdded) {
    const copy = [...(model.value || [])]
    copy.push(...ids)
    model.value = [...new Set(copy)]
  }
  if (allAdded) {
    model.value = model.value?.filter((id) => !ids.includes(id))
  }
}

onMounted(() => {
  filesStore.fetchFiles()
})
</script>

<template>
  <p class="mt-2 mb-1">{{ t('chatbot.form.file-modal.files-count', model?.length) }}</p>
  <div class="wrapper">
    <div class="file-selector">
      <div class="sidebar">
        <ul class="folder-list">
          <li>
            <SelectorFolder
              directory="/"
              :name="t('chatbot.form.file-modal.root-folder-name')"
              :tree="tree"
              @select="selectedDirectory = $event"
              @selectFiles="selectFolder($event)"
              :selectedDirectory="selectedDirectory"
              :selectedFiles="model || []"
            />
          </li>
        </ul>
      </div>
      <div class="content">
        <ul class="file-list">
          <li v-for="file in currentFiles" :key="file.id">
            <FileCheckbox
              :title="file.file_name"
              :value="file"
              :checked="model?.includes(file.id)"
              @change="changeFile(file.id)"
              :selectedFiles="model"
            />
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.wrapper {
  overflow-x: auto;
}
.file-selector {
  display: flex;
  border: 1px solid var(--color-btn-border);
  border-radius: 5px;
  font-family: Mulish, sans-serif;
  min-width: 500px;

  .sidebar {
    width: 38%;
    background-color: var(--color-background);
    border-right: 1px solid var(--color-btn-border);
    padding: 1rem;

    .folder-list {
      list-style-type: none;
      padding: 0;
      margin: 0;
    }
  }

  .content {
    position: relative;
    max-height: 45vh;
    overflow: auto;
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

.directory {
  position: relative;
  margin-left: 0.5rem;
  color: var(--color-light-grey);
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
