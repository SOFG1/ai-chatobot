<script setup lang="ts">
import PdfPreviewControls from '@/components/PdfPreviewControls.vue'
import { nextTick, onBeforeUnmount, onMounted, onUnmounted, reactive } from 'vue'
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist'
import { EventBus, PDFFindController, PDFLinkService, PDFViewer } from 'pdfjs-dist/web/pdf_viewer.mjs'
import PdfWorker from 'pdfjs-dist/build/pdf.worker.mjs?url'
import { useDebounceFn } from '@vueuse/core'
import type { IPDFLinkService } from 'pdfjs-dist/types/web/interfaces'

GlobalWorkerOptions.workerSrc = PdfWorker

const props = withDefaults(
  defineProps<{
    // PDF source as URL, Base64, binary (blob/document url)
    pdfSource: string
    // filename for download
    filename?: string
    // search term to highlight
    annotation?: string
  }>(),
  {
    // either URL, Base64, binary, or document proxy
    pdfSource: '',
    filename: 'document.pdf',
    annotation: ''
  }
)

interface pdfControlsType {
  page: number
  pages: number
  scale: string | number
  customScale: number
}

const pdfControls = reactive<pdfControlsType>({
  page: 1,
  pages: 0,
  scale: 'auto',
  // calculated scale after applying "auto"
  customScale: 1.0
})

const eventBus: EventBus = new EventBus()
// (Optionally) enable hyperlinks within PDF files.
let pdfLinkService: IPDFLinkService = new PDFLinkService({
  eventBus
})
// (Optionally) enable find controller.
let pdfFindController: PDFFindController = new PDFFindController({
  eventBus,
  linkService: pdfLinkService
})
let pdfViewer: PDFViewer | undefined = undefined

onMounted(async () => {
  const container: HTMLDivElement = document.getElementById('viewerContainer') as HTMLDivElement
  if (!container) {
    throw new Error('PDF Viewer container not found')
  }

  pdfViewer = new PDFViewer({
    container: container,
    eventBus: eventBus,
    linkService: pdfLinkService,
    findController: pdfFindController
  })

  await nextTick()
  await loadPdf()
})

async function loadPdf() {
  pdfViewer?.eventBus.on('pagechanging', (e) => {
    pdfControls.page = e.pageNumber
  })

  eventBus.on('pagesinit', function () {
    // PDF loading completed
    if (pdfViewer instanceof PDFViewer) {
      pdfControls.pages = pdfViewer.pagesCount
    }
    // Manually update scale
    onUpdateScale()
    // Search for annotation if provided
    if (props.annotation) onSearch(props.annotation)
  })

  // Loading document.
  const loadingTask = getDocument({
    url: props.pdfSource,
    enableXfa: true
  })
  const pdfDocument = await loadingTask.promise

  // Document loaded, specifying document for the viewer and
  // the (optional) linkService.
  pdfViewer?.setDocument(pdfDocument)
}

function onUpdatePage() {
  pdfViewer?.scrollPageIntoView({
    pageNumber: pdfControls.page
  })
}

/**
 * Update the scale of the PDF viewer.
 * If the scale is set to 'auto', the viewer will adjust to the width of the page.
 * See https://github.com/mozilla/pdf.js/blob/ab419cc320c7b7121719564f0ca3c203dc32362d/web/app.js#L2449-L2464
 */
function onUpdateScale() {
  if (!pdfViewer) return

  let scale = pdfControls.scale
  if (scale === 'auto') {
    scale = 'page-width'
  }

  pdfViewer.currentScaleValue = scale
  pdfViewer.update()

  const view = pdfViewer.getPageView(0)
  pdfControls.customScale = view.viewport.scale || 1.0
}

const debounceSearch = useDebounceFn(onSearch, 500)
function onSearch(text: string) {
  if (!pdfViewer) return

  //use pdfViewer to dispatch find event
  pdfViewer.eventBus.dispatch('find', {
    type: 'find',
    query: text,
    caseSensitive: false,
    findPrevious: false,
    phraseSearch: true
  })

  //use pdfFindController to access list of matches
  //console.log(pdfFindController)
}

function onDownload() {
  const anchor = document.createElement('a')
  anchor.href = props.pdfSource
  anchor.download = props.filename
  anchor.click()
}

async function onPrint() {
  //TODO: Implement print functionality
  //consider using print.js
}

onBeforeUnmount(() => {
  // Destroy the PDF viewer instance
  if (pdfViewer) {
    pdfViewer.cleanup()
  }
})

onUnmounted(() => {
  // Revoke the object URL to free memory
  if (props.pdfSource) {
    URL.revokeObjectURL(props.pdfSource)
  }
})
</script>

<template>
  <PdfPreviewControls
    v-model:page="pdfControls.page"
    v-model:pages="pdfControls.pages"
    v-model:scale="pdfControls.scale"
    :custom-scale="pdfControls.customScale"
    @update:page="onUpdatePage()"
    @update:scale="onUpdateScale()"
    @update:search="debounceSearch"
    @download="onDownload()"
    @print="onPrint()"
  >
    <template #default>
      <div id="viewer" class="pdfViewer"></div>
    </template>
  </PdfPreviewControls>
</template>

<style lang="scss">
@import 'pdfjs-dist/web/pdf_viewer.css';
</style>
