<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import type { FilesFiltersType, SortingType } from '@/types/internal'
import { useFilesStore } from '@/stores/files'
import { escapeRegExp } from '@/utils/escapeRegExp'
import { useDropZone } from '@vueuse/core'
import InTitleAddButton from '@/components/InTitleAddButton.vue'
import DropZone from '@/components/files/DropZone.vue'
import FilesFilters from '@/components/files/FilesFilters.vue'
import File from '@/components/files/File.vue'
import { useUploadModal } from '@/composables/useUploadModal'

const { t } = useI18n()

const props = defineProps<{ searchQuery: string }>()

const filesStore = useFilesStore()

const interval = ref<number | undefined>(undefined)
const filters = ref<FilesFiltersType>([])
const listElementRef = ref<HTMLDivElement>()

const sorting = ref<SortingType>({
  dir: 'desc',
  property: undefined
})

const uploadModal = useUploadModal()

const { isOverDropZone } = useDropZone(listElementRef, {
  onDrop,
  // specify the types of data to be received.
  dataTypes: ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
})

const filteredFiles = computed(() => {
  return (
    filesStore.currentDirectory?.files.filter((f) => {
      let show = true
      const name = f.file_name.toLowerCase()
      const query = escapeRegExp(props.searchQuery.toLowerCase())
      if (!name.match(query)) show = false
      const statuses = filters.value
      if (statuses.length && !statuses.includes(f.file.indexing_status)) {
        show = false
      }
      return show
    }) || []
  )
})

const sortedFiles = computed(() => {
  const dir = sorting.value.dir
  const property = sorting.value.property

  if (!property) return filteredFiles.value
  return [...filteredFiles.value].sort((a, b) => {
    if (property === 'last-change') {
      const date1 = new Date(a.modified).getTime()
      const date2 = new Date(b.modified).getTime()
      if (dir === 'asc') return date1 - date2
      if (dir === 'desc') return date2 - date1
    }
    if (property === 'a-z') {
      if (dir === 'desc') return a.file_name.localeCompare(b.file_name)
      return b.file_name.localeCompare(a.file_name)
    }
  })
})

function onDrop(files: File[] | null, e: Event) {
  e.stopPropagation()
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
  uploadModal.open()
}

//Refetch files only when we have pending files
watch(
  () => filesStore.currentDirectory?.files,
  () => {
    const files = filesStore.currentDirectory?.files
    if (files?.some((f) => f.file.indexing_status === 'pending') && !interval.value) {
      interval.value = setInterval(() => {
        filesStore.fetchCurrentDirectory(true)
      }, 3000)
    }
    if (!files?.some((f) => f.file.indexing_status === 'pending' && interval.value)) {
      clearInterval(interval.value)
      interval.value = undefined
    }
  },
  { deep: true }
)
</script>

<template>
  <div class="view-title">
    <h1>{{ t('files.files.title') }}</h1>
    <InTitleAddButton class="add-btn" @click="uploadModal.open" />
    <FilesFilters v-model:filters="filters" v-model:sorting="sorting" />
  </div>
  <div ref="listElementRef" class="files-list">
    <File v-for="file in sortedFiles" :file="file" />
    <p v-if="!sortedFiles.length" class="no-files">{{ t('files.files.no-files') }}</p>
    <div class="dropzone-wrapper" v-if="isOverDropZone">
      <DropZone class="dropzone" :is-over="isOverDropZone" />
    </div>
  </div>
</template>

<style scoped>
.view-title {
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 5px 0;
}
h1 {
  font-size: 18px;
}
.add-btn {
  height: 24px;
  width: 24px;
  font-size: 18px;
  margin-right: auto;
  margin-left: 9px !important;
}
.files-list {
  position: relative;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(252px, 1fr));
  grid-auto-rows: 221px;
  gap: 28px;
  border-radius: 8px;
  padding-bottom: 28px;
  flex-grow: 1;
}

.dropzone-wrapper {
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  bottom: 0;
  padding: 50px;
  background-color: rgba(0, 0, 0, 0.4);
  z-index: 9999;
}

.dropzone-wrapper div {
  height: 100%;
  border-radius: 30px;
  width: 100%;
}

.no-files {
  padding-left: 10px;
  color: var(--color-light-grey);
}

:deep(.in-title-add-button) {
  margin-left: 14px;
}
</style>
