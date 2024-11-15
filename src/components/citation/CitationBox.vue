<script setup lang="ts">
import { useConversationsStore } from '@/stores/conversations'
import type { Citation } from '@/types'

const props = defineProps<{
  citation: Citation
  citationPosition: number
}>()

const conversationsStore = useConversationsStore()

const onOpen = () => {
  conversationsStore.openedCitation = props.citation
}
</script>

<template>
  <div v-if="citation" class="citation-item" @click="onOpen">
    <div class="content">
      <span v-html="citation?.context_content ?? ''"></span>
    </div>
    <div class="citation-item-footer">
      <span class="badge square file-type">PDF</span>
      <span class="desc" v-html="citation?.file_name"></span>
      <span class="badge circle page" v-html="citationPosition"></span>
    </div>
  </div>
</template>

<style scoped lang="scss">
.citation-item {
  cursor: pointer;
  position: relative;
  padding: 14px 12px;
  font-size: 12px;
  border-radius: 8px;
  background: var(--gradient-citation);
  height: 116px;
  width: 235px;

  .content {
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    font-family: Mulish, sans-serif;
    font-size: 14px;
    line-height: 1.2;
    overflow: hidden;
    text-overflow: ellipsis;
    word-break: break-word;
    width: 174px;
    height: auto;
  }

  .citation-item-footer {
    position: absolute;
    left: 12px;
    right: 12px;
    bottom: 11px;

    .desc {
      margin-left: 30px;
      font-size: 12px;
      overflow: hidden;
      text-overflow: ellipsis;
      width: 72%;
      display: block;
      line-height: 12px;
      height: 14px;
    }
  }

  .badge {
    display: inline-block;
    // border: 1px solid rgba(109, 109, 109, 0.2);
    background: var(--gradient-secondary);
    text-transform: uppercase;
    line-height: 12px;

    &.file-type {
      position: absolute;
      left: 0;
    }

    &.square {
      border-radius: 4px;
      border: 1px solid var(--color-citation-border);
      background: var(--color-primary);
      color: var(--color-text-secondary);
      height: 14px;
      width: 24px;
      font-size: 9px;
      line-height: 11.3px;
      text-align: center;
    }

    &.circle {
      border-radius: 50%;
    }

    &.page {
      position: absolute;
      right: 0;
      background: var(--color-background);
      padding: 2px 5px;
      font-family: Mulish, sans-serif;
      font-size: 8px;
      font-weight: 700;
      height: 14px;
      font-size: 9px;
      line-height: 11.3px;
      text-align: center;
      bottom: 0;
    }
  }
}
</style>
