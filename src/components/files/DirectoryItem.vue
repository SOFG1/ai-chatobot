<script setup lang="ts">
import DirectoryIcon from '@/assets/icons/directory-arrow.svg'

defineProps<{ name: string }>()
</script>

<template>
  <span class="item" data-testId="directory-item">
    <DirectoryIcon />
    <button class="button">{{ name }}</button>
  </span>
</template>

<style lang="scss" scoped>
.item {
  margin-left: 6px;
}

.button {
  border: 0;
  cursor: pointer;
  background-color: var(--color-directory-bg);
  border-radius: 50px;
  padding: 8px 16px;
  margin-left: 6px;
  border-radius: 50px;
  transition: 250ms;
}
</style>
