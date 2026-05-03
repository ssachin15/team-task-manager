import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Modal from "../components/Modal";
import TaskCard from "../components/TaskCard";
import API from "../services/api";
import { ClipboardList, Plus, ArrowLeft, Loader2, FolderKanban, AlertCircle } from "lucide-react";

const STATUSES = ["To Do", "In Progress", "Completed"];

const columnStyles = {
  "To Do":       { header: "bg-gray-100 text-gray-600 border-gray-200",    dot: "bg-gray-400",    count: "bg-gray-200 text-gray-600"    },
  "In Progress": { header: "bg-amber-50 text-amber-700 border-amber-200",  dot: "bg-amber-400",   count: "bg-amber-100 text-amber-700"  },
  "Completed":  { header: "bg-emerald-50 text-emerald-700 border-emerald-200", dot: "bg-emerald-400", count: "bg-emerald-100 text-emerald-700" },
};

export default function ProjectDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);

  const [isOpen, setIsOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newTask, setNewTask] = useState({ title: "", description: "", dueDate: "", priority: "Medium" });

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [projRes, taskRes] = await Promise.all([
        API.get(`/projects/${id}`),
        API.get(`/tasks?project=${id}`),
      ]);
      setProject(projRes.data.project);
      setTasks(taskRes.data.tasks || []);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load project.");
    } finally {
      setLoading(false);
      setTimeout(() => setMounted(true), 50);
    }
  };

  const handleCreateTask = async () => {
    if (!newTask.title.trim()) return;
    setCreating(true);
    try {
      const res = await API.post("/tasks", {
        title: newTask.title.trim(),
        description: newTask.description.trim(),
        dueDate: newTask.dueDate || undefined,
        priority: newTask.priority,
        project: id,
        status: "To Do",
      });
      setTasks((prev) => [...prev, res.data.task]);
      setNewTask({ title: "", description: "", dueDate: "", priority: "Medium" });
      setIsOpen(false);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to create task.");
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteTask = async (taskId) => {
    // Optimistic remove
    setTasks((prev) => prev.filter((t) => (t._id || t.id) !== taskId));
    try {
      await API.delete(`/tasks/${taskId}`);
    } catch {
      fetchData(); // revert on failure
    }
  };

  const handleStatusChange = async (taskId, currentStatus) => {
    const next = STATUSES[(STATUSES.indexOf(currentStatus) + 1) % STATUSES.length];
    setTasks((prev) => prev.map((t) => (t._id || t.id) === taskId ? { ...t, status: next } : t));
    try {
      await API.put(`/tasks/${taskId}`, { status: next });
    } catch {
      fetchData();
    }
  };

  const columns = {
    "To Do":       tasks.filter((t) => t.status === "To Do"),
    "In Progress": tasks.filter((t) => t.status === "In Progress"),
    Completed:     tasks.filter((t) => t.status === "Completed"),
  };

  const completion = tasks.length
    ? Math.round((columns.Completed.length / tasks.length) * 100)
    : 0;

  // ── LOADING ──
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center text-gray-400">
          <Loader2 size={36} className="animate-spin text-red-400 mx-auto mb-3" />
          <p className="text-sm font-medium">Loading project...</p>
        </div>
      </div>
    );
  }

  // ── ERROR ──
  if (error && !project) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center text-gray-500 space-y-3">
          <AlertCircle size={40} className="text-red-400 mx-auto" />
          <p className="font-semibold">{error}</p>
          <button onClick={() => navigate("/projects")} className="text-red-600 hover:underline text-sm">
            ← Back to Projects
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">

        {/* ── HERO ── */}
        <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-r from-red-900 via-red-800 to-red-700 p-8 text-white shadow-xl transition-all duration-700 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
          <div className="absolute -top-8 -right-8 w-48 h-48 bg-white/5 rounded-full blur-2xl" />
          <div className="absolute -bottom-12 -left-8 w-56 h-56 bg-black/10 rounded-full blur-3xl" />

          <div className="relative">
            <button
              onClick={() => navigate("/projects")}
              className="flex items-center gap-1.5 text-red-200 hover:text-white text-sm mb-4 transition-colors"
            >
              <ArrowLeft size={14} /> Back to Projects
            </button>

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center border border-white/20">
                  <FolderKanban size={28} className="text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-extrabold tracking-tight">{project?.name || `Project #${id}`}</h1>
                  {project?.description && <p className="text-red-200 text-sm mt-0.5">{project.description}</p>}
                  <p className="text-red-200 text-sm mt-1">{tasks.length} tasks · {completion}% complete</p>
                </div>
              </div>

              <button
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-2 bg-white text-red-800 font-semibold px-5 py-2.5 rounded-xl hover:bg-red-50 active:scale-[0.97] transition-all duration-200 shadow-md self-start md:self-auto"
              >
                <Plus size={18} />
                Add Task
              </button>
            </div>

            {/* Mini progress bar */}
            <div className="mt-5 w-full bg-white/20 h-1.5 rounded-full overflow-hidden">
              <div
                className="h-1.5 bg-white rounded-full transition-all duration-1000"
                style={{ width: `${completion}%` }}
              />
            </div>
          </div>
        </div>

        {/* ── ERROR BANNER ── */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
            <AlertCircle size={15} className="shrink-0" /> {error}
          </div>
        )}

        {/* ── KANBAN BOARD ── */}
        <div className={`grid grid-cols-1 md:grid-cols-3 gap-6 transition-all duration-700 delay-200 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
          {Object.entries(columns).map(([status, items]) => {
            const style = columnStyles[status];
            return (
              <div key={status} className="flex flex-col gap-3">
                {/* Column Header */}
                <div className={`flex items-center justify-between px-4 py-2.5 rounded-xl border ${style.header}`}>
                  <div className="flex items-center gap-2">
                    <div className={`w-2.5 h-2.5 rounded-full ${style.dot}`} />
                    <h2 className="font-bold text-sm">{status}</h2>
                  </div>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${style.count}`}>
                    {items.length}
                  </span>
                </div>

                {/* Task Cards */}
                <div className="space-y-3 min-h-[120px]">
                  {items.length > 0 ? (
                    items.map((task, i) => (
                      <div
                        key={task._id || task.id}
                        className={`transition-all duration-400 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
                        style={{ transitionDelay: `${300 + i * 60}ms` }}
                      >
                        <TaskCard
                          task={task}
                          onStatusChange={() => handleStatusChange(task._id || task.id, task.status)}
                          onDelete={() => handleDeleteTask(task._id || task.id)}
                        />
                      </div>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center h-28 rounded-2xl border-2 border-dashed border-gray-200 text-gray-300">
                      <ClipboardList size={22} className="mb-1" />
                      <p className="text-xs font-medium">No tasks</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* ── MODAL ── */}
        <Modal isOpen={isOpen} onClose={() => { setIsOpen(false); setNewTask({ title: "", description: "", dueDate: "", priority: "Medium" }); }}>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
              <ClipboardList size={20} className="text-red-700" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Add New Task</h2>
              <p className="text-xs text-gray-400">Fill in the details below</p>
            </div>
          </div>

          <div className="space-y-3">
            <input
              type="text"
              placeholder="Task title *"
              value={newTask.title}
              onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-red-300 text-sm transition-all"
              autoFocus
            />
            <textarea
              placeholder="Description (optional)"
              value={newTask.description}
              onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
              rows={2}
              className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-red-300 text-sm transition-all resize-none"
            />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-500 font-medium mb-1 block">Due Date</label>
                <input
                  type="date"
                  value={newTask.dueDate}
                  onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                  className="w-full p-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-400 text-sm transition-all"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 font-medium mb-1 block">Priority</label>
                <select
                  value={newTask.priority}
                  onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                  className="w-full p-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-400 text-sm transition-all bg-white"
                >
                  <option>Low</option>
                  <option>Medium</option>
                  <option>High</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-5">
            <button
              onClick={() => { setIsOpen(false); setNewTask({ title: "", description: "", dueDate: "", priority: "Medium" }); }}
              className="px-4 py-2 text-sm text-gray-500 hover:text-gray-800 rounded-lg hover:bg-gray-100 transition-all font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateTask}
              disabled={creating || !newTask.title.trim()}
              className="flex items-center gap-2 bg-red-700 hover:bg-red-800 text-white px-5 py-2 rounded-xl text-sm font-semibold shadow-sm active:scale-[0.97] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {creating ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />}
              {creating ? "Adding..." : "Add Task"}
            </button>
          </div>
        </Modal>

      </div>
    </div>
  );
}
