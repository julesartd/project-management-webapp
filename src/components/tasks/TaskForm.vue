<template>
  <a-modal
    :open="open"
    :title="mode === 'create' ? 'Nouvelle tâche' : 'Modifier la tâche'"
    :confirm-loading="loading"
    @ok="handleSubmit"
    @cancel="handleCancel"
    width="600px"
  >
    <a-form
      ref="formRef"
      :model="formData"
      :rules="rules"
      layout="vertical"
    >
      <a-form-item label="Titre" name="title">
        <a-input
          v-model:value="formData.title"
          placeholder="Ex: Implémenter l'authentification"
          :maxlength="100"
          show-count
        />
      </a-form-item>

      <a-form-item label="Description" name="description">
        <a-textarea
          v-model:value="formData.description"
          placeholder="Décrivez la tâche en détail..."
          :rows="4"
          :maxlength="500"
          show-count
        />
      </a-form-item>

      <a-form-item label="Échéance" name="deadline">
        <a-date-picker
          v-model:value="formData.deadline"
          style="width: 100%"
          format="DD/MM/YYYY"
          :disabled-date="disabledDate"
        />
      </a-form-item>

      <a-form-item v-if="canAssignUsers" label="Affecter à" name="assignedTo">
        <a-select
          v-model:value="formData.assignedTo"
          mode="multiple"
          placeholder="Sélectionner des utilisateurs"
          :options="userOptions"
          :filter-option="filterUsers"
          show-search
        >
          <template #option="{ value, label, avatar }">
            <a-space>
              <a-avatar :src="avatar" size="small">
                {{ label.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) }}
              </a-avatar>
              {{ label }}
            </a-space>
          </template>
        </a-select>
      </a-form-item>

      <a-alert
        v-if="!canAssignUsers && mode === 'create'"
        message="Statut initial : Non validé"
        description="En tant que developer, les tâches que vous créez auront le statut 'Non validé' jusqu'à validation par un manager."
        type="info"
        show-icon
        style="margin-top: 16px"
      />
    </a-form>
  </a-modal>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { message } from 'ant-design-vue'
import dayjs from 'dayjs'

const props = defineProps({
  open: {
    type: Boolean,
    default: false
  },
  mode: {
    type: String,
    default: 'create',
    validator: (value) => ['create', 'edit'].includes(value)
  },
  task: {
    type: Object,
    default: null
  },
  users: {
    type: Array,
    default: () => []
  },
  canAssignUsers: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:open', 'submit', 'cancel'])

const formRef = ref(null)
const loading = ref(false)

const formData = ref({
  title: '',
  description: '',
  deadline: null,
  assignedTo: []
})

const rules = {
  title: [
    { required: true, message: 'Le titre est obligatoire', trigger: 'blur' },
    { min: 3, message: 'Le titre doit contenir au moins 3 caractères', trigger: 'blur' }
  ],
  description: [
    { max: 500, message: 'La description ne peut pas dépasser 500 caractères', trigger: 'blur' }
  ]
}

const userOptions = computed(() => {
  return props.users.map(user => ({
    label: user.name,
    value: user.id,
    avatar: user.avatar
  }))
})

watch(() => props.open, (newVal) => {
  if (newVal) {
    resetForm()
    if (props.mode === 'edit' && props.task) {
      formData.value = {
        title: props.task.title || '',
        description: props.task.description || '',
        deadline: props.task.deadline ? dayjs(props.task.deadline) : null,
        assignedTo: props.task.assignedTo || []
      }
    }
  }
})

function resetForm() {
  formData.value = {
    title: '',
    description: '',
    deadline: null,
    assignedTo: []
  }
  formRef.value?.resetFields()
}

function disabledDate(current) {
  return current && current < dayjs().startOf('day')
}

function filterUsers(input, option) {
  return option.label.toLowerCase().includes(input.toLowerCase())
}

async function handleSubmit() {
  try {
    await formRef.value.validate()
    loading.value = true

    const payload = {
      title: formData.value.title,
      description: formData.value.description,
      deadline: formData.value.deadline ? formData.value.deadline.toISOString() : null,
      assignedTo: formData.value.assignedTo
    }

    emit('submit', payload)
    loading.value = false
  } catch (error) {
    loading.value = false
    message.error('Veuillez corriger les erreurs dans le formulaire')
  }
}

function handleCancel() {
  resetForm()
  emit('update:open', false)
  emit('cancel')
}
</script>
