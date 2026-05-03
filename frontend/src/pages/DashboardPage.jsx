import { useEffect, useState } from "react";
import { ClipboardList, Clock, CheckCircle, AlertCircle, LayoutDashboard, Loader2, FolderKanban } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [taskRes, projRes] = await Promise.all([
        API.get("/tasks"),
        API.get("/projects"),
      ]);
      setTasks(taskRes.data.tasks || []);
      setProjects(projRes.data.projects || []);
    } catch (err) {
      // silently fail — show empty state
    } finally {
      setLoading(false);
      setTimeout(() => setMounted(true), 50);
    }
  };

  const today = new Date();
  const total = tasks.length;
  const todo = tasks.filter((t) => t.status === "To Do").length;
  const inProgress = tasks.filter((t) => t.status === "In Progress").length;
  const done = tasks.filter((t) => t.status === "Completed").length;
  const overdue = tasks.filter(
    (t) => t.dueDate && new Date(t.dueDate) < today && t.status !== "Completed"
  );
  const completion = total ? Math.round((done / total) * 100) : 0;

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  // ── LOADING ──
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center text-gray-400">
          <Loader2 size={36} className="animate-spin text-red-400 mx-auto mb-3" />
          <p className="text-sm font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">

        {/* ── HERO ── */}
        <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-r from-red-900 via-red-800 to-red-700 p-8 text-white shadow-xl transition-all duration-700 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
          <div className="absolute -top-8 -right-8 w-48 h-48 bg-white/5 rounded-full blur-2xl" />
          <div className="absolute -bottom-12 -left-8 w-56 h-56 bg-black/10 rounded-full blur-3xl" />
          <div className="relative flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center border border-white/20">
              <LayoutDashboard size={28} className="text-white" />
            </div>
            <div>
              <p className="text-red-200 text-sm font-medium">
                {greeting()}{user ? `, ${user.name.split(" ")[0]}` : ""} 👋
              </p>
              <h1 className="text-3xl font-extrabold tracking-tight">Dashboard</h1>
              <p className="text-red-200 text-sm mt-0.5">
                {projects.length} project{projects.length !== 1 ? "s" : ""} · {total} task{total !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
        </div>

        {/* ── STAT CARDS ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            { icon: ClipboardList, label: "Total Tasks",  value: total,      iconBg: "bg-red-50",    iconText: "text-red-700",    bar: "from-red-700 to-red-500",       delay: 0   },
            { icon: Clock,         label: "To Do",        value: todo,       iconBg: "bg-gray-100",  iconText: "text-gray-600",   bar: "from-gray-400 to-gray-500",     delay: 100 },
            { icon: AlertCircle,   label: "In Progress",  value: inProgress, iconBg: "bg-amber-50",  iconText: "text-amber-600",  bar: "from-amber-400 to-orange-500",  delay: 200 },
            { icon: CheckCircle,   label: "Completed",    value: done,       iconBg: "bg-emerald-50",iconText: "text-emerald-600",bar: "from-emerald-400 to-green-600", delay: 300 },
          ].map(({ icon: Icon, label, value, iconBg, iconText, bar, delay }) => (
            <div key={label}
              className={`group relative bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 overflow-hidden ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
              style={{ transitionDelay: `${delay}ms` }}>
              <div className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${bar} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl ${iconBg} flex items-center justify-center`}>
                  <Icon size={22} className={iconText} />
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">{label}</p>
                  <h2 className="text-2xl font-extrabold text-gray-900">{value}</h2>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ── PROGRESS ── */}
        <div className={`bg-white rounded-2xl p-6 shadow-sm border border-gray-100 transition-all duration-700 delay-300 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
          <div className="flex justify-between items-center mb-3">
            <div>
              <p className="text-sm font-semibold text-gray-700">Overall Completion</p>
              <p className="text-xs text-gray-400 mt-0.5">Based on your current tasks</p>
            </div>
            <span className="text-2xl font-extrabold text-red-700">{completion}%</span>
          </div>
          <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
            <div
              className="h-3 rounded-full bg-gradient-to-r from-red-800 to-red-600 transition-all duration-1000 ease-out shadow-sm"
              style={{ width: mounted ? `${completion}%` : "0%" }}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* ── OVERDUE ── */}
          <div className={`bg-white rounded-2xl p-6 shadow-sm border border-gray-100 transition-all duration-700 delay-400 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center">
                <AlertCircle size={18} className="text-red-600" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">Overdue Tasks</h3>
                <p className="text-xs text-gray-400">Needs your attention</p>
              </div>
            </div>
            {overdue.length > 0 ? (
              <div className="space-y-2">
                {overdue.slice(0, 5).map((task) => (
                  <div
                    key={task._id}
                    onClick={() => task.project?._id && navigate(`/projects/${task.project._id}`)}
                    className="flex justify-between items-center p-3 rounded-xl bg-red-50 border border-red-100 hover:bg-red-100/70 transition-colors cursor-pointer"
                  >
                    <div>
                      <span className="font-medium text-gray-800 text-sm block">{task.title}</span>
                      {task.project?.name && (
                        <span className="text-xs text-gray-400">{task.project.name}</span>
                      )}
                    </div>
                    <span className="text-xs text-red-700 font-medium bg-red-100 px-2 py-0.5 rounded-lg shrink-0 ml-2">
                      {new Date(task.dueDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-6 text-gray-400">
                <span className="text-3xl mb-2">🎉</span>
                <p className="text-sm font-medium">No overdue tasks!</p>
              </div>
            )}
          </div>

          {/* ── RECENT TASKS ── */}
          <div className={`bg-white rounded-2xl p-6 shadow-sm border border-gray-100 transition-all duration-700 delay-500 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center">
                  <ClipboardList size={18} className="text-red-700" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">Recent Tasks</h3>
                  <p className="text-xs text-gray-400">Your latest activity</p>
                </div>
              </div>
              <span className="text-xs font-semibold text-red-700 bg-red-50 border border-red-100 px-3 py-1 rounded-full">{total} total</span>
            </div>

            {tasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                <ClipboardList size={32} className="mb-2 text-gray-200" />
                <p className="text-sm font-medium">No tasks yet</p>
                <p className="text-xs mt-1">Create a project and add tasks to get started</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {tasks.slice(0, 5).map((task, i) => {
                  const cfg = {
                    "To Do":       { dot: "bg-gray-400",    bar: "bg-gray-200",    badge: "bg-gray-100 text-gray-600 border-gray-200" },
                    "In Progress": { dot: "bg-amber-400",   bar: "bg-amber-200",   badge: "bg-amber-50 text-amber-700 border-amber-200" },
                    Completed:     { dot: "bg-emerald-400", bar: "bg-emerald-200", badge: "bg-emerald-50 text-emerald-700 border-emerald-200" },
                  }[task.status] || { dot: "bg-gray-400", bar: "bg-gray-200", badge: "bg-gray-100 text-gray-600 border-gray-200" };

                  return (
                    <div
                      key={task._id}
                      onClick={() => task.project?._id && navigate(`/projects/${task.project._id}`)}
                      className={`group relative flex items-center gap-4 px-4 py-3.5 rounded-2xl border border-gray-100 bg-gray-50/60 hover:bg-white hover:shadow-md hover:border-red-100 hover:-translate-y-0.5 cursor-pointer transition-all duration-200 ${mounted ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"}`}
                      style={{ transitionDelay: `${500 + i * 80}ms` }}
                    >
                      <div className={`absolute left-0 top-3 bottom-3 w-1 rounded-full ${cfg.bar}`} />
                      <span className="ml-2 text-xs font-bold text-gray-300 w-4 shrink-0 group-hover:text-red-300 transition-colors">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${cfg.dot} shadow-sm`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-700 group-hover:text-gray-900 truncate">{task.title}</p>
                        {task.project?.name && (
                          <p className="text-xs text-gray-400 truncate">{task.project.name}</p>
                        )}
                      </div>
                      <span className={`text-xs px-2.5 py-1 rounded-full font-semibold border shrink-0 ${cfg.badge}`}>
                        {task.status}
                      </span>
                      <span className="text-gray-300 group-hover:text-red-400 group-hover:translate-x-0.5 transition-all text-sm">›</span>
                    </div>
                  );
                })}
              </div>
            )}

            {tasks.length > 0 && (
              <button
                onClick={() => navigate("/projects")}
                className="mt-4 w-full text-center text-xs text-red-600 hover:text-red-800 font-semibold py-2 rounded-xl hover:bg-red-50 transition-all"
              >
                View all projects →
              </button>
            )}
          </div>

        </div>

        {/* ── PROJECTS ROW ── */}
        {projects.length > 0 && (
          <div className={`bg-white rounded-2xl p-6 shadow-sm border border-gray-100 transition-all duration-700 delay-600 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center">
                  <FolderKanban size={18} className="text-red-700" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">Your Projects</h3>
                  <p className="text-xs text-gray-400">Quick access</p>
                </div>
              </div>
              <button
                onClick={() => navigate("/projects")}
                className="text-xs text-red-600 hover:text-red-800 font-semibold hover:bg-red-50 px-3 py-1.5 rounded-lg transition-all"
              >
                View all →
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {projects.slice(0, 6).map((proj) => (
                <div
                  key={proj._id}
                  onClick={() => navigate(`/projects/${proj._id}`)}
                  className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-red-100 hover:bg-red-50/40 cursor-pointer transition-all group"
                >
                  <div className="w-9 h-9 rounded-lg bg-red-100 text-red-700 flex items-center justify-center shrink-0">
                    <FolderKanban size={16} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-800 group-hover:text-red-700 truncate transition-colors">{proj.name}</p>
                    <p className="text-xs text-gray-400">{proj.tasks?.length || 0} tasks</p>
                  </div>
                  <span className="text-gray-300 group-hover:text-red-400 ml-auto text-sm transition-colors">›</span>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
