<script setup lang="ts">
import LogoIcon from '@/assets/icons/logo-icon.svg'
import { useUtilsStore } from '@/stores/utils'

const utilsStore = useUtilsStore()
</script>

<template>
  <LogoIcon class="logo-icon" :class="{ 'animate-logo-icon': utilsStore.isLoading }" />
</template>

<style scoped lang="scss">

</style>