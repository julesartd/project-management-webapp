<template>
  <div class="developer-project-view">
    <a-page-header
      @back="$emit('back')"
      :title="project.name"
      :sub-title="project.description"
    >
      <template #extra>
        <ActionButton
          variant="primary"
          :icon="PlusOutlined"
          @click="showTaskForm"
        >
          Créer une tâche
        </ActionButton>
      </template>

      <template #footer>
        <a-tabs>
          <a-tab-pane key="assigned" tab="Mes tâches">
            <TaskList
              :tasks="assignedTasks"
              :can-edit="false"
              :can-delete="false"
              :can-validate="false"
              :users="allUsers"
              :show-filters="true"
              empty-text="Aucune tâche ne vous est affectée"
              @comment="handleComment"
              @toggle-complete="handleToggleComplete"
            />
          </a-tab-pane>

          <a-tab-pane key="all" tab="Toutes les tâches">
            <TaskList
              :tasks="otherTasks"
              :can-edit="false"
              :can-delete="false"
              :can-validate="false"
              :users="allUsers"
              :show-filters="true"
              empty-text="Aucune autre tâche dans ce projet"
              @comment="handleComment"
              @toggle-complete="handleToggleComplete"
            />
          </a-tab-pane>
        </a-tabs>
      </template>
    </a-page-header>

    <!-- Task Form Modal -->
    <TaskForm
      v-model:open="taskFormVisible"
      :mode="taskFormMode"
      :task="selectedTask"
      :users="allUsers"
      :can-assign-users="false"
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
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { message } from 'ant-design-vue'
import { PlusOutlined } from '@ant-design/icons-vue'
import { useAuthStore } from '@/stores/auth'
import { useTasksStore } from '@/stores/tasks'
import ActionButton from '@/components/common/ActionButton.vue'
import TaskList from "@/components/tasks/TaskList.vue";
import TaskForm from "@/components/tasks/TaskForm.vue";
import TaskComments from "@/components/tasks/TaskComments.vue";

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

const taskFormVisible = ref(false)
const taskFormMode = ref('create')
const selectedTaskId = ref(null)
const selectedTask = computed(() => {
  if (!selectedTaskId.value) return null
  return tasksStore.getTask(selectedTaskId.value)
})
const commentsVisible = ref(false)


const projectTasks = computed(() => {
  return tasksStore.getTasksByProject(props.project.id)
})

const assignedTasks = computed(() => {
  return projectTasks.value.filter(task =>
    task.assignedTo?.includes(authStore.currentUser?.id)
  )
})

const otherTasks = computed(() => {
  return projectTasks.value.filter(task =>
    !task.assignedTo?.includes(authStore.currentUser?.id)
  )
})

function showTaskForm() {
  taskFormMode.value = 'create'
  selectedTaskId.value = null
  taskFormVisible.value = true
}

function handleTaskSubmit(formData) {
  try {
    if (taskFormMode.value === 'create') {
      tasksStore.createTask(
        props.project.id,
        {
          ...formData,
          status: 'non_validé',
          assignedTo: [authStore.currentUser.id]
        },
        authStore.currentUser.id
      )
      message.success('Tâche créée avec succès (en attente de validation)')
    }
    taskFormVisible.value = false
  } catch (error) {
    message.error(error.message || 'Erreur lors de la création de la tâche')
  }
}

function handleToggleComplete(task) {
  try {
    if (!task.assignedTo?.includes(authStore.currentUser?.id)) {
      message.warning('Vous ne pouvez marquer comme terminée que les tâches qui vous sont affectées')
      return
    }

    if (task.status === 'non_validé') {
      message.warning('Cette tâche doit d\'abord être validée par un manager')
      return
    }

    tasksStore.toggleComplete(task.id)

    if (task.status === 'completed') {
      message.success('Tâche marquée comme terminée')
    } else {
      message.success('Tâche marquée comme non terminée')
    }
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
    message.error(error.message || 'Erreur lors de l\'ajout du commentaire')
  }
}
</script>

<style scoped>
.developer-project-view {
  width: 100%;
}

:deep(.ant-page-header) {
  padding: 16px 24px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
}

:deep(.ant-tabs) {
  margin-top: 16px;
}
</style>
