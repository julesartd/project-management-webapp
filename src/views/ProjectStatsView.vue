<template>
  <AppLayout>
    <div class="space-y-6">
      <div class="flex items-center gap-4 mb-6">
        <a-button class="flex! items-center!" @click="router.back()">
          <template #icon><ArrowLeftOutlined /></template>
          Retour
        </a-button>
        <h1 class="text-2xl font-bold text-gray-800 m-0">Statistiques: {{ project?.name }}</h1>
      </div>

      <div v-if="project" class="flex flex-col gap-6">

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">

          <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <h3 class="text-lg font-semibold text-gray-700 mb-4">État des Tâches</h3>
            <div class="min-h-[350px] flex items-center justify-center">
              <apexchart
                  v-if="taskStatusSeries.length > 0 && hasTasks"
                  class="w-full"
                  type="donut"
                  width="100%"
                  height="350"
                  :options="taskStatusOptions"
                  :series="taskStatusSeries"
              ></apexchart>
              <a-empty v-else description="Aucune tâche dans ce projet" />
            </div>
          </div>

          <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <h3 class="text-lg font-semibold text-gray-700 mb-4">Tâches par Membre</h3>
            <div class="min-h-[350px] flex items-center justify-center">
              <apexchart
                  v-if="assignmentSeries[0].data.length > 0"
                  class="w-full"
                  type="bar"
                  width="100%"
                  height="350"
                  :options="assignmentOptions"
                  :series="assignmentSeries"
              ></apexchart>
              <a-empty v-else description="Aucune assignation" />
            </div>
          </div>
        </div>

        <div class="w-full bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <h3 class="text-lg font-semibold text-gray-700 mb-4">Progression du Projet (Burnup Chart)</h3>
          <div class="min-h-[350px] flex items-center justify-center">
            <apexchart
                v-if="burnupSeries.length > 0"
                class="w-full"
                type="line"
                width="100%"
                height="350"
                :options="burnupOptions"
                :series="burnupSeries"
            ></apexchart>
            <a-empty v-else description="Pas assez de données pour la progression" />
          </div>
        </div>

      </div>

      <div v-else class="text-center py-10">
        <a-spin size="large" />
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useProjectsStore } from '@/stores/projects'
import { useTasksStore, TASK_STATUS } from '@/stores/tasks'
import { useAuthStore } from '@/stores/auth'
import AppLayout from '@/components/AppLayout.vue'
import VueApexCharts from 'vue3-apexcharts'
import { ArrowLeftOutlined } from '@ant-design/icons-vue'

const apexchart = VueApexCharts

const route = useRoute()
const router = useRouter()
const projectsStore = useProjectsStore()
const tasksStore = useTasksStore()
const authStore = useAuthStore()

const projectId = route.params.id

const project = computed(() => {
  return projectsStore.projects.find(p => String(p.id) === String(projectId))
})

const projectTasks = computed(() => {
  return tasksStore.getTasksByProject(projectId)
})

const hasTasks = computed(() => projectTasks.value.length > 0)

const taskStatusSeries = computed(() => {
  const tasks = projectTasks.value
  const counts = {
    [TASK_STATUS.NOT_VALIDATED]: 0,
    [TASK_STATUS.VALIDATED]: 0,
    [TASK_STATUS.COMPLETED]: 0
  }

  tasks.forEach(t => {
    if (Object.prototype.hasOwnProperty.call(counts, t.status)) {
      counts[t.status]++
    }
  })

  return [
    counts[TASK_STATUS.NOT_VALIDATED],
    counts[TASK_STATUS.VALIDATED],
    counts[TASK_STATUS.COMPLETED]
  ]
})

const taskStatusOptions = computed(() => ({
  chart: {
    type: 'donut',
    fontFamily: 'inherit'
  },
  labels: ['Non Validé', 'Validé', 'Terminé'],
  colors: ['#faad14', '#1890ff', '#52c41a'],
  plotOptions: {
    pie: {
      donut: {
        size: '65%',
        labels: {
          show: true,
          total: {
            show: true,
            label: 'Total',
            formatter: () => projectTasks.value.length
          }
        }
      }
    }
  },
  legend: {
    position: 'bottom'
  }
}))

const assignmentSeries = computed(() => {
  const tasks = projectTasks.value
  const userCounts = {}

  tasks.forEach(t => {
    t.assignedTo.forEach(userId => {
      userCounts[userId] = (userCounts[userId] || 0) + 1
    })
  })

  const data = []
  const categories = []

  Object.entries(userCounts).forEach(([userId, count]) => {
    const user = authStore.users.find(u => u.id === userId)
    const name = user ? user.name : 'Inconnu'
    categories.push(name)
    data.push(count)
  })

  return [{
    name: 'Tâches assignées',
    data: data
  }]
})

