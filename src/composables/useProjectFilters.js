import { ref, computed } from 'vue'
import { ProjectFilterService } from '@/services/projectFilterService'

export function useProjectFilters(projects) {
    const filters = ref({
        search: '',
        status: null,
        deadlineFrom: null,
        deadlineTo: null
    })

    const filteredProjects = computed(() => {
        const projectsArray = Array.isArray(projects.value) ? projects.value : []
        return ProjectFilterService.filterProjects(projectsArray, filters.value)
    })

    const hasActiveFilters = computed(() => {
        return !!(
            filters.value.search ||
            filters.value.status ||
            filters.value.deadlineFrom ||
            filters.value.deadlineTo
        )
    })

    function updateFilters(newFilters) {
        filters.value = { ...newFilters }
    }

    function resetFilters() {
        filters.value = {
            search: '',
            status: null,
            deadlineFrom: null,
            deadlineTo: null
        }
    }

    return {
        filters,
        filteredProjects,
        hasActiveFilters,
        updateFilters,
        resetFilters
    }
}
