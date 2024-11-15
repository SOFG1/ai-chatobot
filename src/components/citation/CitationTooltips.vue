<script setup lang="ts">
import { useConversationsStore } from '@/stores/conversations'
import type { Citation } from '@/types'
import { ref, Teleport } from 'vue'
import { Tippy } from 'vue-tippy'
import { useMounted } from '@vueuse/core'
import { storeToRefs } from 'pinia'

const props = defineProps<{
  citations: Citation[]
  tooltips: { citation: number; selector: string }[]
}>()

const popupRefs = ref<HTMLDivElement>()
const tooltipPosition = ref<any>({})

const mounted = useMounted()

const conversationsStore = useConversationsStore()
const { openedCitation } = storeToRefs(conversationsStore)

const onOpen = (c: Citation) => {
  openedCitation.value = c
}
</script>

<template>
  <template v-if="mounted">
    <Teleport v-for="t in props.tooltips" :to="t.selector" :key="t.selector">
      <Tippy placement="bottom" class="wrapper" :duration="0">
        <template #content>
          <div class="citation-popup" ref="popupRefs" :class="tooltipPosition">
            <div class="popup-header" @click="() => onOpen(props.citations[t.citation])">
              <span class="badge">PDF</span>
              <span class="desc" v-html="props.citations[t.citation]?.file_name"></span>
              <span class="page" v-html="t.citation + 1"></span>
            </div>
            <p class="popup-text">{{ props.citations[t.citation]?.context_content }}</p>
          </div>
        </template>
      </Tippy>
    </Teleport>
  </template>
</template>

<style scoped lang="scss">
.wrapper {
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  bottom: 0;
}

.target {
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  bottom: 0;
}

.page {
  position: absolute;
  right: 12px;
  top: 12px;
  background: var(--gradient-secondary);
  border-radius: 50%;
  padding: 2px 5px;
  font-family: Mulish, sans-serif;
  font-weight: 700;
  height: 14px;
  font-size: 9px;
  line-height: 11.3px;
  text-align: center;
}

.desc {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.citation-popup {
  width: 320px;
  background-color: #fff;
  cursor: auto;
  padding: 12px;
  border-radius: 8px;
  box-shadow: 0 2px 16px rgba(0, 0, 0, 0.18);
}

.popup-text {
  display: -webkit-box;
  -webkit-line-clamp: 7;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  word-break: break-word;
  font-size: 14px;
  line-height: 1.4;
  color: var(--color-text-dark);
  font-family: 'Mulish', sans-serif;
  margin-bottom: 0 !important;
}

.popup-header {
  display: flex;
  align-items: center;
  gap: 5px;
  padding-right: 20px;
  cursor: pointer;
}

.popup-header .badge {
  position: static !important;
}

.popup-header .page {
  margin-left: auto;
}

.badge {
  display: inline-block;
  background: var(--gradient-secondary);
  text-transform: uppercase;
  line-height: 12px;
  border-radius: 4px;
  border: 1px solid var(--color-citation-border);
  background: var(--color-primary);
  color: var(--color-text-secondary);
  height: 14px;
  width: 24px;
  font-size: 9px;
  text-align: center;
}
</style>
