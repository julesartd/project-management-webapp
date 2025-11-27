<template>
  <div class="kanban-board">
    <div class="kanban-column" v-for="column in columns" :key="column.status" :data-status="column.status">
      <h3>{{ column.label }} ({{ column.tasks.length }})</h3>

      <draggable
        :list="column.tasks"
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
  tasks: {
    type: Array,
    required: true
  }
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

// watch(
//   () => props.tasks,
//   () => updateColumns(),
//   { immediate: true, deep: true }
// );

watch(
  () => props.tasks,
  updateColumns,
  { immediate: true, deep: true }
);

function onDragEnd(event) {
  const movedTask = event.item.__draggable_context.element; // l'élément "task" réel
  const newStatus = event.to.closest(".kanban-column").dataset.status;

  if (movedTask.status !== newStatus) {
    movedTask.status = newStatus;
    emit("update-status", movedTask.id, newStatus);
    updateColumns(); // pour refléter les changements dans le Kanban
  }
}

function allowDrop() {
  return true;
}

function openTask(task) {
  emit("open-task", task);
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString();
}

columns.value.forEach(col => col.columnStatus = col.status);
</script>

<style scoped>
.kanban-board {
  display: flex;
  gap: 16px;
  padding: 16px;
  overflow-x: auto;
}

.kanban-column {
  background: #f5f5f5;
  padding: 8px;
  border-radius: 6px;
  min-width: 250px;
  flex-shrink: 0;
}

.kanban-column h3 {
  text-align: center;
  margin-bottom: 8px;
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
}

.kanban-task:hover {
  background: #e6f7ff;
}

.task-title {
  font-weight: 600;
  margin: 0;
}

.task-deadline {
  font-size: 12px;
  color: #888;
  margin: 4px 0 0;
}
</style>
