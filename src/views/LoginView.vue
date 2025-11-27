<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth.js'
import { useRouter } from 'vue-router'
import {
  UserOutlined,
  LockOutlined,
  MailOutlined,
  ThunderboltOutlined,
  DownloadOutlined,
  CheckCircleOutlined
} from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import { generateData } from "@/utils/initData.js"

const authStore = useAuthStore()
const router = useRouter()

const isRegistering = ref(false)
const error = ref('')
const loading = ref(false)
const isDev = import.meta.env.DEV

const seedLoading = ref(false)
const showSeedModal = ref(false)
const seedCredentials = ref([])

const formState = reactive({
  name: '',
  email: '',
  password: '',
  roles: ['developer']
})

const roleOptions = [
  { label: 'Développeur', value: 'developer' },
  { label: 'Manager', value: 'manager' }
]

const toggleMode = () => {
  isRegistering.value = !isRegistering.value
  error.value = ''
  formState.name = ''
  formState.email = ''
  formState.password = ''
  formState.roles = ['developer']
}

const onFinish = async () => {
  error.value = ''
  loading.value = true

  if (isRegistering.value && formState.roles.length === 0) {
    error.value = "Sélectionnez au moins un rôle."
    loading.value = false
    return
  }

  try {
    await new Promise(r => setTimeout(r, 500))

    if (isRegistering.value) {
      authStore.register({ ...formState })
    } else {
      authStore.login(formState.email, formState.password)
    }
    await router.push('/')
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}


const runSeed = async () => {
  seedLoading.value = true
  try {
    await new Promise(r => setTimeout(r, 800))

    const fixedUsers = generateData()

    seedCredentials.value = fixedUsers
    seedLoading.value = false
    showSeedModal.value = true

    message.success('Données générées avec succès !')
  } catch (err) {
    console.error(err)
    seedLoading.value = false
    message.error('Erreur lors de la création des données')
  }
}

const downloadCredentials = () => {
  let content = "# 🔐 Identifiants de Test - Mock Data\n\n"
  content += `Généré le : ${new Date().toLocaleString()}\n\n`
  content += "---\n\n"

  seedCredentials.value.forEach(user => {
    content += `### 👤 ${user.name} (${user.roles.join(', ')})\n`
    content += `- **Email:** ${user.email}\n`
    content += `- **Password:** ${user.password}\n`
    content += "\n"
  })

  const blob = new Blob([content], { type: 'text/markdown' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'identifiants_test.md'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)

  message.success('Fichier téléchargé !')
}

const closeAndReload = () => {
  showSeedModal.value = false
  location.reload()
}

onMounted(() => {
  localStorage.removeItem('seedJustCompleted')
})
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100 px-4">
    <a-card
        :title="isRegistering ? 'Créer un compte' : 'Connexion'"
        class="w-full max-w-md shadow-lg rounded-lg"
        :headStyle="{ textAlign: 'center', fontSize: '1.2rem' }"
    >
      <a-alert
          v-if="error"
          :message="error"
          type="error"
          show-icon
          class="mb-6"
      />

      <a-form
          :model="formState"
          name="auth_login"
          @finish="onFinish"
          layout="vertical"
          class="space-y-2"
      >
        <a-form-item
            v-if="isRegistering"
            label="Nom complet"
            name="name"
            :rules="[{ required: true, message: 'Veuillez entrer votre nom !' }]"
        >
          <a-input v-model:value="formState.name" placeholder="Jean Dupont" size="large">
            <template #prefix><UserOutlined class="text-gray-400" /></template>
          </a-input>
        </a-form-item>

        <a-form-item v-if="isRegistering" label="Rôles" name="roles" class="mb-2">
          <a-checkbox-group v-model:value="formState.roles" :options="roleOptions" class="w-full" />
          <div class="text-xs text-gray-500 mt-1">Cumul possible.</div>
        </a-form-item>

        <a-form-item
            label="Email"
            name="email"
            :rules="[{ required: true, type: 'email', message: 'Email invalide !' }]"
        >
          <a-input v-model:value="formState.email" placeholder="email@exemple.com" size="large">
            <template #prefix><MailOutlined class="text-gray-400" /></template>
          </a-input>
        </a-form-item>

        <a-form-item
            label="Mot de passe"
            name="password"
            :rules="[{ required: true, message: 'Mot de passe requis !' }]"
        >
          <a-input-password v-model:value="formState.password" size="large">
            <template #prefix><LockOutlined class="text-gray-400" /></template>
          </a-input-password>
        </a-form-item>

        <a-form-item class="mt-4">
          <a-button type="primary" html-type="submit" block :loading="loading" size="large" class="bg-blue-600 hover:bg-blue-500">
            {{ isRegistering ? "S'inscrire" : "Se connecter" }}
          </a-button>
        </a-form-item>
      </a-form>

      <div class="text-center mt-2">
        <a @click.prevent="toggleMode" class="text-blue-600 hover:text-blue-800 transition-colors">
          {{ isRegistering ? "J'ai déjà un compte" : "Créer un nouveau compte" }}
        </a>
      </div>

      <a-divider v-if="isDev" />

      <a-button
          v-if="isDev"
          type="dashed"
          block
          @click="runSeed"
          :loading="seedLoading"
          size="large"
          class="border-green-400 text-green-600 hover:border-green-500 hover:text-green-700 hover:bg-green-50"
      >
        <template #icon><ThunderboltOutlined /></template>
        {{ seedLoading ? 'Génération en cours...' : '🌱 Réinitialiser Données de Test' }}
      </a-button>
    </a-card>

    <a-modal
        v-model:open="showSeedModal"
        title="Données générées avec succès !"
        :maskClosable="false"
        :closable="false"
        :footer="null"
        centered
    >
      <div class="text-center mb-6">
        <CheckCircleOutlined class="text-5xl text-green-500 mb-2" />
        <p class="text-gray-600">
          La base de données locale a été repeuplée.<br>
          Voici les comptes principaux disponibles :
        </p>
      </div>

      <div class="bg-gray-50 p-4 rounded-lg border border-gray-200 max-h-60 overflow-y-auto mb-6">
        <div v-for="(user, index) in seedCredentials" :key="index" class="mb-4 last:mb-0 border-b last:border-0 pb-3 last:pb-0 border-gray-200">
          <div class="flex items-center justify-between mb-1">
            <span class="font-bold text-gray-800">{{ user.name }}</span>
            <a-tag :color="user.roles.includes('manager') ? 'purple' : 'blue'">
              {{ user.roles.join(' & ') }}
            </a-tag>
          </div>
          <div class="text-sm text-gray-600 font-mono bg-white p-2 rounded border">
            <div>Email: <span class="text-blue-600 select-all">{{ user.email }}</span></div>
            <div>Pass: <span class="text-red-500 select-all">{{ user.password }}</span></div>
          </div>
        </div>
      </div>

      <div class="flex gap-3">
        <a-button @click="downloadCredentials" block class="flex items-center justify-center">
          <DownloadOutlined /> Télécharger .md
        </a-button>
        <a-button type="primary" @click="closeAndReload" block>
          Fermer & Recharger
        </a-button>
      </div>
    </a-modal>
  </div>
</template>