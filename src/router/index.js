import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import LoginView from '@/components/views/LoginView.vue'
import HomeView from '@/components/views/HomeView.vue'

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
        }
    ]
})

// Gardien de navigation (Navigation Guard)
router.beforeEach((to, from, next) => {
    const authStore = useAuthStore()
    if (to.meta.requiresAuth && !authStore.currentUser) {
        next('/login')
    } else {
        next()
    }
})

export default router