<script setup>
import { ref, watch } from 'vue'
import dayjs from 'dayjs'
import { useAuthStore } from '@/stores/auth'

const props = defineProps({
  open: Boolean,
  project: Object,
  mode: {
    type: String,
    default: 'create'
  },
  users: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:open', 'submit'])

const auth = useAuthStore()
const currentUser = auth.currentUser

const formRef = ref()
const formData = ref({
  name: '',
  description: '',
  deadline: null,
  managers: currentUser ? [currentUser.id] : []
})

const rules = {
  name: [
    { required: true, message: 'Le nom est requis' },
    { min: 3, message: 'Le nom doit contenir au moins 3 caractères' }
  ],
  managers: [
    { type: 'array', required: true, min: 1, message: 'Au moins un manager est requis' }
  ],
  description: [
    { required: true, message: 'La description est requise' }
  ],
  deadline: [
    { required: true, message: 'La date limite est requise' }
  ]
}

watch(() => props.project, (newProject) => {
  if (newProject) {
    formData.value = {
      name: newProject.name || '',
      description: newProject.description || '',
      deadline: newProject.deadline ? dayjs(newProject.deadline) : null,
      managers: Array.isArray(newProject.managers) && newProject.managers.length > 0
          ? newProject.managers.slice()
          : (currentUser ? [currentUser.id] : [])
    }
  } else {
    resetForm()
  }
}, { immediate: true })

function disabledDate(current) {
  return current && current < dayjs().startOf('day')
}

async function handleOk() {
  try {
    await formRef.value.validate()
    emit('submit', {
      ...formData.value,
      deadline: formData.value.deadline ? formData.value.deadline.toISOString() : null,
      managers: Array.isArray(formData.value.managers) ? formData.value.managers.slice() : []
    })
    resetForm()
  } catch (error) {
    console.error('Validation error:', error)
  }
}

function handleCancel() {
  emit('update:open', false)
  resetForm()
}

function resetForm() {
  formData.value = {
    name: '',
    description: '',
    deadline: null,
    managers: currentUser ? [currentUser.id] : []
  }
  formRef.value?.resetFields()
}
</script>

<template>
  <a-modal
      :open="open"
      :title="mode === 'create' ? 'Nouveau Projet' : 'Modifier le Projet'"
      :ok-text="mode === 'create' ? 'Créer' : 'Modifier'"
      cancel-text="Annuler"
      @ok="handleOk"
      @cancel="handleCancel"
  >
    <a-form
        ref="formRef"
        :model="formData"
        :rules="rules"
        layout="vertical"
    >
      <a-form-item label="Nom du projet" name="name">
        <a-input v-model:value="formData.name" placeholder="Nom du projet" />
      </a-form-item>

      <a-form-item label="Managers" name="managers">
        <a-select
            v-model:value="formData.managers"
            mode="multiple"
            placeholder="Sélectionnez les managers"
            style="width: 100%"
            allow-clear
        >
          <a-select-option
              v-for="u in users"
              :key="u.id"
              :value="u.id"
          >
            {{ u.name || u.email || u.id }}
          </a-select-option>

          <a-select-option
              v-if="!users.length && currentUser"
              :key="currentUser.id"
              :value="currentUser.id"
          >
            {{ currentUser.name || currentUser.email || currentUser.id }}
          </a-select-option>
        </a-select>
      </a-form-item>

      <a-form-item label="Description" name="description">
        <a-textarea
            v-model:value="formData.description"
            placeholder="Description du projet"
            :rows="4"
        />
      </a-form-item>

      <a-form-item label="Date limite" name="deadline">
        <a-date-picker
            v-model:value="formData.deadline"
            style="width: 100%"
            format="DD/MM/YYYY"
            :disabled-date="disabledDate"
        />
      </a-form-item>
    </a-form>
  </a-modal>
</template>
