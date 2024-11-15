<script setup lang="ts">
import QuestionIcon from '@/assets/icons/footer.svg'
import LinkIcon from '@/assets/icons/footer-link.svg'
import ImpressumIcon from '@/assets/icons/footer-impressum.svg'
import CopyRightIcon from '@/assets/icons/footer-copyright.svg'
import { ref } from 'vue'
import { OnClickOutside } from '@vueuse/components'

const opened = ref<boolean>(false)

const handleClickOutside = async (e: any) => {
  console.log()
  if (e?.target?.id !== 'footer-btn') {
    opened.value = false
  }
}
</script>

<template>
  <div class="footer">
    <button class="footer-btn" @click="opened = !opened" id="footer-btn">
      <QuestionIcon />
    </button>
    <OnClickOutside v-if="opened" @trigger="handleClickOutside">
      <div class="content">
        <a href="https://www.skillbyte.de/" target="_blank" class="item link">
          <LinkIcon />
          skillbyte
        </a>
        <a href="https://www.skillbyte.de/impressum/" target="_blank" class="item link">
          <ImpressumIcon />
          Impressum
        </a>
        <p href="" class="item">
          <CopyRightIcon />
          2024 TextSenseAI
        </p>
      </div>
    </OnClickOutside>
  </div>
</template>

<style lang="scss" scoped>
.footer {
  position: fixed;
  bottom: 26px;
  right: 39px;
  z-index: 100;
}

.footer-btn {
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  height: 24px;
  width: 24px;
  background-color: var(--footer-background);
  padding: 0;
  border: 0;
  border-radius: 50%;
}

.content {
  position: absolute;
  bottom: 30px;
  right: 5px;
  z-index: 100;
  background-color: #fff;
  padding: 9px 4px;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.2);
  border-radius: 14px;
}

.item {
  display: flex;
  color: var(--color-dark-grey);
  text-decoration: none;
  gap: 10px;
  min-width: 214px;
  padding: 8px 16px;
  transition: 300ms;
  border-radius: 4px;
}

.link:hover {
  background: #eee8fe;
}
</style>
