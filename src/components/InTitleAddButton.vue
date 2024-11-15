<script setup lang="ts">
import PlusIcon from '@/assets/icons/plus.svg?url'
</script>

<template>
  <div class="in-title-add-button" data-testId="files-add-button">
    <img :src="PlusIcon" alt="" />
  </div>
</template>

<style scoped lang="scss">
.in-title-add-button {
  position: relative;
  cursor: pointer;
  width: 26px;
  height: 26px;
  margin-left: 14px;
  border-radius: 999px;
  transition: all 0.1s ease-in-out;
  user-select: none;
  font-family: inherit;
  border: 0;
  background-color: transparent;

  &:hover {
    box-shadow: 0 0 6px 3px rgba(169, 0, 247, 0.1);
  }
}

.in-title-add-button img {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  object-fit: contain;
}

@media screen and (max-width: 786px) {
  .in-title-add-button {
    margin-left: auto;
  }
}
</style>
