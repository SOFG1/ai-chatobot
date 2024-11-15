<script setup lang="ts">
import searchIcon from "@/assets/icons/search-magnifier.svg?url"
const model = defineModel<string>()
defineProps<{ search?: boolean }>()

</script>

<template>
    <div class="container">
        <input type="text" v-model="model" v-bind="$attrs">
        <img class="icon" :src="searchIcon" alt="">
    </div>
</template>

<style scoped lang="scss">
.container {
    position: relative;
}

input {
    border: 1px solid var(--color-border);
    border-radius: 8px;
    width: 100%;
    padding: 19px 16px;
    background: var(--gradient-primary);
    outline: none;
    font-size: 16px;
    font-family: Mulish, sans-serif;

    &:hover {
        border-color: var(--color-border-hover)
    }

    &:focus {
        outline-color: var(--color-primary);
    }

    &::placeholder {
        color: var(--color-placeholder-grey);
    }
}

.icon {
    position: absolute;
    top: 20px;
    right: 16px;
    pointer-events: none;
}
</style>