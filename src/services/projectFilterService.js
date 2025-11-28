import dayjs from 'dayjs'

export class ProjectFilterService {
 
    static filterProjects(projects, filters) {
        if (!Array.isArray(projects)) {
            console.warn('filterProjects: projects is not an array', projects)
            return []
        }

        let filtered = [...projects]

        filtered = this.filterBySearch(filtered, filters.search)
        filtered = this.filterByStatus(filtered, filters.status)
        filtered = this.filterByDeadlineRange(
            filtered,
            filters.deadlineFrom,
            filters.deadlineTo
        )

        return filtered
    }


    static filterBySearch(projects, searchTerm) {
        if (!searchTerm || searchTerm.trim() === '') {
            return projects
        }

        const term = searchTerm.toLowerCase().trim()
        return projects.filter(project =>
            project.name?.toLowerCase().includes(term) ||
            project.description?.toLowerCase().includes(term)
        )
    }

    static filterByStatus(projects, status) {
        if (!status) {
            return projects
        }

        return projects.filter(project => project.status === status)
    }

    static filterByDeadlineRange(projects, from, to) {
        if (!from && !to) {
            return projects
        }

        return projects.filter(project => {
            if (!project.deadline) return false

            const deadline = dayjs(project.deadline)
            const matchesFrom = !from || deadline.isAfter(dayjs(from)) || deadline.isSame(dayjs(from), 'day')
            const matchesBefore = !to || deadline.isBefore(dayjs(to)) || deadline.isSame(dayjs(to), 'day')

            return matchesFrom && matchesBefore
        })
    }
}
