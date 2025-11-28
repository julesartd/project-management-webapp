<template>
  <div class="w-full">
    <div class="bg-white rounded-xl shadow-sm mb-4 p-4 md:p-6 border border-gray-100">
      <div class="flex items-center mb-4">
        <a-button type="text" @click="$emit('back')" class="flex items-center gap-2">
          <ArrowLeftOutlined />
          <span class="hidden sm:inline">Retour</span>
        </a-button>
      </div>

      <div class="mb-4">
        <h1 class="text-xl md:text-2xl font-bold text-gray-900 mb-2">{{ project.name }}</h1>
        <p class="text-sm md:text-base text-gray-600">{{ project.description }}</p>
      </div>

      <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-end">
        <a-tag v-if="isProjectManager" color="green" class="inline-flex items-center justify-center gap-2 px-3.5 py-2 text-sm font-semibold rounded-lg shadow-sm w-full md:w-auto">
          <CheckCircleOutlined class="flex items-center justify-center" style="font-size: 16px;" />
          <span>Vous gérez ce projet</span>
        </a-tag>
        <a-tag v-else color="orange" class="inline-flex items-center justify-center gap-2 px-3.5 py-2 text-sm font-semibold rounded-lg shadow-sm w-full md:w-auto">
          <ExclamationCircleOutlined class="flex items-center justify-center" style="font-size: 16px;" />
          <span>Vous ne gérez pas ce projet</span>
        </a-tag>

        <ActionButton
          v-if="!isProjectManager"
          variant="secondary"
          :icon="UserAddOutlined"
          @click="handleBecomeManager"
          class="w-full md:w-auto"
        >
          Se déclarer gérant
        </ActionButton>
        <ActionButton
          v-if="isProjectManager"
          variant="purple"
          :icon="PlusOutlined"
          @click="showCreateTaskForm"
          class="w-full md:w-auto"
        >
          Nouvelle tâche
        </ActionButton>
      </div>
    </div>

    <div class="p-6 bg-white rounded-xl shadow-sm mb-4 border border-gray-100">
      <a-row :gutter="[16, 16]">
        <a-col :xs="24" :sm="12" :md="6">
          <a-statistic
            title="Avancement global"
            :value="projectProgress"
            suffix="%"
            :value-style="{ color: progressColor }"
          >
            <template #prefix>
              <RiseOutlined v-if="projectProgress > 50" />
              <FallOutlined v-else />
            </template>
          </a-statistic>
        </a-col>

        <a-col :xs="24" :sm="12" :md="6">
          <a-statistic
            title="Tâches totales"
            :value="projectTasks.length"
          >
            <template #prefix>
              <FileTextOutlined />
            </template>
          </a-statistic>
        </a-col>

        <a-col :xs="24" :sm="12" :md="6">
          <a-statistic
            title="En cours"
            :value="inProgressCount"
            :value-style="{ color: '#1890ff' }"
          >
            <template #prefix>
              <ClockCircleOutlined />
            </template>
          </a-statistic>
        </a-col>

        <a-col :xs="24" :sm="12" :md="6">
          <a-statistic
            title="En retard"
            :value="overdueCount"
            :value-style="{ color: overdueCount > 0 ? '#ff4d4f' : '#52c41a' }"
          >
            <template #prefix>
              <WarningOutlined />
            </template>
          </a-statistic>
        </a-col>
      </a-row>
    </div>

    <a-alert
      v-if="isProjectManager && nonValidatedTasks.length > 0"
      type="warning"
      show-icon
      class="my-4 rounded-lg border-orange-200 bg-orange-50"
      style="margin-bottom: 15px;"
    >
      <template #message>
        <span class="font-medium">{{ nonValidatedTasks.length }} tâche(s) en attente de validation</span>
      </template>
      <template #description>
        <a-button type="link" size="small" @click="handleValidateAll" class="text-orange-600 hover:text-orange-800 font-medium pl-0">
          Valider toutes les tâches
        </a-button>
      </template>
    </a-alert>

    <a-tabs v-model:activeKey="activeTab" class="bg-white rounded-xl shadow-sm border border-gray-100">

      <a-tab-pane key="kanban" tab="Kanban">
        <div class="p-6">
          <KanbanBoard
            :tasks="projectTasks"
            :users="allUsers"
            :is-project-manager="isProjectManager"
            @update-status="handleStatusChange"
            @open-task="handleOpenTask"
            @comment="handleComment"
          />
        </div>
      </a-tab-pane>

      <a-tab-pane key="all" tab="Toutes les tâches">
        <div class="p-6">
          <TaskList
            :tasks="projectTasks"
            :can-edit="isProjectManager"
            :can-delete="isProjectManager"
            :can-validate="isProjectManager"
            :can-assign="isProjectManager"
            :users="allUsers"
            empty-text="Aucune tâche dans ce projet"
            @edit="handleEditTask"
            @delete="handleDeleteTask"
            @comment="handleComment"
            @toggle-complete="handleToggleComplete"
            @validate="handleValidateTask"
            @assign="handleAssignTask"
          />
        </div>
      </a-tab-pane>

      <a-tab-pane key="non-validated" :tab="`Non validées (${nonValidatedTasks.length})`">
        <div class="p-6">
          <TaskList
            :tasks="nonValidatedTasks"
            :can-edit="isProjectManager"
            :can-delete="isProjectManager"
            :can-validate="isProjectManager"
            :can-assign="isProjectManager"
            :users="allUsers"
            empty-text="Aucune tâche en attente de validation"
            @edit="handleEditTask"
            @delete="handleDeleteTask"
            @comment="handleComment"
            @validate="handleValidateTask"
            @assign="handleAssignTask"
          />
        </div>
      </a-tab-pane>

      <a-tab-pane key="overdue" :tab="`En retard (${overdueCount})`">
        <div class="p-6">
          <TaskList
            :tasks="overdueTasks"
            :can-edit="isProjectManager"
            :can-delete="isProjectManager"
            :can-validate="isProjectManager"
            :can-assign="isProjectManager"
            :users="allUsers"
            empty-text="Aucune tâche en retard"
            @edit="handleEditTask"
            @delete="handleDeleteTask"
            @comment="handleComment"
            @toggle-complete="handleToggleComplete"
            @validate="handleValidateTask"
            @assign="handleAssignTask"
          />
        </div>
      </a-tab-pane>
    </a-tabs>

    <TaskForm
      v-model:open="taskFormVisible"
      :mode="taskFormMode"
      :task="selectedTask"
      :users="allUsers"
      :can-assign-users="isProjectManager"
      @submit="handleTaskSubmit"
    />

    <a-modal
      v-model:open="commentsVisible"
      :title="`Commentaires - ${selectedTask?.title || ''}`"
      width="700px"
      :footer="null"
    >
      <TaskComments
        v-if="selectedTask"
        :task="selectedTask"
        @add-comment="handleAddComment"
      />
    </a-modal>

    <a-modal
      v-model:open="deleteModalVisible"
      title="Confirmer la suppression"
      @ok="confirmDelete"
    >
      <p>Êtes-vous sûr de vouloir supprimer la tâche "{{ taskToDelete?.title }}" ?</p>
      <p>Cette action est irréversible.</p>
    </a-modal>

    <TaskAssignModal
      v-model:open="assignModalVisible"
      :task="taskToAssign"
      :users="allUsers"
      @submit="handleAssignSubmit"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { message } from 'ant-design-vue'
