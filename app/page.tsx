
"use client";

import {
  useCallback,
  useEffect,
  useState,
  useSyncExternalStore,
} from "react";

type Task = {
  id: number;
  title: string;
  description: string | null;
  category: string;
  priority: string;
  status: string;
  dueDate: string | null;
};

const initialForm = {
  title: "",
  description: "",
  category: "Personal",
  priority: "Medium",
  status: "To Do",
  dueDate: "",
};

const NAME_EVENT = "bloom-name-change";

function subscribeToName(callback: () => void) {
  window.addEventListener(NAME_EVENT, callback);
  window.addEventListener("storage", callback);

  return () => {
    window.removeEventListener(NAME_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

function getNameSnapshot() {
  return localStorage.getItem("bloom-user-name") || "there";
}

function getServerNameSnapshot() {
  return "there";
}

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [nameModalOpen, setNameModalOpen] = useState(false);
  const [draftName, setDraftName] = useState("");
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const userName = useSyncExternalStore(
    subscribeToName,
    getNameSnapshot,
    getServerNameSnapshot
  );

  const fetchTasks = useCallback(async () => {
    try {
      const response = await fetch("/api/tasks");
      if (!response.ok) throw new Error("Gagal mengambil data");

      const data = await response.json();
      setTasks(data);
    } catch {
      setError("Tidak dapat mengambil data tugas.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const loadTasks = async () => {
      await fetchTasks();
    };

    loadTasks();
  }, [fetchTasks]);

  function openCreate() {
    setForm(initialForm);
    setEditingId(null);
    setError("");
    setModalOpen(true);
  }

  function openEdit(task: Task) {
    setForm({
      title: task.title,
      description: task.description || "",
      category: task.category,
      priority: task.priority,
      status: task.status,
      dueDate: task.dueDate
        ? new Date(task.dueDate).toISOString().slice(0, 10)
        : "",
    });

    setEditingId(task.id);
    setError("");
    setModalOpen(true);
  }

  function openNameSettings() {
    setDraftName(userName === "there" ? "" : userName);
    setNameModalOpen(true);
  }

  function saveName(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const newName = draftName.trim();

    if (!newName) return;

    localStorage.setItem("bloom-user-name", newName);
    window.dispatchEvent(new Event(NAME_EVENT));
    setNameModalOpen(false);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    if (!form.title.trim()) {
      setError("Nama tugas wajib diisi.");
      return;
    }

    try {
      const response = await fetch(
        editingId ? `/api/tasks/${editingId}` : "/api/tasks",
        {
          method: editingId ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        }
      );

      if (!response.ok) throw new Error("Gagal menyimpan tugas.");

      setModalOpen(false);
      setForm(initialForm);
      setEditingId(null);
      await fetchTasks();
    } catch {
      setError("Tugas gagal disimpan. Silakan coba lagi.");
    }
  }

  async function handleDelete(id: number) {
    const confirmed = window.confirm(
      "Apakah kamu yakin ingin menghapus tugas ini?"
    );

    if (!confirmed) return;

    try {
      const response = await fetch(`/api/tasks/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Gagal menghapus tugas.");

      await fetchTasks();
    } catch {
      setError("Tugas gagal dihapus.");
    }
  }

  const filteredTasks =
    filter === "All"
      ? tasks
      : tasks.filter((task) => task.status === filter);

  const completed = tasks.filter(
    (task) => task.status === "Done"
  ).length;

  const inProgress = tasks.filter(
    (task) => task.status === "In Progress"
  ).length;

  const todo = tasks.filter(
    (task) => task.status === "To Do"
  ).length;

  function getStatusClass(status: string) {
    if (status === "Done") return "status-done";
    if (status === "In Progress") return "status-progress";
    return "status-todo";
  }

  return (
    <div className="dashboard">
      <aside className="sidebar">
        <div className="logo">
          <span className="logo-icon">✿</span>
          bloom<span className="logo-dot">.</span>
        </div>

        <div className="sidebar-label">MENU</div>

        <div className="nav-item active">
          <span>⌂</span> Dashboard
        </div>

        <div className="nav-item">
          <span>♡</span> My Tasks
        </div>

        <div className="nav-item">
          <span>◷</span> Overview
        </div>

        <div className="sidebar-label workspace-label">
          WORKSPACE
        </div>

        <div className="nav-item">
          <span>♡</span> Personal
        </div>

        <div className="nav-item">
          <span>✎</span> Academic
        </div>

        <div className="nav-item">
          <span>✿</span> Others
        </div>

        <div className="sidebar-bottom">
          <div className="sidebar-decoration">♡</div>
          <p>One step at a time.</p>
          <span>You are doing great!</span>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div>
            <p className="topbar-date">YOUR PERSONAL SPACE ✿</p>
            <h1>Hello, {userName}! <span>🌷</span></h1>
            <p className="subtitle">
              Let&apos;s make today a little more productive.
            </p>
          </div>

          <button
            className="profile-button"
            onClick={openNameSettings}
          >
            <span className="profile-avatar">♡</span>
            <span className="profile-name">{userName}</span>
            <span>⌄</span>
          </button>
        </header>

        <section className="welcome-banner">
          <div className="banner-content">
            <span className="banner-small">A LITTLE REMINDER</span>
            <h2>Make room for<br />good things.</h2>
            <p>
              Organize your tasks, take your time, and enjoy the little things.
            </p>
            <button onClick={openCreate} className="banner-button">
              + Create a task
            </button>
          </div>
          <div className="banner-flower">✿</div>
          <div className="banner-heart">♡</div>
        </section>

        <section className="stats">
          <div className="stat-card stat-total">
            <div className="stat-top">
              <span>Total Tasks</span>
              <span className="stat-icon">✿</span>
            </div>
            <h2>{tasks.length}</h2>
            <p>All your little plans</p>
          </div>

          <div className="stat-card stat-progress">
            <div className="stat-top">
              <span>In Progress</span>
              <span className="stat-icon">◷</span>
            </div>
            <h2>{inProgress}</h2>
            <p>Keep it going!</p>
          </div>

          <div className="stat-card stat-completed">
            <div className="stat-top">
              <span>Completed</span>
              <span className="stat-icon">♡</span>
            </div>
            <h2>{completed}</h2>
            <p>Look at you go!</p>
          </div>

          <div className="stat-card stat-todo">
            <div className="stat-top">
              <span>To Do</span>
              <span className="stat-icon">✎</span>
            </div>
            <h2>{todo}</h2>
            <p>One step at a time</p>
          </div>
        </section>

        <section className="task-section">
          <div className="section-header">
            <div>
              <p className="section-eyebrow">YOUR DAILY PLANS</p>
              <h2>My Tasks <span>♡</span></h2>
              <p className="subtitle">
                A little progress is still progress.
              </p>
            </div>

            <button className="primary-btn" onClick={openCreate}>
              + Add New Task
            </button>
          </div>

          <div className="filters">
            {["All", "To Do", "In Progress", "Done"].map((item) => (
              <button
                key={item}
                className={`filter-btn ${filter === item ? "active" : ""}`}
                onClick={() => setFilter(item)}
              >
                {item}
              </button>
            ))}
          </div>

          {error && <p className="error-message">{error}</p>}

          {loading ? (
            <div className="empty">Loading your tasks...</div>
          ) : filteredTasks.length === 0 ? (
            <div className="empty">
              <div className="empty-flower">✿</div>
              <h3>No tasks yet</h3>
              <p>
                Your list is waiting for something lovely.
              </p>
              <button className="empty-button" onClick={openCreate}>
                Create your first task
              </button>
            </div>
          ) : (
            <div className="task-list">
              {filteredTasks.map((task) => (
                <article className="task-item" key={task.id}>
                  <div className="task-bullet">♡</div>

                  <div className="task-info">
                    <h3>{task.title}</h3>
                    <p>{task.description || "No description"}</p>

                    <div className="task-meta">
                      <span className="tag">{task.category}</span>
                      <span className="tag">{task.priority}</span>
                      <span className={`tag ${getStatusClass(task.status)}`}>
                        {task.status}
                      </span>
                      {task.dueDate && (
                        <span className="tag">
                          Due: {new Date(task.dueDate).toLocaleDateString("id-ID")}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="actions">
                    <button
                      className="action-btn"
                      onClick={() => openEdit(task)}
                    >
                      Edit
                    </button>

                    <button
                      className="action-btn delete"
                      onClick={() => handleDelete(task.id)}
                    >
                      Delete
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <footer className="footer">
          made with love <span>♡</span> bloom.
        </footer>

        {modalOpen && (
          <div className="modal-overlay">
            <div className="modal">
              <button
                className="modal-close"
                onClick={() => setModalOpen(false)}
              >
                ×
              </button>

              <p className="section-eyebrow">A NEW LITTLE PLAN</p>
              <h2>{editingId ? "Edit Task ♡" : "Create New Task ✿"}</h2>

              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Task Name *</label>
                  <input
                    type="text"
                    placeholder="What do you need to do?"
                    value={form.title}
                    onChange={(e) =>
                      setForm({ ...form, title: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    placeholder="Add a little description..."
                    value={form.description}
                    onChange={(e) =>
                      setForm({ ...form, description: e.target.value })
                    }
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Category</label>
                    <select
                      value={form.category}
                      onChange={(e) =>
                        setForm({ ...form, category: e.target.value })
                      }
                    >
                      <option>Personal</option>
                      <option>Academic</option>
                      <option>Work</option>
                      <option>Others</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Priority</label>
                    <select
                      value={form.priority}
                      onChange={(e) =>
                        setForm({ ...form, priority: e.target.value })
                      }
                    >
                      <option>Low</option>
                      <option>Medium</option>
                      <option>High</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Status</label>
                    <select
                      value={form.status}
                      onChange={(e) =>
                        setForm({ ...form, status: e.target.value })
                      }
                    >
                      <option>To Do</option>
                      <option>In Progress</option>
                      <option>Done</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Due Date</label>
                    <input
                      type="date"
                      value={form.dueDate}
                      onChange={(e) =>
                        setForm({ ...form, dueDate: e.target.value })
                      }
                    />
                  </div>
                </div>

                {error && <p className="error-message">{error}</p>}

                <div className="form-actions">
                  <button
                    type="button"
                    className="cancel-btn"
                    onClick={() => setModalOpen(false)}
                  >
                    Cancel
                  </button>

                  <button type="submit" className="primary-btn">
                    {editingId ? "Save Changes" : "Create Task"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {nameModalOpen && (
          <div className="modal-overlay">
            <div className="modal name-modal">
              <button
                className="modal-close"
                onClick={() => setNameModalOpen(false)}
              >
                ×
              </button>

              <p className="section-eyebrow">MAKE IT YOURS</p>
              <h2>What should we call you? ♡</h2>
              <p className="name-description">
                Your name will appear in your Bloom dashboard.
              </p>

              <form onSubmit={saveName}>
                <div className="form-group">
                  <label>Your Name</label>
                  <input
                    type="text"
                    placeholder="Enter your name..."
                    value={draftName}
                    onChange={(e) => setDraftName(e.target.value)}
                    maxLength={30}
                    required
                    autoFocus
                  />
                </div>

                <div className="form-actions">
                  <button
                    type="button"
                    className="cancel-btn"
                    onClick={() => setNameModalOpen(false)}
                  >
                    Cancel
                  </button>

                  <button type="submit" className="primary-btn">
                    Save Name ♡
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
