<script setup lang="ts">
import FolderCheckbox from '@/components/form/FolderCheckbox.vue'
import { useFilesStore } from '@/stores/files'
import type { FileUser } from '@/types'
import type { FilesTree } from '@/types/internal'
import { FILES_KEY } from '@/utils/getFilesFoldersTree'
import { computed, onUnmounted, onUpdated } from 'vue'

type Checked = 'partial' | boolean

const props = defineProps<{
  name: string
  tree: FilesTree
  directory: string
  selectedDirectory: string
  selectedFiles: string[]
}>()

const emit = defineEmits<{
  (e: 'select', dir: string): void
  (e: 'selectFiles', dir: string): void
}>()

const filesStore = useFilesStore()

const folders = computed(() => {
  return Object.keys(props.tree || {}).filter((f) => f !== FILES_KEY)
})

function getFolderTree(f: string): FilesTree {
  return props.tree[f] as FilesTree
}

const selected = computed(() => {
  return props.directory === props.selectedDirectory
})

const folderFiles = computed(() => {
  return filesStore.files.filter((f) => {
    const innerDir = props.directory === '/' ? '/' : `${props.directory}/`
    return f.directory.canonical === props.directory || f.directory.canonical.startsWith(innerDir)
  })
})

const checked = computed<Checked>(() => {
  const selectedCount = folderFiles.value.reduce((a, f) => {
    if (props.selectedFiles.includes(f.id)) return a + 1
    return a
  }, 0)
  if (selectedCount === folderFiles.value.length) return true
  return selectedCount ? 'partial' : false
})
</script>

<template>
  <li>
    <FolderCheckbox
      :class="{ active: selected }"
      :title="`${name} (${props.tree[FILES_KEY]?.length || 0})`"
      @change="emit('selectFiles', directory)"
      :checked="checked === true"
      :indeterminate="checked === 'partial'"
      icon="gg-folder"
      @click="emit('select', directory)"
    />
    <ul v-if="folders.length" class="folder-list subfolder">
      <SelectorFolder
        v-for="folder in folders"
        :name="folder"
        :selectedFiles="selectedFiles"
        @select="emit('select', $event)"
        @selectFiles="emit('selectFiles', $event)"
        :tree="getFolderTree(folder)"
        :directory="directory === '/' ? `/${folder}` : `${directory}/${folder}`"
        :selectedDirectory="selectedDirectory"
      />
    </ul>
  </li>
</template>

<style scoped lang="scss">
@use 'sass:color';

.folder-list {
  list-style-type: none;
  padding: 0;
  margin: 0 0 10px;

  &.subfolder {
    padding-left: 1.5rem; /* Indent for subfolders */
  }
}
</style>
