<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'
import { computed, onMounted, ref } from 'vue'
import { VueFinalModal } from 'vue-final-modal'
import { useI18n } from 'vue-i18n'
import type { FilesDirectory, FilesDirectoryUser } from '@/types'
import { toast } from 'vue3-toastify'
import axios from 'axios'
import DirectoryItem from '@/components/files/DirectoryItem.vue'

const { t } = useI18n()

defineEmits<{
  (e: 'close'): void
  (e: 'move', directory_id: string): void
}>()
defineProps<{ title: string; text: string; parent_id: string | null; folder_id?: string }>()

const authStore = useAuthStore()

const currentDirectory = ref<FilesDirectoryUser>()
const currentLocation = ref<FilesDirectory[]>([])

const foldersList = computed<FilesDirectory[]>(() => {
  return currentDirectory.value?.children || []
})

const handleChange = (index: number) => {
  const val = currentLocation.value.slice(0, index + 1)
  changeLocation(val)
}

async function fetchCurrentDirectory(dir: FilesDirectory) {
  try {
    const response = await axios.get<FilesDirectoryUser>(`/api/directories/${dir.id}`)
    currentDirectory.value = response.data
  } catch (error) {
    toast(t('files.toasts.directory-fetching-error'), {
      autoClose: 3000,
      type: 'error'
    })
  }
}

async function changeLocation(location: FilesDirectory[]) {
  await fetchCurrentDirectory(location.at(-1))
  currentLocation.value = location
}

onMounted(() => {
  changeLocation([authStore.user?.root_directory!])
})
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
      <h1 class="title">{{ title }}</h1>
      <p class="text">{{ text }}</p>
      <p class="directory">
        <button class="root-btn" @click="changeLocation(currentLocation.slice(0, 1))">
          {{ t('files.subtitle') }}
        </button>
        <DirectoryItem
          v-for="(d, i) in currentLocation.slice(0)"
          :name="d.name"
          @click="() => handleChange(i)"
          :key="i"
        />
      </p>
      <p v-if="!foldersList.length" class="text">{{ t('files.folders.no-folders') }}</p>
      <div v-if="foldersList.length" class="list">
        <template v-for="f in foldersList" :key="f.id">
          <button v-if="f.id !== folder_id" class="folder" @click="changeLocation([...currentLocation, f])">
            <i class="gg-folder"></i>
            <span class="name">{{ f.name }}</span>
          </button>
        </template>
      </div>
      <div class="actions">
        <button
          class="tsai-button"
          :disabled="parent_id === currentLocation.at(-1)?.id"
          @click="$emit('move', currentLocation.at(-1).id)"
        >
          {{ t('files.folders.move-modal.action') }}
        </button>
      </div>
    </div>
  </VueFinalModal>
</template>

<style lang="scss" scoped>
.content {
  max-width: 613px;
  width: 100vw;
}

.title {
  min-width: 450px;
}

.text {
  color: var(--color-dark-grey);
  margin-bottom: 20px;
}

.root-btn {
  font-size: 18px;
  background-color: transparent;
  font-weight: 600;
  cursor: pointer;
  border: 0;
}

.directory {
  width: 100%;
  overflow-y: auto;
  white-space: nowrap;
  margin-bottom: 20px;
}

.list {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin-bottom: 40px;
}

i {
  flex-shrink: 0;
}

.folder {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 15px 18px;
  background-color: var(--color-folder-bg);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  width: 228px;
  cursor: pointer;
}

.folder:hover {
  background-color: var(--color-primary);
  .gg-folder {
    color: var(--color-background);
    background-color: var(--color-background);
  }
  .gg-folder::after {
    background-color: var(--color-background);
  }
  .name {
    color: var(--color-background);
  }
  .menu span {
    background-color: var(--color-background);
  }
}

.gg-folder {
  color: var(--color-light-grey);
  background-color: var(--color-light-grey);
}

.gg-folder::after {
  background-color: var(--color-light-grey);
}

.name {
  font-size: 18px;
  font-family: 'Mulish', sans-serif;
  overflow-x: hidden;
  text-overflow: ellipsis;
}

.actions {
  display: flex;
  align-items: center;
  gap: 15px;
}

@media screen and (max-width: 786px) {
  .content {
    max-width: 410px;
  }
  .list {
    display: grid;
    max-width: 100%;
    grid-template-columns: 1fr 1fr;
  }
  .folder {
    width: auto;
    white-space: nowrap;
    width: 100%;
    text-overflow: ellipsis;
    overflow-x: hidden;
  }
  .content {
    width: 100%;
  }
  .title {
    min-width: 0;
  }
}

@media screen and (max-width: 500px) {
  .list {
    grid-template-columns: 1fr;
  }
  .folder {
    max-width: 100%;
  }
}
</style>
