<template>
  <div class="task-list">
    <div v-if="title" class="task-list-header">
      <a-typography-title :level="4">
        {{ title }}
        <a-tag color="blue">{{ filteredTasks.length }}</a-tag>
      </a-typography-title>

      <a-space v-if="showFilters">
        <a-select
            v-model:value="sortBy"
            style="width: 160px"
            size="small"
            placeholder="Trier par..."
        >
          <a-select-option value="createdAt">Date de création</a-select-option>
          <a-select-option value="deadline">Échéance</a-select-option>
          <a-select-option value="status">Statut</a-select-option>
          <a-select-option value="title">Titre</a-select-option>
        </a-select>

        <a-select
            v-model:value="filterStatus"
            style="width: 140px"
            size="small"
            placeholder="Filtrer statut"
            allow-clear
        >
          <a-select-option value="">Tous</a-select-option>
          <a-select-option :value="TASK_STATUS.NOT_VALIDATED">Non validé</a-select-option>
          <a-select-option :value="TASK_STATUS.VALIDATED">Validé</a-select-option>
          <a-select-option :value="TASK_STATUS.COMPLETED">Terminé</a-select-option>
        </a-select>
      </a-space>
    </div>

    <div v-if="filteredTasks.length > 0" class="task-list-content">
      <TaskCard
          v-for="task in sortedTasks"
          :key="task.id"
          :task="task"
          :can-edit="canEdit"
          :can-delete="canDelete"
          :can-validate="canValidate"
          :can-assign="canAssign"
          :users="users"
          @edit="$emit('edit', task)"
          @delete="$emit('delete', task)"
          @comment="$emit('comment', task)"
          @toggle-complete="$emit('toggle-complete', task)"
          @validate="$emit('validate', task)"
          @assign="$emit('assign', task)"
      />
    </div>

    <a-empty
        v-else
        :description="emptyText || 'Aucune tâche'"
        :image="Empty.PRESENTED_IMAGE_SIMPLE"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Empty } from 'ant-design-vue'
import TaskCard from './TaskCard.vue'
import { TASK_STATUS } from '@/stores/tasks.js'

const props = defineProps({
  tasks: {
    type: Array,
    default: () => []
  },
  title: {
    type: String,
    default: ''
  },
  emptyText: {
    type: String,
    default: ''
  },
  canEdit: {
    type: Boolean,
    default: false
  },
  canDelete: {
    type: Boolean,
    default: false
  },
  canValidate: {
    type: Boolean,
    default: false
  },
  canAssign: {
    type: Boolean,
    default: false
  },
  showFilters: {
    type: Boolean,
    default: true
  },
  users: {
    type: Array,
    default: () => []
  }
})

defineEmits(['edit', 'delete', 'comment', 'toggle-complete', 'validate', 'assign'])

const sortBy = ref('createdAt')
const filterStatus = ref('')

const filteredTasks = computed(() => {
  if (!filterStatus.value) return props.tasks
  return props.tasks.filter(task => task.status === filterStatus.value)
})

const sortedTasks = computed(() => {
  const tasks = [...filteredTasks.value]

  switch (sortBy.value) {
    case 'deadline':
      return tasks.sort((a, b) => {
        if (!a.deadline) return 1
        if (!b.deadline) return -1
        return new Date(a.deadline) - new Date(b.deadline)
      })

    case 'status':
      const statusOrder = {
        [TASK_STATUS.NOT_VALIDATED]: 1,
        [TASK_STATUS.VALIDATED]: 2,
        [TASK_STATUS.COMPLETED]: 3
      }
      return tasks.sort((a, b) => (statusOrder[a.status] || 999) - (statusOrder[b.status] || 999))

    case 'title':
      return tasks.sort((a, b) => a.title.localeCompare(b.title))

    case 'createdAt':
    default:
      return tasks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  }
})
</script>

<style scoped>
.task-list {
  width: 100%;
}

.task-list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f0f0f0;
}

.task-list-header :deep(.ant-typography) {
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.task-list-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 4px 0;
}
</style>
