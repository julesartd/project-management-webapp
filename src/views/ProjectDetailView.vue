<template>
  <AppLayout>
    <div style="padding: 24px">
      <RoleSwitch
        v-if="hasBothRoles"
        v-model="currentRole"
        @role-changed="handleRoleChange"
      />

      <DeveloperProjectView
        v-if="showDeveloperView && project"
        :project="project"
        :all-users="allUsers"
        @back="goBack"
      />

      <ManagerProjectView
        v-else-if="showManagerView && project"
        :project="project"
        :all-users="allUsers"
        @back="goBack"
      />

      <a-empty v-else-if="!project" description="Projet introuvable" />

      <!-- Stats Button (Floating or integrated) -->
      <div v-if="project" class="stats-button-container">
        <a-tooltip title="Voir les statistiques">
          <a-button
            type="primary"
            shape="circle"
            size="large"
            class="stats-button h-14! w-14! shadow-lg! flex! items-center! justify-center!"
            @click="router.push({ name: 'ProjectStats', params: { id: project.id } })"
          >
            <template #icon>
              <BarChartOutlined style="font-size: 24px" />
            </template>
          </a-button>
        </a-tooltip>
      </div>
    </div>
  </AppLayout>
</template>

<style scoped>
.stats-button-container {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  z-index: 1000;
  transition: all 0.3s ease;
}

.stats-button {
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.4) !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.stats-button:hover {
  transform: translateY(-4px) scale(1.05);
  box-shadow: 0 12px 32px rgba(102, 126, 234, 0.5) !important;
}

.stats-button:active {
  transform: translateY(-2px) scale(1.02);
}

@media (max-width: 768px) {
  .stats-button-container {
    bottom: 1rem;
    right: 1rem;
  }

  .stats-button {
    width: 48px !important;
    height: 48px !important;
  }

  .stats-button :deep(.anticon) {
    font-size: 20px !important;
  }
}
</style>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useProjectsStore } from '@/stores/projects'
import { useAuthStore } from '@/stores/auth'
import AppLayout from '@/components/AppLayout.vue'
import RoleSwitch from '@/components/common/RoleSwitch.vue'
import DeveloperProjectView from '@/views/projects/DeveloperProjectView.vue'
import ManagerProjectView from '@/views/projects/ManagerProjectView.vue'
import { BarChartOutlined } from '@ant-design/icons-vue'

const props = defineProps({
  id: { type: [String, Number], required: true }
})

const router = useRouter()
const projectsStore = useProjectsStore()
const authStore = useAuthStore()

const project = computed(() =>
    (projectsStore.userProjects || []).find(p => String(p.id) === String(props.id)) || null
)
const allUsers = computed(() => authStore.users || [])

const hasBothRoles = computed(() => {
  const user = authStore.currentUser
  return user?.roles?.includes('developer') && user?.roles?.includes('manager')
})

const initialRole = computed(() => {
  const user = authStore.currentUser
  if (!user) return 'developer'

  if (hasBothRoles.value) {
    return 'developer'
  }

  if (user.roles?.includes('manager')) return 'manager'
  return 'developer'
})

const currentRole = ref(initialRole.value)

const showDeveloperView = computed(() => {
  return currentRole.value === 'developer' && authStore.hasRole('developer')
})

const showManagerView = computed(() => {
  return currentRole.value === 'manager' && authStore.hasRole('manager')
})

function handleRoleChange(newRole) {
  currentRole.value = newRole
}

function goBack() {
  router.push({ name: 'home' })
}
</script>
