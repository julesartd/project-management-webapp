<template>
  <a-row :gutter="[16, 16]">
    <a-col
        v-for="project in projects"
        :key="project.id"
        :xs="24"
        :sm="12"
        :lg="8"
        :xl="6"
    >
      <ProjectCard
          :project="project"
          @edit="$emit('edit', project)"
          @delete="$emit('delete', project)"
          @view="$emit('view', project)"
      />
    </a-col>
  </a-row>

  <a-empty
      v-if="projects.length === 0"
      description="Aucun projet disponible"
  />
</template>

<script setup>
import ProjectCard from './ProjectCard.vue'

defineProps({
  projects: {
    type: Array,
    required: true
  }
})

defineEmits(['edit', 'delete', 'view'])
</script>
