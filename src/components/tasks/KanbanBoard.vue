<template>
  <div class="flex gap-4 p-4 w-full overflow-x-auto">
    <div
      class="p-2 flex-1 flex flex-col gap-2 rounded-md min-w-[280px] flex-shrink-0 min-h-[300px]"
      :class="{
        'bg-red-50': column.status === TASK_STATUS.NOT_VALIDATED,
        'bg-blue-50': column.status === TASK_STATUS.VALIDATED,
        'bg-green-50': column.status === TASK_STATUS.COMPLETED
      }"
      v-for="column in columns"
      :key="column.status"
      :data-status="column.status"
    >
      <h3 class="text-center mb-2 font-semibold text-gray-700 min-h-0">{{ column.label }} ({{ column.tasks.length }})</h3>

      <draggable
        v-model="column.tasks"
        group="tasks"
        item-key="id"
        class="flex flex-col gap-2.5 flex-1 p-2.5 min-h-[300px]"
        @end="onDragEnd"
        :move="allowDrop"
        @start="checkCanDrag"
      >
        <template #item="{ element }">
          <div class="bg-white rounded p-3 cursor-grab shadow-sm transition-all duration-200 hover:bg-indigo-50 hover:shadow-md border border-transparent hover:border-indigo-100" 
            @dblclick="openTask(element)"
            :title="'Double-cliquez pour ouvrir la tâche'"
          >
            <p class="font-semibold m-0 text-gray-800">{{ element.title }}</p>
            <p class="text-xs text-gray-500 mt-1 mb-0" v-if="element.deadline">
              {{ formatDate(element.deadline) }}
            </p>

            <div v-if="element.assignedTo?.length" class="mt-2 flex items-center gap-1">
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

            
            <div v-if="element.comments?.length" class="text-xs text-gray-400 mt-2 flex justify-end">
              <a-button
                type="text"
                size="small"
                @click.stop="handleComment(element)"
                class="inline-flex items-center gap-1 px-1 h-auto text-gray-400 hover:text-indigo-600"
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
  // Use closest to find the parent column div
  const newStatus = event.to.closest("[data-status]")?.dataset.status;
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
/* No custom CSS needed, all Tailwind utility classes */
</style>
