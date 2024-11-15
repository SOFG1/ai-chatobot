<script setup lang="ts">
import { RouterView } from 'vue-router'
import Sidebar from '@/components/SidebarMenu.vue'
import Navbar from '@/components/TsaiNavbar.vue'
import { ModalsContainer } from 'vue-final-modal'
import Footer from '@/components/TsaiFooter.vue'
</script>

<template>
  <header>
    <Navbar />
  </header>
  <div class="flex-wrapper">
    <Sidebar />
    <div class="view">
      <RouterView />
    </div>
    <Footer />
  </div>
  <ModalsContainer />
</template>

<style scoped lang="scss">
header {
  height: 82px;
  display: flex;
  justify-content: space-between;
  flex-direction: row;
  align-content: center;
  align-items: center;
}
.flex-wrapper {
  display: flex;
  height: calc(100% - 82px);
  justify-content: space-between;
  flex-direction: row;
}
.view {
  width: 100%;
  height: 100%;
  overflow-y: auto;
}

@media screen and (max-width: 786px) {
  header {
    padding: 16px 40px;
  }
  .view {
    overflow-y: visible;
  }
}

@media screen and (max-width: 500px) {
  header {
    padding: 16px 20px;
  }
}
</style>
