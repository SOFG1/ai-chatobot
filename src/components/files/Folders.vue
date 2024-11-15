<script setup lang="ts">
import { computed } from 'vue'
import { useFilesStore } from '@/stores/files'
import type { FilesDirectory } from '@/types'
import { escapeRegExp } from '@/utils/escapeRegExp'
import Folder from '@/components/files/Folder.vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps<{ searchQuery: string }>()

const filesStore = useFilesStore()

const foldersList = computed<FilesDirectory[]>(() => {
  const query = escapeRegExp(props.searchQuery.toLowerCase())
  return filesStore.currentDirectory?.children?.filter((f) => f.name.match(query)) || []
})
</script>

<template>
  <div class="folders-list">
    <p v-if="!foldersList.length" class="no-files">{{ t('files.folders.no-folders') }}</p>
    <Folder v-for="folder in foldersList" :folder="folder" />
  </div>
</template>

<style scoped>
.folders-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(252px, 1fr));
  gap: 16px 28px;
  padding-bottom: 30px;
  margin-bottom: 0;
}
.no-files {
  padding-left: 10px;
  color: var(--color-light-grey);
}
</style>