const assignmentOptions = computed(() => {
  const tasks = projectTasks.value
  const userCounts = {}
  tasks.forEach(t => {
    t.assignedTo.forEach(userId => {
      userCounts[userId] = (userCounts[userId] || 0) + 1
    })
  })
  
  const categories = Object.keys(userCounts).map(userId => {
    const user = authStore.users.find(u => u.id === userId)
    return user ? user.name : 'Inconnu'
  })

  return {
    chart: {
      type: 'bar',
      fontFamily: 'inherit',
      toolbar: { show: false }
    },
    plotOptions: {
      bar: {
        borderRadius: 4,
        horizontal: true,
        distributed: true
      }
    },
    xaxis: {
      categories: categories,
      labels: {
        formatter: function (val) {
          return val % 1 === 0 ? val.toFixed(0) : ''
        }
      },
      axisBorder: {
        show: true
      },
      axisTicks: {
        show: true
      }
    },
    colors: ['#722ed1', '#13c2c2', '#eb2f96', '#2f54eb'],
    legend: { show: false }
  }
})

const burnupSeries = computed(() => {
  if (!project.value || projectTasks.value.length === 0) return []

  const start = project.value.createdAt ? new Date(project.value.createdAt).getTime() : new Date().getTime()
  const now = new Date().getTime()

  const events = []

  projectTasks.value.forEach(t => {
    events.push({
      time: new Date(t.createdAt).getTime(),
      type: 'created'
    })

    if (t.validatedAt) {
      events.push({
        time: new Date(t.validatedAt).getTime(),
        type: 'validated'
      })
    }

    if (t.status === TASK_STATUS.COMPLETED) {
      const completedTime = t.updatedAt ? new Date(t.updatedAt).getTime() : now
      events.push({
        time: completedTime,
        type: 'completed'
      })
    }
  })

  events.sort((a, b) => a.time - b.time)

  const createdData = []
  const validatedData = []
  const completedData = []

  let createdCount = 0
  let validatedCount = 0
  let completedCount = 0

  if (events.length > 0 && events[0].time > start) {
    createdData.push({ x: start, y: 0 })
    validatedData.push({ x: start, y: 0 })
    completedData.push({ x: start, y: 0 })
  }

  events.forEach(e => {
    if (e.type === 'created') createdCount++
    if (e.type === 'validated') validatedCount++
    if (e.type === 'completed') completedCount++

    createdData.push({ x: e.time, y: createdCount })
    validatedData.push({ x: e.time, y: validatedCount })
    completedData.push({ x: e.time, y: completedCount })
  })

  if (events.length > 0 && events[events.length - 1].time < now) {
    createdData.push({ x: now, y: createdCount })
    validatedData.push({ x: now, y: validatedCount })
    completedData.push({ x: now, y: completedCount })
  }

  return [
    { name: 'Créées', data: createdData },
    { name: 'Validées', data: validatedData },
    { name: 'Terminées', data: completedData }
  ]
})

const burnupOptions = computed(() => {
  const deadline = project.value?.deadline ? new Date(project.value.deadline).getTime() : null
  
  const annotations = {}
  if (deadline) {
    annotations.xaxis = [{
      x: deadline,
      borderColor: '#ff4d4f',
      label: {
        style: { color: '#fff', background: '#ff4d4f' },
        text: 'Deadline'
      }
    }]
  }

  return {
    chart: {
      type: 'line',
      fontFamily: 'inherit',
      toolbar: { show: false },
      animations: { enabled: false }
    },
    stroke: {
      curve: 'smooth',
      width: 3
    },
    xaxis: {
      type: 'datetime',
      tickAmount: 15,
      labels: {
        datetimeFormatter: {
          year: 'yyyy',
          month: 'MMM yyyy',
          day: 'dd MMM',
          hour: 'HH:mm'
        }
      },
      tooltip: { 
        enabled: true,
        x: {
          format: 'dd MMM yyyy'
        }
      }
    },
    yaxis: {
      title: { text: 'Nombre de tâches' },
      min: 0,
      forceNiceScale: true,
      labels: {
        formatter: (val) => val.toFixed(0)
      }
    },
    colors: ['#faad14', '#1890ff', '#52c41a'], // Orange (Created), Blue (Validated), Green (Completed)
    legend: { position: 'top' },
    annotations: annotations,
    grid: {
      borderColor: '#f1f1f1'
    }
  }
})
</script>
