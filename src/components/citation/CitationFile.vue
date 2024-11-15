<script setup lang="ts">
//@ts-ignore
import VueResizable from 'vue-resizable'
import { vOnClickOutside } from '@vueuse/components'
import { computed, onMounted, onUnmounted, type Ref, ref } from 'vue'
import { useConversationsStore } from '@/stores/conversations'
import { storeToRefs } from 'pinia'
import { type Citation, FileFetchStatus } from '@/types'
import { fetchAndCacheFile, formatBytes } from '@/utils/files'
import { PhCircleNotch } from '@phosphor-icons/vue'
import PdfPreview from '@/components/PdfPreview.vue'

const { openedCitation }: { openedCitation: Ref<Citation> } = storeToRefs(useConversationsStore())

const showFilePreview = ref(false)
const fileFetching = ref<FileFetchStatus>(FileFetchStatus.IDLE)
const screenWidth = ref<number>(window.innerWidth)
const maxWidth = 1200
const minWidth = window.innerWidth < 460 ? window.innerWidth : 460
const initialWidth = 780
const isNarrow = ref(false)
let objectUrl = ''

onMounted(async () => {
  try {
    fileFetching.value = FileFetchStatus.FETCHING
    objectUrl = await fetchAndCacheFile(openedCitation.value.file_user_id, openedCitation.value.file_name)
    fileFetching.value = FileFetchStatus.SUCCESS
  } catch (err) {
    console.error('Could not fetch file:', err)
    fileFetching.value = FileFetchStatus.FAILED
  }
})

const handleClose = (e: PointerEvent) => {
  if (!e.target?.closest('.citation-item')) {
    openedCitation.value = null
  }
}

const setScreenWidth = () => {
  screenWidth.value = window.innerWidth
  if (window.innerWidth > 540) isNarrow.value = false
  if (window.innerWidth <= 540) isNarrow.value = true
}

const setIsNarrow = (e: any) => {
  if (e.width > 540) isNarrow.value = false
  if (e.width <= 540) isNarrow.value = true
}

const downloadPdf = async () => {
  const element = document.createElement('a')
  element.href = objectUrl
  element.download = openedCitation.value.file_name
  element.click()
}

const width = computed(() => {
  if (screenWidth.value > initialWidth + 144) return initialWidth
  if (screenWidth.value < 650) return screenWidth.value
  return screenWidth.value - 144
})

const left = computed(() => {
  return Math.abs(screenWidth.value - Math.min(maxWidth, width.value))
})

onMounted(() => window.addEventListener('resize', setScreenWidth))
onUnmounted(() => window.removeEventListener('resize', setScreenWidth))
</script>

<template>
  <div class="wrapper">
    <VueResizable
      :fit-parent="true"
      :active="['l']"
      class="resizable"
      :draggable="false"
      :right="0"
      :left="left"
      :width="width"
      :min-width="minWidth"
      :max-width="maxWidth"
      v-on-click-outside="handleClose"
      @mount="setIsNarrow"
      @resize:move="setIsNarrow"
    >
      <div class="content" :class="{ narrow: isNarrow }">
        <div class="top">
          <p class="title">{{ $t('citation.title') }}</p>
          <button class="close-btn" @click="handleClose">
            <i class="gg-close"></i>
          </button>
        </div>
        <p class="subtitle">{{ $t('citation.subtitle') }}</p>
        <p class="citation">{{ openedCitation.context_content }}</p>
        <p class="subtitle">{{ $t('citation.related-file') }}</p>
        <div class="file-wrapper">
          <div class="file" @click="showFilePreview = !showFilePreview">
            <div class="file-badge">
              <span>PDF</span>
            </div>
            <div class="file-content">
              <p class="file-name">
                <span class="name">{{ openedCitation.file_name }}</span> <span class="dot">·</span>
                <span class="page"> {{ $t('citation.page', openedCitation.page) }}</span>
              </p>
              <p class="file-size">{{ $t('citation.file-size') + formatBytes(openedCitation.file_size) }}</p>
            </div>
            <div class="loading" v-if="fileFetching === FileFetchStatus.FETCHING">
              <PhCircleNotch class="icon-spinner" :size="22" color="#666" />
              {{ $t('citation.loading') }}
            </div>
            <button class="visibility-button" :class="{ opened: showFilePreview }">
              <i class="gg-chevron-down"></i>
            </button>
          </div>
          <div class="pdf-container" v-if="showFilePreview">
            <pdf-preview
              v-if="fileFetching === FileFetchStatus.SUCCESS"
              :pdf-source="objectUrl"
              :annotation="openedCitation.context_content"
            />
          </div>
        </div>
      </div>
    </VueResizable>
  </div>
