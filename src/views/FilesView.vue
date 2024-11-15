<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import Folders from '@/components/files/Folders.vue'
import Files from '@/components/files/Files.vue'
import FilesDirectory from '@/components/files/FilesDirectory.vue'
import { useFilesStore } from '@/stores/files'
import TextInput from '@/components/form/TextInput.vue'
import LogoIconWithLoading from '@/components/LogoIconWithLoading.vue'
import { ContentLoader } from 'vue-content-loader'

const { t } = useI18n()

const filesStore = useFilesStore()

const searchQuery = ref<string>('')
</script>

<template>
  <main class="tsai-view files-view">
    <div class="view-title">
      <LogoIconWithLoading />
      <h1>{{ t('files.title') }}</h1>
    </div>
    <p class="view-description">
      {{ t('files.description') }}
    </p>
    <TextInput class="search" v-model="searchQuery" :placeholder="t('files.search-placeholder')" />
    <FilesDirectory />
    <content-loader
      v-if="filesStore.isFetchingDirectory"
      style="max-width: 422px"
      viewBox="0 0 402 113"
      :speed="3"
      primaryColor="#f3f3f3"
      secondaryColor="#f6ebff"
    >
      <rect x="0" y="0" rx="8" ry="8" width="190" height="113" />
      <rect x="1" y="1" rx="8" ry="8" width="189" height="112" />
      <rect x="212" y="0" rx="8" ry="8" width="190" height="113" />
      <rect x="213" y="1" rx="8" ry="8" width="189" height="112" />
    </content-loader>
    <template v-if="!filesStore.isFetchingDirectory">
      <Folders :searchQuery="searchQuery" />
      <Files :searchQuery="searchQuery" />
    </template>
  </main>
</template>

<style scoped>
.tsai-view {
  /* max-width: 1230px; */
  margin-bottom: 45px;
}
.view-title {
  margin-bottom: 8px;
}

.view-description {
  margin-top: 0;
  margin-bottom: 12px;
}
.search {
  margin-bottom: 40px;
}
</style>
