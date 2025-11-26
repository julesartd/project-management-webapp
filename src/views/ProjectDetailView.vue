<!-- File: src/views/ProjectDetailView.vue (updated to use AppLayout) -->
<template>
  <AppLayout>
    <div style="padding:24px">
      <a-page-header @back="goBack" title="Project details" />
      <a-card v-if="project">
        <h2>{{ project.name }}</h2>
        <a-typography-paragraph :content="project.description" />
        <div style="margin-top:16px">
          <strong>Deadline:</strong> {{ formattedDeadline }}
        </div>
        <div style="margin-top:8px">
          <a-tag color="blue">{{ project.tasks?.length || 0 }} tâche(s)</a-tag>
        </div>
      </a-card>

      <a-empty v-else description="Project not found" />
    </div>
  </AppLayout>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useProjectsStore } from '@/stores/projects'
import AppLayout from '@/components/AppLayout.vue'

const props = defineProps({
  id: { type: [String, Number], required: true }
})

const router = useRouter()
const projectsStore = useProjectsStore()

const project = computed(() =>
    (projectsStore.userProjects || []).find(p => String(p.id) === String(props.id)) || null
)

const formattedDeadline = computed(() =>
    project.value?.deadline ? new Date(project.value.deadline).toLocaleDateString('fr-FR') : '—'
)

function goBack() {
  router.back()
}
</script>
