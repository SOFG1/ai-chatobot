<script setup lang="ts">
import { RouterLink } from 'vue-router'

const props = defineProps<{
  icon: any
  title: string
  routeName: string
}>()
</script>

<template>
  <RouterLink class="sidebar-item" :to="{ name: props.routeName }">
    <component class="sidebar-item-icon" :is="props.icon" />
    <span class="text"> {{ props.title }} </span>
  </RouterLink>
</template>

<style lang="scss" scoped>
.sidebar-item {
  display: flex;
  width: auto;
  background-color: transparent;
  padding: 11px 16px 10px;
  align-items: center;
  gap: 10px;
  border-radius: 0.5rem;
  margin-bottom: 12px;
  font-family: Poppins, sans-serif;
  color: var(---color-text);
  text-decoration: none;
  font-size: 16px;
  line-height: normal;
  cursor: pointer;
  user-select: none;
  transition: all 0.15s ease-in-out;

  svg {
    flex-shrink: 0;
  }

  svg path {
    transition: stroke 0.15s ease-in-out;
  }
}

.text {
  max-width: 100%;
  white-space: nowrap;
  overflow-x: hidden;
  text-overflow: ellipsis;
}

.router-link-active {
  background-color: var(--color-primary);
  color: var(--color-text-secondary);

  :deep(svg path) {
    stroke: #fff;
  }
}

.sidebar-item-icon {
  width: 18px;
  height: 18px;
}
</style>
