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
      >
        <template #item="{ element }">
          <div class="kanban-task" @dblclick="openTask(element)">
            <p class="task-title">{{ element.title }}</p>
            <p class="task-deadline" v-if="element.deadline">
              {{ formatDate(element.deadline) }}
            </p>
            
            <div v-if="element.comments?.length" class="task-comments">
              💬 {{ element.comments.length }}
            </div>
          </div>
        </template>
      </draggable>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from "vue";
import draggable from "vuedraggable";

const props = defineProps({
  tasks: { type: Array, required: true }
});

const emit = defineEmits(["update-status", "open-task"]);

const columns = ref([
  { status: "non_validé", label: "Non validée", tasks: [] },
  { status: "validé", label: "Validée", tasks: [] },
  { status: "completed", label: "Terminée", tasks: [] }
]);

const updateColumns = () => {
  columns.value.forEach(col => {
    col.tasks = props.tasks.filter(t => t.status === col.status);
  });
};

watch(() => props.tasks, updateColumns, { immediate: true, deep: true });

function onDragEnd(event) {
  const task = event.item.__draggable_context.element;
  const newStatus = event.to.closest(".kanban-column")?.dataset.status;
  if (!newStatus || task.status === newStatus) return;

  emit("update-status", task.id, newStatus);
}

function allowDrop() { 
  return true; 
}

function formatDate(dateStr) { 
  return new Date(dateStr).toLocaleDateString(); 
}

function openTask(task) { 
  emit("open-task", task);
}
</script>

<style scoped>
.kanban-board {
  display: flex;
  gap: 16px;
  padding: 16px;
  overflow-x: auto;
}

.kanban-column {
  padding: 8px;
  border-radius: 6px;
  min-width: 250px;
  flex-shrink: 0;
}

/* Si besoin de changer les couleurs des colonnes, c'est ici */
.kanban-column[data-status="non_validé"] { background-color: #fff1f0; }
.kanban-column[data-status="validé"] { background-color: #e6f7ff; }
.kanban-column[data-status="completed"] { background-color: #f6ffed; }

.kanban-column h3 {
  text-align: center;
  margin-bottom: 8px;
  font-weight: 600;
  color: #333;
}

.kanban-drop-area {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 4px;
  min-height: 50px;
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
