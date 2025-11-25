<template>
  <a-modal
      :visible="visible"
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

<script setup>
import { ref, watch } from 'vue'
import dayjs from 'dayjs'

const props = defineProps({
  visible: Boolean,
  project: Object,
  mode: {
    type: String,
    default: 'create'
  }
})

const emit = defineEmits(['update:visible', 'submit'])

const formRef = ref()
const formData = ref({
  name: '',
  description: '',
  deadline: null
})

const rules = {
  name: [
    { required: true, message: 'Le nom est requis' },
    { min: 3, message: 'Le nom doit contenir au moins 3 caractères' }
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
      name: newProject.name,
      description: newProject.description,
      deadline: dayjs(newProject.deadline)
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
      deadline: formData.value.deadline.toISOString()
    })
    resetForm()
  } catch (error) {
    console.error('Validation error:', error)
  }
}

function handleCancel() {
  emit('update:visible', false)
  resetForm()
}

function resetForm() {
  formData.value = {
    name: '',
    description: '',
    deadline: null
  }
  formRef.value?.resetFields()
}
</script>
