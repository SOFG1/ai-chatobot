<script setup lang="ts">
import { computed } from 'vue'

/**
 * HTML Structure abbreviated from Mozilla Pdf.js
 * See https://www.npmjs.com/package/pdfjs-dist
 * And Viewer.html / Viewer.css which are not included in the build
 */

const props = withDefaults(
  defineProps<{
    page?: number
    pages?: number
    scale?: number | string
    // Calculated scale value when 'auto' is selected
    customScale?: number
    search?: string
  }>(),
  {
    page: 1,
    pages: 0,
    scale: 1.0,
    search: ''
  }
)

const emit = defineEmits<{
  (e: 'update:page', value: number): void
  (e: 'update:scale', value: number): void
  (e: 'update:pages', value: number): void
  (e: 'update:search', value: string): void
  (e: 'print'): void
  (e: 'download'): void
}>()

const zoomOptions = [
  { title: 'Auto', value: 'auto' },
  { title: '25%', value: 0.25 },
  { title: '50%', value: 0.5 },
  { title: '75%', value: 0.75 },
  { title: '100%', value: 1.0 },
  { title: '125%', value: 1.25 },
  { title: '150%', value: 1.5 },
  { title: '200%', value: 2.0 },
  { title: '300%', value: 3.0 },
  { title: '400%', value: 4.0 }
]

// Define computed properties with getters and setters
const currentPage = computed({
  get: () => props.page,
  //in case the input field is used, convert string to number
  set: (newValue: number) => emit('update:page', Math.abs(+newValue))
})

const numPages = computed({
  get: () => props.pages,
  set: (newValue: number) => emit('update:pages', newValue)
})

const zoomLevel = computed({
  get: () => props.scale,
  set: (newValue: number) => emit('update:scale', newValue)
})

const searchValue = computed({
  get: () => props.search,
  set: (newValue: string) => emit('update:search', newValue)
})

const goToPreviousPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
    // Logic to load the previous page in PDF.js
  }
}

const goToNextPage = () => {
  if (currentPage.value < numPages.value) {
    currentPage.value++
    // Logic to load the next page in PDF.js
  }
}

const adjustZoom = (direction: 'in' | 'out') => {
  let scale = props.scale
  if (typeof scale === 'string') {
    scale = props.customScale
  }

  const options = direction === 'in' ? zoomOptions : zoomOptions.toReversed()
  const nextZoom = options.find((option) => (direction === 'in' ? option.value > scale : option.value < scale))

  if (nextZoom && typeof nextZoom.value === 'number') {
    zoomLevel.value = nextZoom.value
  } else {
    console.warn(`No ${direction === 'in' ? 'higher' : 'lower'} zoom scale found, setting back to 1.0`)
    zoomLevel.value = 1.0
  }
}

const zoomIn = () => adjustZoom('in')
const zoomOut = () => adjustZoom('out')
</script>

<template>
  <div id="outerContainer">
    <div id="mainContainer">
      <div class="toolbar">
        <div id="toolbarViewer">
          <div id="toolbarViewerLeft">
            <div class="splitToolbarButton">
              <button class="toolbarButton" tabindex="20" title="Previous Page" @click="goToPreviousPage">
                <i class="gg-chevron-up"></i>
              </button>
              <div>
                <input type="number" id="pageNumber" style="margin-right: 0" tabindex="21" v-model="currentPage" />
                <span id="numPages"> /{{ numPages }}</span>
              </div>
              <button class="toolbarButton" tabindex="22" title="Next Page" @click="goToNextPage">
                <i class="gg-chevron-down"></i>
              </button>
              <!--              <button class="toolbarButton" disabled tabindex="26" title="Search" @click="emit('search')">-->
              <!--                <i class="gg-search"></i>-->
              <!--              </button>-->
              <!--              <div class="toolbarInput">-->
              <!--                <input type="text" v-model="searchValue" />-->
              <!--              </div>-->
            </div>
          </div>

          <div id="toolbarViewerMiddle">
            <div class="splitToolbarButton">
              <button id="zoomOut" class="toolbarButton" tabindex="23" @click="zoomOut">
                <i class="gg-zoom-out"></i>
              </button>
              <span id="scaleSelectContainer" class="dropdownToolbarButton">
                <select
                  id="scaleSelect"
                  title="Zoom"
                  tabindex="24"
                  data-l10n-id="pdfjs-zoom-select"
                  v-model="zoomLevel"
                >
                  <template v-for="option in zoomOptions" :key="option.title">
                    <option :value="option.value" :selected="option.value === zoomLevel">
                      {{ option.title }}
                    </option>
                  </template>
                </select>
              </span>
              <button id="zoomIn" class="toolbarButton" tabindex="25" @click="zoomIn">
                <i class="gg-zoom-in"></i>
              </button>
            </div>
          </div>

          <div id="toolbarViewerRight">
            <!--            <button id="print" class="toolbarButton" tabindex="27" @click="emit('print')">-->
            <!--              <i class="gg-printer"></i>-->
            <!--            </button>-->
            <button id="download" class="toolxbarButton" tabindex="28" @click="emit('download')">
              <i class="gg-software-download"></i>
            </button>
          </div>
        </div>
      </div>

      <div id="viewerContainer">
        <slot />
      </div>
    </div>
  </div>
