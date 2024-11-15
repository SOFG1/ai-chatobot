<script setup lang="ts">
import { ref, watch } from 'vue'
import { VueFinalModal } from 'vue-final-modal'
import { useUsersStore } from '@/stores/users'
import { roleOptions } from '@/constants'
import { useI18n } from 'vue-i18n'
import TsaiDropdown from '@/components/form/TsaiDropdown.vue'

const { t } = useI18n()

const props = defineProps<{ id: string | null; scopes: string }>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const usersStore = useUsersStore()

const role = ref<'Admin' | 'User'>('Admin')
const isLoading = ref<boolean>(false)

const handleChangeRole = (e: any) => (role.value = e.value)

const handleEdit = async () => {
  isLoading.value = true
  // const scopes = value.value.map(v => v.value)
  const scopes = role.value === 'Admin' ? ['*'] : ['conversations', 'chatbots', 'files', 'groups']
  try {
    await usersStore.editUserScopes(props.id as string, scopes)
    emit('close')
  } catch (e) {
    /* empty */
  }
  isLoading.value = false
}

//Set user's role
watch(
  () => props.scopes,
  () => {
    role.value = props.scopes === '*' ? 'Admin' : 'User'
  }
)
</script>

<template>
  <VueFinalModal
    class="final-modal"
    content-class="final-modal-content"
    overlay-transition="vfm-fade"
    content-transition="vfm-fade"
  >
    <button class="final-modal-close" @click="$emit('close')" />
    <div class="content">
      <h1>{{ $t('settings.edit-user-role.title') }}</h1>
      <TsaiDropdown
        :modelValue="{ label: role, value: role }"
        @update:model-value="handleChangeRole"
        :label="t('settings.edit-user-role.label')"
        :placeholder="t('settings.edit-user-role.label')"
        :options="roleOptions"
      />
      <button class="tsai-button" @click="handleEdit" :disabled="isLoading">
        {{ $t('settings.edit-user-role.edit-action') }}
      </button>
    </div>
  </VueFinalModal>
</template>

<style lang="scss" scoped>
.content {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 200px;
  width: 500px;
}

.tsai-button {
  width: fit-content;
}

@media screen and (max-width: 600px) {
  .content {
    width: 100%;
  }
}
</style>
