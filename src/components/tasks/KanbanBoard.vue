<template>
  <div class="kanban-board">
    <div
      class="kanban-column"
      v-for="column in columns"
      :key="column.status"
      :data-status="column.status"
    >
      <h3>{{ column.label }} ({{ column.tasks.length }})</h3>

      <draggable
        v-model="column.tasks"
        group="tasks"
        item-key="id"
        class="kanban-drop-area"
        @end="onDragEnd"
        :move="allowDrop"
        @start="checkCanDrag"
      >
        <template #item="{ element }">
          <div class="kanban-task" @dblclick="openTask(element)">
            <p class="task-title">{{ element.title }}</p>
            <p class="task-deadline" v-if="element.deadline">
              {{ formatDate(element.deadline) }}
            </p>

            <div v-if="element.assignedTo?.length" class="task-avatars">
              <a-avatar-group :max-count="3" size="small">
                <a-avatar
                  v-for="userId in element.assignedTo"
                  :key="userId"
                  :src="getUserAvatar(userId)"
                  :alt="getUserName(userId)"
                >
                  {{ getUserInitials(userId) }}
                </a-avatar>
              </a-avatar-group>
            </div>

            
            <div v-if="element.comments?.length" class="task-comments">
              <a-button
                type="text"
                size="small"
                @click.stop="handleComment(element)"
                class="comments-button"
              >
                <CommentOutlined />
                <span>{{ element.comments.length }}</span>
              </a-button>
            </div>
          </div>
        </template>
      </draggable>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from "vue";
import draggable from "vuedraggable";
import { CommentOutlined } from '@ant-design/icons-vue'
import { TASK_STATUS } from "@/stores/tasks";
import { message } from "ant-design-vue";


const props = defineProps({
  tasks: { type: Array, required: true },
  users: {
    type: Array,
    default: () => []
  },
  isProjectManager: { type: Boolean, default: false }
});

const emit = defineEmits(["update-status", "open-task", "comment"]);

const columns = ref([
  { status: TASK_STATUS.NOT_VALIDATED, label: "Non validée", tasks: [] },
  { status: TASK_STATUS.VALIDATED, label: "Validée", tasks: [] },
  { status: TASK_STATUS.COMPLETED, label: "Terminée", tasks: [] }
]);

const updateColumns = () => {
  columns.value.forEach(col => {
    col.tasks = props.tasks.filter(t => t.status === col.status);
  });
};

const canDrag = computed(() => props.isProjectManager);

watch(() => props.tasks, updateColumns, { immediate: true, deep: true });

function onDragEnd(event) {
  const task = event.item.__draggable_context.element;
  const newStatus = event.to.closest(".kanban-column")?.dataset.status;
  if (!newStatus || task.status === newStatus) return;

  emit("update-status", task.id, newStatus);
}

function checkCanDrag(event) {
  if (!canDrag.value) {
    message.warning("Vous n'avez pas la permission de déplacer les tâches.");
    event.preventDefault?.();
  }
}

function allowDrop(event) {
  return canDrag.value; 
}

function formatDate(dateStr) { 
  return new Date(dateStr).toLocaleDateString(); 
}

function openTask(task) { 
  emit("open-task", task);
}

function handleComment(task) {
  emit("comment", task);
}

// A voir si on refacto car on utilise les mêmes fonctions dans TaskCard.vue
function getUserName(userId) {
  const user = props.users.find(u => u.id === userId)
  return user?.name || 'Unknown'
}

function getUserAvatar(userId) {
  const user = props.users.find(u => u.id === userId)
  return user?.avatar || null
}

function getUserInitials(userId) {
  const name = getUserName(userId)
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

</script>

<style scoped>

.task-avatars {
  margin-top: 8px;
  display: flex;
  align-items: center;
  gap: 4px; 
}

.comments-button {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  padding: 0;
  height: auto;
}

.kanban-board {
  display: flex;
  gap: 16px;
  padding: 16px;
  width: 100%;
  overflow-x: auto;
}

.kanban-column {
  padding: 8px;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
  border-radius: 6px;
  min-width: 0;
  flex-shrink: 0;
  min-height: 300px;
}

/* Si besoin de changer les couleurs des colonnes, c'est ici */
.kanban-column[data-status="not_validated"] { background-color: #fff1f0; }
.kanban-column[data-status="validated"] { background-color: #e6f7ff; }
.kanban-column[data-status="completed"] { background-color: #f6ffed; }

.kanban-column h3 {
  text-align: center;
  margin-bottom: 8px;
  font-weight: 600;
  color: #333;
  min-height: 0;
}

.kanban-drop-area {
  display: flex;
  flex-direction: column;
  gap: 10px;
  flex: 1;
  padding: 10px;
  min-height: 300px;
}

.kanban-task {
  background: white;
  border-radius: 4px;
  padding: 8px;
  cursor: grab;
  box-shadow: 0 1px 2px rgba(0,0,0,0.1);
  transition: all 0.2s;
}

.kanban-task:hover { background: #f0f5ff; }

.task-title { font-weight: 600; margin: 0; }
.task-deadline { font-size: 12px; color: #888; margin-top: 4px; }

.task-assigned { margin-top: 6px; }
.task-comments { font-size: 12px; color: #888; margin-top: 4px; }
</style>
