<template>
  <div class="manager-project-view">
    <a-page-header
      @back="$emit('back')"
      :title="project.name"
      :sub-title="project.description"
    >
      <template #tags>
        <a-tag v-if="isProjectManager" color="green">
          <CheckCircleOutlined /> Vous gérez ce projet
        </a-tag>
        <a-tag v-else color="orange">
          <ExclamationCircleOutlined /> Vous ne gérez pas ce projet
        </a-tag>
      </template>

      <template #extra>
        <a-space>
          <ActionButton
            v-if="!isProjectManager"
            variant="secondary"
            :icon="UserAddOutlined"
            @click="handleBecomeManager"
          >
            Se déclarer gérant
          </ActionButton>
          <ActionButton
            v-if="isProjectManager"
            variant="purple"
            :icon="PlusOutlined"
            @click="showCreateTaskForm"
          >
            Nouvelle tâche
          </ActionButton>
        </a-space>
      </template>
    </a-page-header>

    <!-- Dashboard Statistics -->
    <div class="dashboard-stats">
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

    <!-- Non-validated tasks alert -->
    <a-alert
      v-if="isProjectManager && nonValidatedTasks.length > 0"
      type="warning"
      show-icon
      style="margin: 16px 0"
    >
      <template #message>
        {{ nonValidatedTasks.length }} tâche(s) en attente de validation
      </template>
      <template #description>
        <a-button type="link" size="small" @click="handleValidateAll">
          Valider toutes les tâches
        </a-button>
      </template>
    </a-alert>

    <!-- Tasks Tabs -->
    <a-tabs v-model:activeKey="activeTab" class="tasks-tabs">
      
      <!-- Kanban -->
      <a-tab-pane key="kanban" tab="Kanban">
        <KanbanBoard
          :tasks="projectTasks"
          @update-status="handleStatusChange"
          @open-task="handleOpenTask"
        />
      </a-tab-pane>

      <a-tab-pane key="all" tab="Toutes les tâches">
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
      </a-tab-pane>

      <a-tab-pane key="non-validated" :tab="`Non validées (${nonValidatedTasks.length})`">
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
      </a-tab-pane>

      <a-tab-pane key="overdue" :tab="`En retard (${overdueCount})`">
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
      </a-tab-pane>

      
    </a-tabs>

    <!-- Task Form Modal -->
    <TaskForm
      v-model:open="taskFormVisible"
      :mode="taskFormMode"
      :task="selectedTask"
      :users="allUsers"
      :can-assign-users="isProjectManager"
      @submit="handleTaskSubmit"
    />

    <!-- Comments Modal -->
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

    <!-- Delete Confirmation -->
    <a-modal
      v-model:open="deleteModalVisible"
      title="Confirmer la suppression"
      @ok="confirmDelete"
    >
      <p>Êtes-vous sûr de vouloir supprimer la tâche "{{ taskToDelete?.title }}" ?</p>
      <p>Cette action est irréversible.</p>
    </a-modal>

    <!-- Assign Modal -->
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
  WarningOutlined
} from '@ant-design/icons-vue'
import { useAuthStore } from '@/stores/auth'
import { useTasksStore } from '@/stores/tasks'
import { useProjectsStore } from '@/stores/projects'
import ActionButton from '@/components/common/ActionButton.vue'
import TaskList from "@/components/tasks/TaskList.vue";
import TaskComments from "@/components/tasks/TaskComments.vue";
import TaskForm from "@/components/tasks/TaskForm.vue";
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

const activeTab = ref('kanban')
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
const taskToAssign = ref(null)

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
    if (!task.deadline || task.status === 'completed') return false
    return new Date(task.deadline) < new Date()
  })
})

const projectProgress = computed(() => {
  return projectsStore.getProjectProgress(props.project.id)
})

const inProgressCount = computed(() => {
  return projectTasks.value.filter(t =>
    t.status !== 'completed' && t.status !== 'non_validé'
  ).length
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
          status: 'validé'
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
      task.status === 'completed'
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
  taskToAssign.value = task
  assignModalVisible.value = true
}

function handleAssignSubmit(selectedUserIds) {
  try {
    const currentAssignedIds = taskToAssign.value.assignedTo || []

    // Find users to add
    const toAdd = selectedUserIds.filter(id => !currentAssignedIds.includes(id))

    // Find users to remove
    const toRemove = currentAssignedIds.filter(id => !selectedUserIds.includes(id))

    // Add users
    toAdd.forEach(userId => {
      tasksStore.assignUser(taskToAssign.value.id, userId)
    })

    // Remove users
    toRemove.forEach(userId => {
      tasksStore.unassignUser(taskToAssign.value.id, userId)
    })

    message.success('Affectations mises à jour')
    assignModalVisible.value = false
    taskToAssign.value = null
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


</script>

<style scoped>
.manager-project-view {
  width: 100%;
}

:deep(.ant-page-header) {
  padding: 16px 24px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
  margin-bottom: 16px;
}

.dashboard-stats {
  padding: 24px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
  margin-bottom: 16px;
}

.tasks-tabs {
  background: white;
  padding: 16px 24px;
  border-radius: 8px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
}

:deep(.ant-statistic-title) {
  font-size: 14px;
  color: rgba(0, 0, 0, 0.45);
}

:deep(.ant-statistic-content) {
  font-size: 24px;
  font-weight: 600;
}
</style>
