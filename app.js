(() => {
  const STORAGE_KEY = "webtodo.tasks.v1";
  const form = document.getElementById("task-form");
  const input = document.getElementById("task-input");
  const list = document.getElementById("task-list");
  const countEl = document.getElementById("task-count");
  const clearBtn = document.getElementById("clear-completed");
  const filterBtns = [...document.querySelectorAll(".filter")];

  let tasks = load();
  let filter = "all";

  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }

  function uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  }

  function render() {
    const visible = tasks.filter((t) =>
      filter === "all" ? true : filter === "active" ? !t.done : t.done
    );

    list.innerHTML = "";

    if (visible.length === 0) {
      const li = document.createElement("li");
      li.className = "empty";
      li.textContent =
        filter === "all"
          ? "No tasks yet — add one above!"
          : filter === "active"
            ? "Nothing active. Enjoy the calm."
            : "No completed tasks yet.";
      list.appendChild(li);
    }

    for (const task of visible) {
      const li = document.createElement("li");
      li.className = "task" + (task.done ? " done" : "");
      li.dataset.id = task.id;

      const toggle = document.createElement("button");
      toggle.className = "toggle";
      toggle.setAttribute("aria-label", task.done ? "Mark as active" : "Mark as done");
      toggle.addEventListener("click", () => toggleTask(task.id));

      const label = document.createElement("span");
      label.className = "label";
      label.textContent = task.text;
      label.title = "Double-click to edit";
      label.addEventListener("dblclick", () => startEdit(task.id, label));

      const del = document.createElement("button");
      del.className = "btn-delete";
      del.setAttribute("aria-label", "Delete task");
      del.textContent = "×";
      del.addEventListener("click", () => deleteTask(task.id));

      li.append(toggle, label, del);
      list.appendChild(li);
    }

    const active = tasks.filter((t) => !t.done).length;
    countEl.textContent = `${active} active task${active === 1 ? "" : "s"}`;
  }

  function addTask(text) {
    tasks.unshift({ id: uid(), text, done: false, createdAt: Date.now() });
    save();
    render();
  }

  function toggleTask(id) {
    const t = tasks.find((t) => t.id === id);
    if (t) {
      t.done = !t.done;
      save();
      render();
    }
  }

  function deleteTask(id) {
    tasks = tasks.filter((t) => t.id !== id);
    save();
    render();
  }

  function startEdit(id, labelEl) {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;

    const editInput = document.createElement("input");
    editInput.className = "edit-input";
    editInput.value = task.text;
    editInput.maxLength = 200;

    const commit = () => {
      const next = editInput.value.trim();
      if (next) task.text = next;
      save();
      render();
    };

    editInput.addEventListener("blur", commit);
    editInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") editInput.blur();
      if (e.key === "Escape") render();
    });

    labelEl.replaceWith(editInput);
    editInput.focus();
    editInput.setSelectionRange(editInput.value.length, editInput.value.length);
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;
    addTask(text);
    input.value = "";
    input.focus();
  });

  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      filterBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      filter = btn.dataset.filter;
      render();
    });
  });

  clearBtn.addEventListener("click", () => {
    tasks = tasks.filter((t) => !t.done);
    save();
    render();
  });

  render();
})();
