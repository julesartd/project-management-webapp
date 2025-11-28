<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth.js'
import { useRouter } from 'vue-router'
import {
  UserOutlined,
  LockOutlined,
  MailOutlined,
  ThunderboltOutlined
} from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import { generateData } from "@/utils/initData.js"
import SeedDataModal from '@/components/common/SeedDataModal.vue'

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
    // Simulate network delay
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

const handleSeedModalClose = () => {
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
        class="w-full max-w-md shadow-lg rounded-xl"
        :headStyle="{ textAlign: 'center', fontSize: '1.2rem', borderBottom: '1px solid #f0f0f0' }"
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
          class="space-y-4"
      >
        <a-form-item
            v-if="isRegistering"
            label="Nom complet"
            name="name"
            :rules="[{ required: true, message: 'Veuillez entrer votre nom !' }]"
        >
          <a-input v-model:value="formState.name" placeholder="Jean Dupont" size="large" class="rounded-lg">
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
          <a-input v-model:value="formState.email" placeholder="email@exemple.com" size="large" class="rounded-lg">
            <template #prefix><MailOutlined class="text-gray-400" /></template>
          </a-input>
        </a-form-item>

        <a-form-item
            label="Mot de passe"
            name="password"
            :rules="[{ required: true, message: 'Mot de passe requis !' }]"
        >
          <a-input-password v-model:value="formState.password" size="large" class="rounded-lg">
            <template #prefix><LockOutlined class="text-gray-400" /></template>
          </a-input-password>
        </a-form-item>

        <a-form-item class="mt-6">
          <a-button type="primary" html-type="submit" block :loading="loading" size="large" class="rounded-lg h-10 font-medium">
            {{ isRegistering ? "S'inscrire" : "Se connecter" }}
          </a-button>
        </a-form-item>
      </a-form>

      <div class="text-center mt-4">
        <a @click.prevent="toggleMode" class="text-blue-600 hover:text-blue-800 transition-colors font-medium">
          {{ isRegistering ? "J'ai déjà un compte" : "Créer un nouveau compte" }}
        </a>
      </div>

      <template v-if="isDev">
        <a-divider class="my-6" />

        <a-button
            type="dashed"
            block
            @click="runSeed"
            :loading="seedLoading"
            size="large"
            class="border-green-400 text-green-600 hover:border-green-500 hover:text-green-700 hover:bg-green-50 rounded-lg"
        >
          <template #icon><ThunderboltOutlined /></template>
          {{ seedLoading ? 'Génération en cours...' : '🌱 Réinitialiser Données de Test' }}
        </a-button>
      </template>
    </a-card>

    <SeedDataModal
      v-model:open="showSeedModal"
      :credentials="seedCredentials"
      @close="handleSeedModalClose"
    />
  </div>
</template>