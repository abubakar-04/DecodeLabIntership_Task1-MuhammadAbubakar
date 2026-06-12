const STORAGE_KEY = "taskflow.tasks";

const taskForm = document.querySelector("#task-form");
const taskInput = document.querySelector("#task-input");
const taskList = document.querySelector("#task-list");
const emptyState = document.querySelector("#empty-state");
const formMessage = document.querySelector("#form-message");
const taskCount = document.querySelector("#task-count");
const clearCompletedButton = document.querySelector("#clear-completed");
const filterButtons = document.querySelectorAll(".filter-btn");

let tasks = loadTasks();
let currentFilter = "all";

renderTasks();

taskForm.addEventListener("submit", (event) => {
  event.preventDefault();
  addTask();
});

taskList.addEventListener("change", (event) => {
  if (event.target.matches(".task-checkbox")) {
    toggleTask(event.target.dataset.id);
  }
});

taskList.addEventListener("click", (event) => {
  if (event.target.matches(".delete-btn")) {
    deleteTask(event.target.dataset.id);
  }
});

clearCompletedButton.addEventListener("click", clearCompletedTasks);

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    setFilter(button.dataset.filter);
  });
});

function addTask() {
  const title = taskInput.value.trim();

  if (!title) {
    showMessage("Please enter a task first.");
    return;
  }

  tasks.unshift({
    id: createTaskId(),
    title,
    completed: false,
  });

  taskInput.value = "";
  showMessage("");
  saveAndRender();
}

function toggleTask(id) {
  tasks = tasks.map((task) => {
    if (task.id !== id) {
      return task;
    }

    return {
      ...task,
      completed: !task.completed,
    };
  });

  saveAndRender();
}

function deleteTask(id) {
  tasks = tasks.filter((task) => task.id !== id);
  saveAndRender();
}

function clearCompletedTasks() {
  tasks = tasks.filter((task) => !task.completed);
  saveAndRender();
}

function setFilter(filter) {
  currentFilter = filter;

  filterButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.filter === filter);
  });

  renderTasks();
}

function getVisibleTasks() {
  if (currentFilter === "active") {
    return tasks.filter((task) => !task.completed);
  }

  if (currentFilter === "completed") {
    return tasks.filter((task) => task.completed);
  }

  return tasks;
}

function renderTasks() {
  const visibleTasks = getVisibleTasks();

  taskList.innerHTML = "";
  visibleTasks.forEach((task) => {
    taskList.appendChild(createTaskElement(task));
  });

  updateEmptyState(visibleTasks.length);
  updateTaskCount();
}

function createTaskElement(task) {
  const article = document.createElement("article");
  article.className = "task-card";
  article.classList.toggle("completed", task.completed);

  const checkbox = document.createElement("input");
  checkbox.className = "task-checkbox";
  checkbox.type = "checkbox";
  checkbox.checked = task.completed;
  checkbox.dataset.id = task.id;
  checkbox.setAttribute("aria-label", `Mark ${task.title} as completed`);

  const title = document.createElement("span");
  title.className = "task-title";
  title.textContent = task.title;

  const deleteButton = document.createElement("button");
  deleteButton.className = "delete-btn";
  deleteButton.type = "button";
  deleteButton.dataset.id = task.id;
  deleteButton.textContent = "Delete";
  deleteButton.setAttribute("aria-label", `Delete ${task.title}`);

  article.append(checkbox, title, deleteButton);
  return article;
}

function updateEmptyState(visibleTaskCount) {
  emptyState.classList.toggle("hidden", visibleTaskCount > 0);
}

function updateTaskCount() {
  const remainingTasks = tasks.filter((task) => !task.completed).length;
  const label = remainingTasks === 1 ? "task" : "tasks";
  taskCount.textContent = `${remainingTasks} ${label} remaining`;
}

function showMessage(message) {
  formMessage.textContent = message;
}

function saveAndRender() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  renderTasks();
}

function createTaskId() {
  return `task-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function loadTasks() {
  const storedTasks = localStorage.getItem(STORAGE_KEY);

  if (!storedTasks) {
    return [];
  }

  try {
    return JSON.parse(storedTasks);
  } catch {
    return [];
  }
}
