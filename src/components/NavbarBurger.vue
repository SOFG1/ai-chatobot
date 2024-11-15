<script setup lang="ts">
import { useUtilsStore } from '@/stores/utils'
const utilsStore = useUtilsStore()
</script>

<template>
    <button v-if="!utilsStore.sideBarOpened" class="burger" @click="utilsStore.sideBarOpened = true">
        <span class="burger-span"></span>
        <span class="burger-span"></span>
        <span class="burger-span"></span>
    </button>
</template>

<style scoped lang="scss">
.burger {
    height: 40px;
    width: 40px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
    padding: 7px;
    background-color: transparent;
    border: 0;
    margin-left: -7px;
}

.burger-span {
    font-size: 10px;
    width: 100%;
    height: 3px;
    border-radius: 3px;
    background-color: var(--color-text);
}

@media screen and (min-width: 787px) {
    .burger {
        display: none;
    }
}
</style>
