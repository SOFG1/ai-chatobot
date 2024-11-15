<script setup lang="ts">
import { VueFinalModal } from 'vue-final-modal'
import PdfPreview from '@/components/PdfPreview.vue'
import LoadingSvg from '@/assets/img/loading.svg'
import { ref, type Ref } from 'vue'
import { formatBytes } from '@/utils/files'

//Explicitly declare refs as values may be supplied after mounting
// -> Document URL is available once the file has finished loading
// TODO: Fix console warnings
withDefaults(
  defineProps<{
    pdfTitle: Ref<string>
    pdfSource: Ref<string>
    pdfSize: Ref<number>
    isLoading: Ref<boolean>
    onClose?: () => void
    // specify parent target for modal to mount to
    // needs to be a valid query selector
    target?: string
  }>(),
  {
    pdfTitle: () => ref(''),
    // either URL/ObjectURL, Base64, binary, or document proxy
    pdfSource: () => ref(''),
    isLoading: () => ref(false)
  }
)

const emit = defineEmits<{
  (e: 'close'): void
}>()
</script>

<template>
  <VueFinalModal
    class="final-modal"
    :teleport-to="target || false"
    id="final-modal"
    content-class="final-modal-content"
    overlay-transition="vfm-fade"
    content-transition="vfm-fade"
  >
    <button class="final-modal-close" @click="emit('close')" />
    <div class="content">
      <h1>{{ pdfTitle }}</h1>
      <small>{{ formatBytes(pdfSize) }}</small>
      <div class="thinking" v-if="isLoading">
        <LoadingSvg />
      </div>
      <pdf-preview class="pdf-preview-container" v-else :pdf-source="pdfSource" :filename="pdfTitle"></pdf-preview>
    </div>
  </VueFinalModal>
</template>

<style scoped lang="scss">
.content {
  height: 100%;

  .pdf-preview-container {
    margin-top: 1rem;
  }
}

.thinking {
  width: 100%;
  display: flex;
  padding: 1rem;
  align-items: center;
  justify-content: center;
}
</style>