import {
  PlusOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  UserAddOutlined,
  RiseOutlined,
  FallOutlined,
  FileTextOutlined,
  ClockCircleOutlined,
  WarningOutlined,
  ArrowLeftOutlined
} from '@ant-design/icons-vue'
import { useAuthStore } from '@/stores/auth'
import { useTasksStore, TASK_STATUS } from '@/stores/tasks'
import { useProjectsStore } from '@/stores/projects'
import ActionButton from '@/components/common/ActionButton.vue'
import TaskList from '@/components/tasks/TaskList.vue'
import TaskComments from '@/components/tasks/TaskComments.vue'
import TaskForm from '@/components/tasks/TaskForm.vue'
import TaskAssignModal from '@/components/tasks/TaskAssignModal.vue'
import KanbanBoard from "@/components/tasks/KanbanBoard.vue";

const props = defineProps({
  project: {
    type: Object,
    required: true
  },
  allUsers: {
    type: Array,
    default: () => []
  }
})

defineEmits(['back'])

const authStore = useAuthStore()
const tasksStore = useTasksStore()
const projectsStore = useProjectsStore()

const isMobile = ref(window.innerWidth <= 768)
const activeTab = ref(isMobile.value ? 'all' : 'kanban')
const taskFormVisible = ref(false)
const taskFormMode = ref('create')
const selectedTaskId = ref(null)
const selectedTask = computed(() => {
  if (!selectedTaskId.value) return null
  return tasksStore.getTask(selectedTaskId.value)
})
const commentsVisible = ref(false)
const deleteModalVisible = ref(false)
const taskToDelete = ref(null)
const assignModalVisible = ref(false)
const taskToAssignId = ref(null)
const taskToAssign = computed(() => {
  if (!taskToAssignId.value) return null
  return tasksStore.getTask(taskToAssignId.value)
})

