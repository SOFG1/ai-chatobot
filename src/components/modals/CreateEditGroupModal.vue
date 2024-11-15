<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { VueFinalModal } from 'vue-final-modal'
import type { CreateGroupPayload } from '@/types'
import { toast } from 'vue3-toastify'
import { useGroupsStore } from '@/stores/groups'
import GroupMembers from '@/components/GroupMembers.vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps<{ groupId: string }>()
const emit = defineEmits<{
  (e: 'close'): void
}>()

const groupsStore = useGroupsStore()

// TEX-605: Remove when group icons are implemented
const groupIconImplemented = false
const name = ref<string>('')
const description = ref<string>('')
const icon = ref<string>('')
const isLoading = ref<boolean>(false)
const errors = ref<{ [key: string]: string }>({})

const editGroup = computed(() => groupsStore.groups.find((g) => g.id === props.groupId))

const handleCreate = async () => {
  errors.value = {}
  const data: CreateGroupPayload = {
    name: name.value,
    description: description.value,
    icon: icon.value || undefined
  }
  try {
    isLoading.value = true
    await groupsStore.createGroup(data)
    toast(t('groups.create-group.success'), {
      autoClose: 3000,
      type: 'success'
    })
    emit('close')
  } catch (e: any) {
    const detail = e?.response?.data?.detail
    let message = t('groups.create-group.error')
    if (detail && detail?.error_code) {
      message = t(detail?.error_code, detail?.extra)
      console.log('Error on create group: ' + detail)
    } else {
      console.log('Unexpected error on create group.')
    }
    toast(message, {
      autoClose: 3000,
      type: 'error'
    })
  } finally {
    isLoading.value = false
  }
}

const handleEdit = async () => {
  errors.value = {}
  const data: any = {}
  if (name.value) data.name = name.value
  if (description.value) data.description = description.value
  if (icon.value) data.icon = icon.value

  try {
    isLoading.value = true
    await groupsStore.editGroup(props.groupId, data)

    toast(t('groups.edit-group.success'), {
      autoClose: 3000,
      type: 'success'
    })

    emit('close')
  } catch (e: any) {
    const detail = e?.response?.data?.detail
    let message = t('groups.create-group.error')
    if (detail && detail?.error_code) {
      message = t(detail?.error_code, detail?.extra)
      console.log('Error on create group: ' + detail)
    } else {
      console.log('Unexpected error on create group.')
    }
    toast(message, {
      autoClose: 3000,
      type: 'error'
    })
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  if (editGroup.value) {
    name.value = editGroup.value.name
    description.value = editGroup.value.description
    icon.value = editGroup.value.icon
  }
})
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
      <h1 v-if="!editGroup">{{ t('groups.create-group.title') }}</h1>
      <h1 v-if="editGroup">{{ t('groups.edit-group.title') }}</h1>
      <div class="form-group">
        <label for="name">{{ t('groups.create-group.name') }}</label>
        <input :placeholder="t('groups.create-group.name')" class="tsai-input" type="text" id="name" v-model="name" />
        <p v-if="errors.name" class="error-msg">{{ errors.name }}</p>
      </div>
      <div class="form-group">
        <label for="description">{{ t('groups.create-group.description') }}</label>
        <input
          :placeholder="t('groups.create-group.description')"
          class="tsai-input"
          type="text"
          id="description"
          v-model="description"
        />
        <p v-if="errors.description" class="error-msg">{{ errors.description }}</p>
      </div>
      <div class="form-group" v-if="groupIconImplemented">
        <label for="icon">{{ t('groups.create-group.icon') }}</label>
        <input :placeholder="t('groups.create-group.icon')" class="tsai-input" type="text" id="icon" v-model="icon" />
        <p v-if="errors.icon" class="error-msg">{{ errors.icon }}</p>
      </div>
      <div class="button-section">
        <button
          v-if="!editGroup"
          class="tsai-button"
          role="button"
          type="button"
          @click="handleCreate"
          :disabled="isLoading"
        >
          {{ t('groups.create-group.create') }}
        </button>
        <button
          v-if="editGroup"
          class="tsai-button"
          role="button"
          type="button"
          @click="handleEdit"
          :disabled="isLoading"
        >
          {{ t('groups.edit-group.button') }}
        </button>
        <p v-if="isLoading && !editGroup">{{ t('groups.create-group.loading') }}</p>
        <p v-if="isLoading && editGroup">{{ t('groups.edit-group.loading') }}</p>
      </div>
      <GroupMembers v-if="editGroup" :groupId="editGroup.id" :members="editGroup.member" />
    </div>
  </VueFinalModal>
</template>

<style lang="scss" scoped>
.content {
  width: 430px;
}

.form-group {
  margin-bottom: 20px;
}

h1 {
  margin-bottom: 34px;
  line-height: 1;
}

@media screen and (max-width: 786px) {
  h1 {
    margin-bottom: 20px;
  }

  .form-group {
    margin-bottom: 18px;
  }

  .content {
    width: 450px;
    max-width: 390px;
  }
}

@media screen and (max-width: 540px) {
  .content {
    width: 100%;
    max-width: 310px;
  }

  .form-group {
    margin-bottom: 16px;
  }
}
</style>
