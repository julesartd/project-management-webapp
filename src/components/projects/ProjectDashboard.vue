<template>
  <div class="project-dashboard">
    <a-card class="dashboard-card" :bordered="false">
      <div class="dashboard-header">
        <div class="header-content">
          <div class="header-text">
            <h1 class="header-title">Gestion des Projets</h1>
            <p class="header-subtitle">{{ projectsSubtitle }}</p>
          </div>
          <ActionButton
              v-if="hasRole('manager')"
              variant="purple"
              :icon="PlusOutlined"
              @click="showCreateModal"
          >
            Nouveau Projet
          </ActionButton>
        </div>
      </div>

      <a-divider style="margin: 24px 0"/>

      <ProjectFilters
          v-model="filters"
          @filter="handleFilter"
      />

      <a-divider style="margin: 24px 0"/>

      <div class="dashboard-content">
        <ProjectList
            :projects="filteredProjects"
            @edit="handleEdit"
            @delete="handleDelete"
            @view="handleView"
        />
      </div>
    </a-card>

    <ProjectModalForm
        v-model:open="modalVisible"
        :project="selectedProject"
        :mode="modalMode"
        :users="allUsers"
        @submit="handleSubmit"
    />

    <ProjectDeleteModal
        v-model:open="deleteModalVisible"
        :project="projectToDelete"
        @confirm="confirmDelete"
    />
  </div>
</template>

<script setup>
import {ref, computed} from 'vue'
import {useRouter} from 'vue-router'
import {message} from 'ant-design-vue'
import {PlusOutlined} from '@ant-design/icons-vue'
import {useProjectsStore} from '@/stores/projects'
import {useAuthStore} from '@/stores/auth'
import {useProjectFilters} from '@/composables/useProjectFilters'
import ProjectList from './ProjectList.vue'
import ProjectModalForm from './ProjectModalForm.vue'
import ProjectDeleteModal from './ProjectDeleteModal.vue'
import ProjectFilters from './ProjectFilters.vue'
import ActionButton from '@/components/common/ActionButton.vue'

const router = useRouter()
const projectsStore = useProjectsStore()
const authStore = useAuthStore()

const {createProject, updateProject, deleteProject} = projectsStore
const {hasRole} = authStore

const userProjectsComputed = computed(() => projectsStore.userProjects || [])
const allUsers = computed(() => {
  return (authStore.users || []).filter(user => user.roles?.includes('manager'))
})

const {filters, filteredProjects, updateFilters} = useProjectFilters(userProjectsComputed)

const modalVisible = ref(false)
const modalMode = ref('create')
const selectedProject = ref(null)
const deleteModalVisible = ref(false)
const projectToDelete = ref(null)

const projectsSubtitle = computed(() => {
  const total = userProjectsComputed.value.length
  const filtered = filteredProjects.value.length
  return filtered === total
      ? `${total} projet(s)`
      : `${filtered} sur ${total} projet(s)`
})

function handleFilter(newFilters) {
  updateFilters(newFilters)
}

function showCreateModal() {
  modalMode.value = 'create'
  selectedProject.value = null
  modalVisible.value = true
}

function handleEdit(project) {
  modalMode.value = 'edit'
  selectedProject.value = {...project}
  modalVisible.value = true
}

function handleDelete(project) {
  projectToDelete.value = project
  deleteModalVisible.value = true
}

function handleView(project) {
  const id = project?.id

  if (!id) {
    message.error('Impossible d\'ouvrir les détails : ID manquant')
    console.warn('Missing project id for', project)
    return
  }

  router.push({name: 'ProjectDetails', params: {id}})
}

async function handleSubmit(formData) {
  try {
    if (modalMode.value === 'create') {
      createProject(formData)
      message.success('Projet créé avec succès')
    } else {
      await updateProject(selectedProject.value.id, formData)
      message.success('Projet modifié avec succès')
    }
    modalVisible.value = false
  } catch (error) {
    message.error(error.message || 'Erreur lors de l\'opération')
  }
}

async function confirmDelete() {
  try {
    await deleteProject(projectToDelete.value.id)
    message.success('Projet supprimé avec succès')
    deleteModalVisible.value = false
  } catch (error) {
    message.error(error.message || 'Erreur lors de la suppression')
  }
}
</script>

<style scoped>
.project-dashboard {
  min-height: 100vh;
}

.dashboard-card {
  width: 100%;
  min-height: 80vh;
  margin: 0 auto;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  box-shadow: 0 8px 32px rgba(102, 126, 234, 0.12);
  overflow: hidden;
  border: 1px solid rgba(102, 126, 234, 0.1);
}

.dashboard-card :deep(.ant-card-body) {
  padding: 40px;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.02) 0%, rgba(118, 75, 162, 0.02) 100%);
}

.dashboard-header {
  margin-bottom: 0;
  position: relative;
}

.dashboard-header::after {
  content: '';
  position: absolute;
  bottom: -20px;
  left: 0;
  width: 60px;
  height: 4px;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  border-radius: 2px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 24px;
}

.header-text {
  flex: 1;
}

.header-title {
  font-size: 20px;
  font-weight: 800;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0 0 8px 0;
  line-height: 1.2;
  letter-spacing: -0.5px;
}

.header-subtitle {
  font-size: 16px;
  color: #718096;
  margin: 0;
  font-weight: 500;
}

.dashboard-content {
  margin: 0;
}

.dashboard-content :deep(.ant-list) {
  background: transparent;
}

.dashboard-content :deep(.ant-list-grid .ant-col) {
  margin-bottom: 24px;
}

:deep(.ant-divider) {
  border-color: rgba(102, 126, 234, 0.1);
}

@media (max-width: 768px) {
  .project-dashboard {
    padding: 12px;
  }

  .dashboard-card {
    border-radius: 16px;
  }

  .dashboard-card :deep(.ant-card-body) {
    padding: 24px;
  }

  .header-content {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
  }

  .header-title {
    font-size: 26px;
  }

  .header-subtitle {
    font-size: 14px;
  }

  :deep(.ant-divider) {
    margin: 16px 0 !important;
  }
}

@media (max-width: 480px) {
  .dashboard-card {
    border-radius: 12px;
  }

  .dashboard-card :deep(.ant-card-body) {
    padding: 20px;
  }

  .header-title {
    font-size: 22px;
  }

  .header-subtitle {
    font-size: 13px;
  }
}
</style>
