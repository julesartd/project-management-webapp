// src/components/AppLayout.vue
<script setup>
import { useAuthStore } from '@/stores/auth.js'
import { LogoutOutlined, UserOutlined } from '@ant-design/icons-vue'

const authStore = useAuthStore()
const user = authStore.currentUser

const roleColors = {
  manager: 'purple',
  developer: 'blue'
}
</script>

<template>
  <a-layout class="!min-h-screen">
    <a-layout-header class="!bg-white !px-6 border-b border-gray-200 shadow-sm z-10 flex justify-between items-center h-16 leading-normal">
      <div class="flex items-center">
        <h2 class="m-0 flex items-center">
          <router-link to="/" class="text-xl font-bold text-gray-800 tracking-tight inline-flex items-center h-16">
            Gestion Projet
          </router-link>
        </h2>
      </div>

      <div class="flex items-center gap-4">
        <div class="hidden md:flex gap-2">
          <a-tag v-for="role in user?.roles" :key="role" :color="roleColors[role] || 'default'" class="uppercase font-bold">
            {{ role }}
          </a-tag>
        </div>

        <a-divider type="vertical" class="hidden md:block h-6 bg-gray-300" />

        <div class="flex items-center gap-3 cursor-default">
          <a-avatar :src="user?.avatar" class="bg-blue-50 flex items-center justify-center border border-blue-100">
            <template #icon v-if="!user?.avatar"><UserOutlined class="text-blue-600" /></template>
          </a-avatar>
          <span class="font-medium text-gray-700 hidden sm:block">{{ user?.name }}</span>
        </div>

        <a-button type="text" danger @click="authStore.logout()" class="!flex !items-center hover:bg-red-50">
          <template #icon><LogoutOutlined /></template>
          <span class="hidden sm:inline">Déconnexion</span>
        </a-button>
      </div>
    </a-layout-header>

    <a-layout-content class="p-6 md:p-10 bg-gray-50">
      <slot />
    </a-layout-content>

    <a-layout-footer class="text-center text-gray-500 py-6 bg-gray-50 text-sm">
      Réalisé par Jules, Kilian, Zakaria et Bastien - VueJs & Ant Design
    </a-layout-footer>
  </a-layout>
</template>
