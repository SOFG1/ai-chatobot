<script setup lang="ts">
const logoUrl = getComputedStyle(document.body).getPropertyValue('--logo-url').replace(/"/g, '')
</script>

<template>
  <router-link class="logo" :to="{ name: 'home' }">
    <img :src="logoUrl" alt="logo" />
  </router-link>
</template>

<style scoped>
.logo {
  background-color: transparent;
  border: 0;
  cursor: pointer;
  padding: 0 0 0 50px;

  img {
    height: 25px;
    max-height: 52px;
  }
}

@media screen and (max-width: 786px) {
  .logo {
    display: none;
  }
}
</style>