const isProjectManager = computed(() => {
  return props.project.managers?.includes(authStore.currentUser?.id)
})

const projectTasks = computed(() => {
  return tasksStore.getTasksByProject(props.project.id)
})


const nonValidatedTasks = computed(() => {
  return tasksStore.getNonValidatedTasks(props.project.id)
})

const overdueTasks = computed(() => {
  return projectTasks.value.filter(task => {
    if (!task.deadline) return false
    if (task.status === TASK_STATUS.COMPLETED) return false
    return new Date(task.deadline) < new Date()
  })
})

const projectProgress = computed(() => {
  return projectsStore.getProjectProgress(props.project.id)
})

const inProgressCount = computed(() => {
  return projectTasks.value.filter(t => {
    const isCompleted = t.status === TASK_STATUS.COMPLETED
    const isNotValidated = t.status === TASK_STATUS.NOT_VALIDATED
    return !isCompleted && !isNotValidated
  }).length
})

const overdueCount = computed(() => {
  return overdueTasks.value.length
})

const progressColor = computed(() => {
  if (projectProgress.value >= 75) return '#52c41a'
  if (projectProgress.value >= 50) return '#1890ff'
  if (projectProgress.value >= 25) return '#faad14'
  return '#ff4d4f'
})

function handleBecomeManager() {
  try {
    projectsStore.addManager(props.project.id, authStore.currentUser.id)
    message.success('Vous êtes maintenant gérant de ce projet')
  } catch (error) {
    message.error(error.message || 'Erreur')
  }
}

function showCreateTaskForm() {
  if (!isProjectManager.value) {
    message.warning('Seuls les gérants de ce projet peuvent créer des tâches')
    return
  }
  taskFormMode.value = 'create'
  selectedTaskId.value = null
  taskFormVisible.value = true
}

function handleEditTask(task) {
  if (!isProjectManager.value) {
    message.warning('Seuls les gérants de ce projet peuvent modifier des tâches')
    return
  }
  taskFormMode.value = 'edit'
  selectedTaskId.value = task.id
  taskFormVisible.value = true
}

function handleDeleteTask(task) {
  if (!isProjectManager.value) {
    message.warning('Seuls les gérants de ce projet peuvent supprimer des tâches')
    return
  }
  taskToDelete.value = task
  deleteModalVisible.value = true
}

function confirmDelete() {
  try {
    tasksStore.deleteTask(taskToDelete.value.id)
    message.success('Tâche supprimée')
    deleteModalVisible.value = false
    taskToDelete.value = null
  } catch (error) {
    message.error(error.message || 'Erreur')
  }
}

function handleTaskSubmit(formData) {
  try {
    if (taskFormMode.value === 'create') {
      tasksStore.createTask(
        props.project.id,
        {
          ...formData,
          status: TASK_STATUS.VALIDATED
        },
        authStore.currentUser.id
      )
      message.success('Tâche créée avec succès')
    } else {
      tasksStore.updateTask(selectedTaskId.value, formData)
      message.success('Tâche modifiée avec succès')
    }
    taskFormVisible.value = false
  } catch (error) {
    message.error(error.message || 'Erreur')
  }
}

