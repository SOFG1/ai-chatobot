<script setup lang="ts">
import LogoIcon from '@/assets/icons/logo-icon.svg'

const version = import.meta.env.VITE_APP_VERSION

</script>

<template>
  <main class="version-view">
    <div class="view-title">
      <LogoIcon class="logo-icon" />
      <h1>Frontend version: {{version}}</h1>
    </div>

  </main>
</template>

<style>
@media (min-width: 1024px) {
}
</style>
