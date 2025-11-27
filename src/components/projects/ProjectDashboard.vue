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
  border-radius: 16px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  transition: box-shadow 0.3s ease;
}

.dashboard-card:hover {
  box-shadow: 0 6px 32px rgba(0, 0, 0, 0.12);
}

.dashboard-card :deep(.ant-card-body) {
  padding: 32px;
}

.dashboard-header {
  margin-bottom: 0;
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
  font-size: 28px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 8px 0;
  line-height: 1.2;
}

.header-subtitle {
  font-size: 16px;
  color: #666;
  margin: 0;
}


.dashboard-content {
  margin: 0;
}

.dashboard-content :deep(.ant-list) {
  background: transparent;
}

@media (max-width: 768px) {
  .project-dashboard {
    padding: 12px;
  }

  .dashboard-card :deep(.ant-card-body) {
    padding: 20px;
  }

  .header-content {
    flex-direction: column;
    align-items: stretch;
  }

  .header-title {
    font-size: 22px;
  }

  .header-subtitle {
    font-size: 14px;
  }
}
</style>
