<script setup>
import { useAuthStore } from '@/stores/auth.js'
import { LogoutOutlined, PlusOutlined, UserOutlined } from '@ant-design/icons-vue'

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
        <h2 class="text-xl font-bold text-gray-800 m-0 tracking-tight">Gestion Projet</h2>
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

      <div class="flex justify-between items-center mb-8">
        <h1 class="text-2xl md:text-3xl font-bold text-gray-900 m-0">Tableau de bord</h1>

        <a-button
            v-if="user?.roles.includes('manager')"
            type="primary"
            size="large"
            class="flex items-center shadow-md bg-blue-600 hover:bg-blue-500"
        >
          <template #icon><PlusOutlined /></template>
          Nouveau Projet
        </a-button>
      </div>

      <div class="bg-white p-8 rounded-xl shadow-sm border border-gray-100 min-h-[400px]">
        <a-empty
            image="https://gw.alipayobjects.com/zos/antfincdn/ZHrcdLPrvN/empty.svg"
            :image-style="{ height: '120px' }"
            class="mt-10"
        >
          <template #description>
            <span class="text-gray-500 text-lg">Aucun projet pour le moment.</span>
          </template>

          <a-button v-if="user?.roles.includes('manager')" type="primary" class="mt-4">
            Créer mon premier projet
          </a-button>
        </a-empty>
      </div>

    </a-layout-content>

    <a-layout-footer class="text-center text-gray-500 py-6 bg-gray-50 text-sm">
      Gestion Projet ©2025 - Vue 3 & Ant Design
    </a-layout-footer>
  </a-layout>
</template>