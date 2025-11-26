<template>
  <div class="task-comments">
    <!-- Comments List -->
    <div v-if="task.comments && task.comments.length > 0" class="comments-list">
      <div
        v-for="comment in sortedComments"
        :key="comment.id"
        class="comment-item"
      >
        <div class="comment-header">
          <a-avatar :src="getAuthorAvatar(comment.authorId)" :alt="getAuthorName(comment.authorId)" size="small">
            {{ getAuthorInitials(comment.authorId) }}
          </a-avatar>
          <div class="comment-meta">
            <span class="comment-author">{{ getAuthorName(comment.authorId) }}</span>
            <span class="comment-date">{{ formatDate(comment.createdAt) }}</span>
          </div>
        </div>
        <div class="comment-content">
          {{ comment.text }}
        </div>
      </div>
    </div>

    <a-empty
      v-else
      description="Aucun commentaire"
      :image="Empty.PRESENTED_IMAGE_SIMPLE"
      style="margin: 24px 0"
    />

    <a-divider />

    <!-- Add Comment Form -->
    <div class="add-comment-form">
      <div class="comment-form-header">
        <a-avatar :src="currentUser?.avatar" :alt="currentUser?.name" size="small">
          {{ currentUserInitials }}
        </a-avatar>
        <span class="form-author">{{ currentUser?.name }}</span>
      </div>

      <a-form @submit.prevent="handleSubmit">
        <a-form-item>
          <a-textarea
            v-model:value="newComment"
            placeholder="Ajouter un commentaire..."
            :rows="3"
            :maxlength="500"
            show-count
          />
        </a-form-item>

        <a-form-item>
          <a-button
            type="primary"
            html-type="submit"
            :loading="loading"
            :disabled="!newComment.trim()"
          >
            <SendOutlined /> Envoyer
          </a-button>
        </a-form-item>
      </a-form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Empty } from 'ant-design-vue'
import { SendOutlined } from '@ant-design/icons-vue'
import { useAuthStore } from '@/stores/auth'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/fr'

dayjs.extend(relativeTime)
dayjs.locale('fr')

const props = defineProps({
  task: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['add-comment'])

const authStore = useAuthStore()
const newComment = ref('')
const loading = ref(false)

const currentUser = computed(() => authStore.currentUser)

const currentUserInitials = computed(() => {
  if (!currentUser.value?.name) return '?'
  return currentUser.value.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
})

const sortedComments = computed(() => {
  if (!props.task.comments) return []
  return [...props.task.comments].sort((a, b) =>
    new Date(a.createdAt) - new Date(b.createdAt)
  )
})

function getAuthorName(authorId) {
  const user = authStore.users?.find(u => u.id === authorId)
  return user?.name || 'Utilisateur inconnu'
}

function getAuthorAvatar(authorId) {
  const user = authStore.users?.find(u => u.id === authorId)
  return user?.avatar || null
}

function getAuthorInitials(authorId) {
  const name = getAuthorName(authorId)
  if (!name || name === 'Utilisateur inconnu') return '?'
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

function formatDate(date) {
  return dayjs(date).fromNow()
}

async function handleSubmit() {
  if (!newComment.value.trim()) return

  loading.value = true

  try {
    await emit('add-comment', {
      text: newComment.value.trim()
    })
    newComment.value = ''
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.task-comments {
  max-height: 500px;
  overflow-y: auto;
}

.comments-list {
  margin-bottom: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.comment-item {
  padding: 12px;
  background-color: #fafafa;
  border-radius: 8px;
  border: 1px solid #f0f0f0;
}

.comment-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.comment-meta {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.comment-author {
  font-weight: 600;
  font-size: 14px;
  color: rgba(0, 0, 0, 0.85);
}

.comment-date {
  font-size: 12px;
  color: rgba(0, 0, 0, 0.45);
}

.comment-content {
  margin-left: 36px;
  white-space: pre-wrap;
  word-break: break-word;
  font-size: 14px;
  color: rgba(0, 0, 0, 0.65);
  line-height: 1.5;
}

.add-comment-form {
  margin-top: 16px;
}

.comment-form-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.form-author {
  font-weight: 600;
  font-size: 14px;
  color: rgba(0, 0, 0, 0.85);
}

.add-comment-form :deep(.ant-form-item) {
  margin-bottom: 12px;
}

.add-comment-form :deep(.ant-form-item:last-child) {
  margin-bottom: 0;
}
</style>