</template>

<style lang="scss">
//do not scope style to address pdf.js rendered content

:root {
  --toolbar-height: 45px;
  --base-radius: 4px;
  --toolbar-border-color: #cccccc;
  --toolbar-background-color: rgba(226, 230, 233, 1);
  --toolbar-color: #333333;
}

#outerContainer {
  width: 100%;
  // deduct toolbar height from 100% as it is absolute
  height: calc(100% - var(--toolbar-height));
}

#mainContainer {
  width: 100%;
  height: 100%;
  position: relative;
  min-width: 350px;
  margin: 0 auto;
  padding-top: var(--toolbar-height);
  box-shadow: 0 0 10px 2px #cccccc;

  #viewerContainer {
    width: 100%;
    height: auto;
    position: absolute;
    // scrollbar only shown on hover
    overflow-y: hidden;
    // add scrollbar gutter width to left side
    padding-left: 1rem;
    inset: var(--toolbar-height) 0 0;
    background-color: #7e7e7e;
    // permanently "display" the scrollbar
    scrollbar-gutter: stable;

    &:hover,
    &:focus,
    &:active {
      // show scrollbar on hover
      overflow: auto;
    }

    &::-webkit-scrollbar-thumb {
      background-color: black;
    }
    &::-webkit-scrollbar {
      background-color: transparent;
    }
    &::-webkit-scrollbar-track {
      background-color: transparent;
    }

    scrollbar-track-color: transparent;
    scrollbar-color: rgb(66, 66, 66) transparent;

    & * {
      //fixes page being cut off due to border
      box-sizing: content-box;
    }
  }

  .toolbar {
    position: absolute;
    top: 0;
    left: 0;
    padding: 0.25rem 0.5rem;
    inset-inline: 0;
    z-index: 9999;
    cursor: default;
    border-bottom: 1px solid var(--toolbar-border-color);
    background-color: var(--toolbar-background-color);
    color: var(--toolbar-color);

    #toolbarViewer {
      display: flex;
      align-items: center;

      #toolbarViewerLeft {
        flex-grow: 1;

        .splitToolbarButton {
          display: flex;
          align-items: center;
        }
      }

      #toolbarViewerMiddle {
        flex-grow: 1;
        margin-left: -2rem;
      }
    }

    input,
    select {
      text-align: center;
      border-radius: var(--base-radius);
      margin: 0 0.25rem;
      border: 0;
    }

    input {
      width: 3rem;
      padding: 0.5rem;
      font-size: 0.875rem;
      line-height: 1.25rem;
      background-color: #ffffff;
      border-radius: var(--base-radius);
      color: var(--toolbar-color);
    }

    select {
      padding: 0.5rem;
      font-size: 0.875rem;
      line-height: 1.25rem;
      background-color: var(--toolbar-background-color);
      border-radius: var(--base-radius);
      color: var(--toolbar-color);
    }

    button {
      -webkit-appearance: button;
      background-color: transparent;
      background-image: none;
      border: 0;
    }

    .toolbarButton {
      width: 2rem;
      height: 2rem;
      padding: 0;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      white-space: nowrap;
      font-size: 0.875rem;
      line-height: 1.25rem;
      font-weight: 500;
      transition-property: color, background-color, border-color, outline-color, text-decoration-color, fill, stroke;
      transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
      transition-duration: 0.15s;
      border-radius: var(--base-radius);

      &:hover {
        background-color: #cccccc;
      }
    }

    .toolbarInput {
      display: flex;
      align-items: center;
      text-align: left;
      width: 10rem;
      margin-left: 0.5rem;
      border: 0;
      background-color: #ffffff;
      border-radius: var(--base-radius);
      color: var(--toolbar-color);

      &:focus-within {
        border: 0;
      }

      i {
        flex-shrink: 0;
      }

      input {
        width: 100%;
        margin-left: 0.5rem;
        color: var(--toolbar-color);
      }
    }
  }
}
</style>
