<script setup lang="ts">
import { onBeforeUnmount, onMounted, reactive } from 'vue'
import PdfPreviewControls from '@/components/PdfPreviewControls.vue'
import { getDocument, GlobalWorkerOptions, type PDFPageProxy } from 'pdfjs-dist'
import PdfWorker from 'pdfjs-dist/build/pdf.worker.mjs?url'

GlobalWorkerOptions.workerSrc = PdfWorker

const props = withDefaults(
  defineProps<{
    pdfSource: string
  }>(),
  {
    // either URL, Base64, binary, or document proxy
    pdfSource: ''
  }
)

const pdfControls = reactive({
  page: 1,
  pages: 0,
  scale: 'auto',
  // calculated scale after applying "auto"
  customScale: 1.0
})

let pdfDoc = null,
  pageRendering = false,
  pageNumPending = null,
  canvas: HTMLCanvasElement | null = null,
  canvasContext: CanvasRenderingContext2D | null = null

onMounted(() => {
  canvas = document.getElementById('pdf-canvas') as HTMLCanvasElement
  canvasContext = canvas.getContext('2d')

  /**
   * Asynchronously downloads PDF.
   */
  getDocument({ url: props.pdfSource, disableAutoFetch: true, disableStream: true }).promise.then(function (pdfDoc_) {
    pdfDoc = pdfDoc_
    pdfControls.pages = pdfDoc.numPages

    // Initial/first page rendering
    renderPage(pdfControls.page)
  })
})

onBeforeUnmount(() => {
  if (pdfDoc) {
    pdfDoc.destroy()
  }
})

/**
 * Get page info from document, resize canvas accordingly, and render page.
 * Return the applied transformation matrix and the viewport
 * @param page
 */
function transformPage(page: PDFPageProxy) {
  // get the unscaled viewport of the page
  const viewport = page.getViewport({ scale: 1.0 })
  let scale = pdfControls.scale

  if (scale === 'auto') {
    const container = document.getElementById('viewerContainer')

    // - 16 for the page margins of 8px on each side
    scale = (container.clientWidth - 16) / viewport.width
  }

  pdfControls.customScale = scale

  canvas.width = Math.floor(viewport.width * scale)
  canvas.height = Math.floor(viewport.height * scale)
  canvas.style.width = Math.floor(viewport.width * scale) + 'px'
  canvas.style.height = Math.floor(viewport.height * scale) + 'px'

  const transform = scale !== 1 ? [scale, 0, 0, scale, 0, 0] : null

  return {
    transform: transform,
    viewport: viewport
  }
}

/**
 * Get page info from document, resize canvas accordingly, and render page.
 * @param num Page number.
 */
function renderPage(num: number) {
  pageRendering = true
  // Using promise to fetch the page
  pdfDoc
    .getPage(num)
    .then(function (page) {
      const { transform, viewport } = transformPage(page)

      // Render PDF page into canvas context
      const renderContext = {
        canvasContext: canvasContext,
        transform: transform,
        viewport: viewport
      }
      const renderTask = page.render(renderContext)

      // Wait for rendering to finish
      renderTask.promise.then(function () {
        pageRendering = false
        if (pageNumPending !== null) {
          // New page rendering is pending
          renderPage(pageNumPending)
          pageNumPending = null
        }
      })
    })
    .catch((err) => {
      // PDF loading error
      console.error(err)
    })
}

/**
 * If another page rendering in progress, waits until the rendering is
 * finised. Otherwise, executes rendering immediately.
 */
function queueRenderPage(num: number) {
  if (pageRendering) {
    pageNumPending = num
  } else {
    renderPage(num)
  }
}

/**
 * Displays previous page.
 */
function onUpdatePage() {
  queueRenderPage(pdfControls.page)
}

function onUpdateScale() {
  renderPage(pdfControls.page)
}

function downloadDoc() {
  if (pdfRef.value) {
    pdfRef.value.download()
  }
}
</script>

<template>
  <PdfPreviewControls
    v-model:page="pdfControls.page"
    v-model:pages="pdfControls.pages"
    v-model:scale="pdfControls.scale"
    :custom-scale="pdfControls.customScale"
    @download="downloadDoc()"
    @update:page="onUpdatePage()"
    @update:scale="onUpdateScale()"
  >
    <template #default>
      <canvas id="pdf-canvas"></canvas>
    </template>
  </PdfPreviewControls>
</template>

<style lang="scss">
@import 'pdfjs-dist/web/pdf_viewer.css';
#mainContainer {
  canvas {
    display: block;
    margin: 0 auto;
  }
}
</style>