function handleValidateTask(task) {
  if (!isProjectManager.value) {
    message.warning('Seuls les gérants de ce projet peuvent valider des tâches')
    return
  }

  try {
    tasksStore.validateTask(task.id, authStore.currentUser.id)
    message.success('Tâche validée')
  } catch (error) {
    message.error(error.message || 'Erreur')
  }
}

function handleValidateAll() {
  try {
    let count = 0
    nonValidatedTasks.value.forEach(task => {
      tasksStore.validateTask(task.id, authStore.currentUser.id)
      count++
    })
    message.success(`${count} tâche(s) validée(s)`)
  } catch (error) {
    message.error(error.message || 'Erreur')
  }
}

function handleToggleComplete(task) {
  try {
    tasksStore.toggleComplete(task.id)
    message.success(
      task.status === TASK_STATUS.COMPLETED
        ? 'Tâche marquée comme terminée'
        : 'Tâche marquée comme non terminée'
    )
  } catch (error) {
    message.error(error.message || 'Erreur')
  }
}

function handleComment(task) {
  selectedTaskId.value = task.id
  commentsVisible.value = true
}

function handleAddComment(commentData) {
  try {
    tasksStore.addComment(selectedTaskId.value, {
      text: commentData.text,
      authorId: authStore.currentUser.id
    })
    message.success('Commentaire ajouté')
  } catch (error) {
    message.error(error.message || 'Erreur')
  }
}

function handleAssignTask(task) {
  if (!isProjectManager.value) {
    message.warning('Seuls les gérants de ce projet peuvent affecter des personnes')
    return
  }
  taskToAssignId.value = task.id
  assignModalVisible.value = true
}

function handleAssignSubmit(selectedUserIds) {
  try {
    const currentAssignedIds = taskToAssign.value?.assignedTo || []

    const toAdd = selectedUserIds.filter(id => !currentAssignedIds.includes(id))

    const toRemove = currentAssignedIds.filter(id => !selectedUserIds.includes(id))

    toAdd.forEach(userId => {
      tasksStore.assignUser(taskToAssignId.value, userId)
    })

    toRemove.forEach(userId => {
      tasksStore.unassignUser(taskToAssignId.value, userId)
    })

    message.success('Affectations mises à jour')
    assignModalVisible.value = false
    taskToAssignId.value = null
  } catch (error) {
    message.error(error.message || 'Erreur lors de la mise à jour des affectations')
  }
}

function handleStatusChange(taskId, newStatus) {
  try {
    tasksStore.updateTaskStatus(taskId, newStatus)
    message.success('Statut de la tâche mis à jour')
  } catch (error) {
    message.error(error.message || 'Erreur lors de la mise à jour du statut')
  }
}

function handleOpenTask(task) {
  handleEditTask(task);
}

</script>

<style scoped>
@import "../../index.css";

@media (max-width: 768px) {
  :deep(.ant-tabs-tab:first-child) {
    display: none !important;
  }
}

:deep(.ant-page-header-heading-title) {
  @apply text-xl font-bold text-gray-900;
}

:deep(.ant-page-header-heading-sub-title) {
  @apply text-gray-500 text-sm;
}

:deep(.ant-statistic-title) {
  @apply text-sm text-gray-500 font-medium mb-1;
}

:deep(.ant-statistic-content) {
  @apply text-2xl font-bold text-gray-800;
}

:deep(.ant-tabs-nav) {
  @apply px-6 pt-4 mb-0 border-b border-gray-100;
}

:deep(.ant-tabs-tab) {
  @apply px-4 py-3 font-medium text-gray-600 hover:text-indigo-600 transition-colors;
}

:deep(.ant-tabs-tab-active .ant-tabs-tab-btn) {
  @apply text-indigo-600 font-semibold;
}

:deep(.ant-tabs-ink-bar) {
  @apply bg-indigo-600;
}

/* Center badge icons */
:deep(.ant-tag) {
  @apply flex items-center;
}

:deep(.ant-tag .anticon) {
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
  vertical-align: middle;
}
</style>