</template>

<style scoped lang="scss">
.wrapper {
  position: fixed;
  top: 0;
  right: 0;
  width: 100%;
  bottom: 0;
  z-index: 1000;
  transition: 600ms;
  pointer-events: none;
}

.v-enter-from {
  transform: translateX(100%);
}

.v-leave-to {
  transform: translateX(100%);
}

.resizable {
  display: flex;
  flex-direction: column;
  padding: 34px 40px 0;
  background-color: var(--color-background);
  border-radius: 30px 0 0 30px;
  box-shadow: -8px 0 15px rgba(0, 0, 0, 0.15);
  height: 100%;
  right: 0;
}

.content {
  height: 100%;
  overflow-y: auto;
  pointer-events: all;
}

:deep(.resizable-l) {
  top: 56px !important;
  left: -14px !important;
  height: 32px !important;
  width: 32px !important;
  padding: 0 !important;
  display: flex !important;
  justify-content: center !important;
  align-items: center !important;
  gap: 26px !important;
  border: 1px solid var(--color-light-grey) !important;
  border-radius: 6px !important;
  background-color: var(--color-background) !important;
  pointer-events: all;
  box-shadow: 0 0 7px rgba(0, 0, 0, 0.2);

  &::before,
  &::after {
    content: '';
    display: block;
    box-sizing: border-box;
    position: absolute;
    width: 10px;
    height: 10px;
  }

  &::before {
    border-bottom: 2px solid;
    border-left: 2px solid;
    transform: rotate(45deg);
    left: 6px;
    top: 9px;
  }

  &::after {
    border-bottom: 2px solid;
    border-right: 2px solid;
    transform: rotate(-45deg);
    right: 6px;
    top: 9px;
  }
}

.top {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}

.title {
  font-size: 24px;
  font-weight: 600;
}

.close-btn {
  background-color: transparent;
  border: 0;
  padding: 0;
  cursor: pointer;
}

.close-btn i {
  --ggs: 0.95;
}

.subtitle {
  font-weight: 500;
  margin-bottom: 12px;
}

.citation {
  font-size: 16px;
  line-height: 1.5;
  padding: 20px;
  border-radius: 8px;
  background: var(--gradient-citation);
  color: var(--color-text);
  margin-bottom: 20px;
  font-family: Mulish, sans-serif;
}

.file-wrapper {
  border-radius: 8px;

  .pdf-container {
    height: 475px;
  }
}

.file {
  display: flex;
  align-items: center;
  border-radius: 8px;
  gap: 10px;
  padding: 10px 12px;
  background-color: var(--color-citation-file);

  &:hover {
    cursor: pointer;
  }
}

.file-badge {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 58px;
  width: 72px;
  background-color: var(--color-background);
  border: 1px solid var(--color-background);
  border-radius: 8px;
}

.file-badge span {
  font-size: 9px;
  font-family: Mulish, sans-serif;
  color: var(--color-background);
  background-color: var(--color-primary);
  border-radius: 4px;
  height: 18px;
  width: 32px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.file-name {
  font-family: Mulish, sans-serif;
  font-weight: 600;
  margin-bottom: 4px;
}

.name {
  word-break: break-all;
}

.page {
  padding: 4px 10px;
  border: 1px solid var(--color-border-grey);
  border-radius: 8px;
  white-space: nowrap;
}

.dot {
  margin-right: 8px;
}

.file-size {
  font-size: 14px;
  line-height: 1;
  font-family: Mulish, sans-serif;
  color: var(--color-dark-grey);
}

.visibility-button {
  margin-left: auto;
  padding: 0;
  border: 0;
  background-color: transparent;
  cursor: pointer;
}

.visibility-button.opened i {
  transform: rotate(180deg);
}

.pdf {
  height: 600px;
  width: 100%;
  padding: 0 16px;
  background-color: var(--color-citation-file);
  min-width: 0;
}

:deep(.pdf-viewer__header) {
  box-shadow: none;
}

//When resizable is narrower than 400px
.narrow {
  .name {
    width: 100%;
  }

  .dot {
    display: none;
  }

  .page {
    display: block;
    padding: 3px 7px;
    width: fit-content;
  }
}

.loading {
  display: flex;
  gap: 5px;
  color: #666;
  line-height: initial;
}

@media screen and (max-width: 650px) {
  .resizable {
    padding: 20px;
    border-radius: 0;
  }
  :deep(.resizable-l) {
    display: none !important;
  }
}
</style>
