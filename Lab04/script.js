document.addEventListener("DOMContentLoaded", () => {
    const popup = document.querySelector(".popup-window");
    const addBtn = document.querySelector(".add-btn");
    const cancelBtn = document.querySelector(".cancel-btn");
    const closeBtn = document.querySelector(".close-btn");
    const saveBtn = document.querySelector(".save-btn");
    const taskList = document.querySelector(".task-list");
    const taskNameInput = document.querySelector(".popup-task-name");
    const dateInput = document.getElementById("popup-date");
    const fakePlaceholder = document.querySelector(".fake-placeholder");
    const sortSelect = document.querySelectorAll(".filter-section select")[0];
    const filterSelect = document.querySelectorAll(".filter-section select")[1];
  
    let allTasksArray = [];
    let editingTask = null;
  
    function togglePlaceholder() {
      fakePlaceholder.style.opacity = dateInput.value ? "0" : "1";
    }
  
    function capitalize(str) {
      return str.charAt(0).toUpperCase() + str.slice(1);
    }
  
    function formatDate(dateStr) {
      const date = new Date(dateStr);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    }
  
    function createActionsForTask(taskObj) {
      const actions = taskObj.element.querySelector(".task-actions");
      actions.innerHTML = "";
  
      if (taskObj.completed) {
        const trash = document.createElement("i");
        trash.className = "fa-solid fa-trash";
        actions.appendChild(trash);
  
        trash.addEventListener("click", () => {
          taskObj.element.remove();
          const index = allTasksArray.findIndex(t => t === taskObj);
          if (index !== -1) allTasksArray.splice(index, 1);
          applyFiltersAndSorting();
        });
      } else {
        const edit = document.createElement("i");
        edit.className = "fa-solid fa-pen-to-square";
        actions.appendChild(edit);
  
        edit.addEventListener("click", () => {
          editingTask = taskObj;
          taskNameInput.value = capitalize(taskObj.name);
          dateInput.value = taskObj.date;
          fakePlaceholder.style.opacity = "0";
          document.querySelector(`input[value="${taskObj.priority}"]`).checked = true;
          saveBtn.textContent = "Зберегти";
          popup.classList.remove("hidden");
        });
      }
    }
  
    function createTaskFromData(taskData) {
      const taskItem = document.createElement("li");
      taskItem.className = "task";
  
      const checkboxLabel = document.createElement("label");
      checkboxLabel.className = "checkbox-item";
      const input = document.createElement("input");
      input.type = "checkbox";
      input.checked = taskData.completed;
      const spanCircle = document.createElement("span");
      spanCircle.className = "checkbox-circle";
      checkboxLabel.appendChild(input);
      checkboxLabel.appendChild(spanCircle);
  
      const content = document.createElement("div");
      content.className = "task-content";
      const nameSpan = document.createElement("span");
      nameSpan.className = "task-name";
      nameSpan.textContent = taskData.name;
      const prioSpan = document.createElement("span");
      prioSpan.className = "priority " + taskData.priority;
      prioSpan.textContent = capitalize(taskData.priority);
      content.appendChild(nameSpan);
      content.appendChild(prioSpan);
  
      const meta = document.createElement("div");
      meta.className = "task-meta";
      const dateSpan = document.createElement("span");
      dateSpan.className = "date";
      dateSpan.textContent = formatDate(taskData.date);
      const actions = document.createElement("span");
      actions.className = "task-actions visible";
  
      meta.appendChild(dateSpan);
      meta.appendChild(actions);
  
      taskItem.appendChild(checkboxLabel);
      taskItem.appendChild(content);
      taskItem.appendChild(meta);
  
      const taskObj = {
        element: taskItem,
        name: taskData.name.toLowerCase(),
        date: taskData.date,
        priority: taskData.priority,
        completed: taskData.completed,
      };
  
      input.addEventListener("change", () => {
        taskObj.completed = input.checked;
        createActionsForTask(taskObj);
        applyFiltersAndSorting();
      });
  
      createActionsForTask(taskObj);
      allTasksArray.push(taskObj);
    }
  
    // Завантаження з JSON
    fetch("tasks.json")
      .then((res) => res.json())
      .then((data) => {
        data.forEach(createTaskFromData);
        applyFiltersAndSorting();
      })
      .catch((err) => {
        console.error("Помилка JSON:", err);
      });
  

    addBtn.addEventListener("click", () => {
      editingTask = null;
      saveBtn.textContent = "Додати завдання";
      taskNameInput.value = "";
      dateInput.value = "";
      fakePlaceholder.style.opacity = "1";
      document.querySelector('input[value="medium"]').checked = true;
      popup.classList.remove("hidden");
    });
  
    cancelBtn.addEventListener("click", () => popup.classList.add("hidden"));
    closeBtn.addEventListener("click", () => popup.classList.add("hidden"));
    popup.addEventListener("click", e => {
      if (e.target === popup) popup.classList.add("hidden");
    });
  
    // Додавання/редагування
    saveBtn.addEventListener("click", () => {
      const taskName = taskNameInput.value.trim();
      const taskDate = dateInput.value;
      const priority = document.querySelector('input[name="priority"]:checked').value;
  
      if (!taskName || !taskDate) {
        alert("Будь ласка, заповніть всі поля.");
        return;
      }
  
      const duplicate = allTasksArray.some(t => t.name === taskName.toLowerCase() && t !== editingTask);
      if (duplicate) {
        alert("Завдання з такою назвою вже існує.");
        return;
      }
  
      if (editingTask) {
        editingTask.name = taskName.toLowerCase();
        editingTask.date = taskDate;
        editingTask.priority = priority;
  
        const el = editingTask.element;
        el.querySelector(".task-name").textContent = taskName;
        el.querySelector(".date").textContent = formatDate(taskDate);
        const prioSpan = el.querySelector(".priority");
        prioSpan.className = "priority " + priority;
        prioSpan.textContent = capitalize(priority);
      } else {
        createTaskFromData({
          name: taskName,
          date: taskDate,
          priority: priority,
          completed: false,
        });
      }
  
      taskNameInput.value = "";
      dateInput.value = "";
      fakePlaceholder.style.opacity = "1";
      document.querySelector('input[value="medium"]').checked = true;
      popup.classList.add("hidden");
      saveBtn.textContent = "Додати завдання";
      editingTask = null;
  
      applyFiltersAndSorting();
    });
  
    // Сортування і фільтрація
    sortSelect.addEventListener("change", applyFiltersAndSorting);
    filterSelect.addEventListener("change", applyFiltersAndSorting);
  
    function applyFiltersAndSorting() {
      const sortBy = sortSelect.value;
      const filterBy = filterSelect.value;
  
      let filtered = [...allTasksArray];
  
      // Фільтрація
      if (filterBy === "Completed") filtered = filtered.filter(t => t.completed);
      else if (filterBy === "Active") filtered = filtered.filter(t => !t.completed);
  
      // Сортування
      if (sortBy === "Date") {
        filtered.sort((a, b) => new Date(a.date) - new Date(b.date));
      } else if (sortBy === "Name") {
        filtered.sort((a, b) => a.name.localeCompare(b.name));
      } else if (sortBy === "Priority") {
        const p = { high: 3, medium: 2, low: 1 };
        filtered.sort((a, b) => p[b.priority] - p[a.priority]);
      }
  
      if (filterBy === "All") {
        filtered.sort((a, b) => a.completed - b.completed);
      }
  
      taskList.innerHTML = "";
      filtered.forEach(task => taskList.appendChild(task.element));
    }
  
    dateInput.addEventListener("input", togglePlaceholder);
    togglePlaceholder();
  });
  