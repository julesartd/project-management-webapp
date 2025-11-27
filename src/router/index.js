import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import LoginView from '@/views/LoginView.vue'
import HomeView from '@/views/HomeView.vue'
import ProjectDetailView from "@/views/ProjectDetailView.vue";
import ProjectStatsView from '@/views/ProjectStatsView.vue'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/login',
            name: 'login',
            component: LoginView
        },
        {
            path: '/',
            name: 'home',
            component: HomeView,
            meta: { requiresAuth: true }
        },
        {
            path: '/projects/:id',
            name: 'ProjectDetails',
            component: ProjectDetailView,
            props: true
        },
        {
            path: '/projects/:id/stats',
            name: 'ProjectStats',
            component: ProjectStatsView,
            meta: { requiresAuth: true }
        }
    ]
})

router.beforeEach((to, from, next) => {
    const authStore = useAuthStore()
    if (to.meta.requiresAuth && !authStore.currentUser) {
        next('/login')
    } else {
        next()
    }
})

export default router