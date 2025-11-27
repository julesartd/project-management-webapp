<script setup>
import AppLayout from '@/components/AppLayout.vue'
import ProjectDashboard from '@/components/projects/ProjectDashboard.vue'
import { generateMockData } from '@/utils/mockData'
</script>

<template>
  <AppLayout>
    <div class="mb-4 flex justify-end">
      <a-button @click="generateMockData" type="dashed" size="small">Générer Données de Test</a-button>
    </div>
    <ProjectDashboard />
  </AppLayout>
</template>
