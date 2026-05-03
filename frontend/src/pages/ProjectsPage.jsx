import { useState, useEffect } from "react";
import Modal from "../components/Modal";
import ProjectCard from "../components/ProjectCard";
import { useRBAC } from "../hooks/useRBAC";
import { Search, FolderKanban, Plus, Loader2 } from "lucide-react";
import API from "../services/api";

export default function ProjectsPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [newProject, setNewProject] = useState({ name: "", description: "" });
  const [search, setSearch] = useState("");
  const { isAdmin } = useRBAC();

  // Fetch projects from API on mount
  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await API.get("/projects");
      setProjects(res.data.projects || []);
    } catch (err) {
      setError("Failed to load projects.");
    } finally {
      setLoading(false);
      setTimeout(() => setMounted(true), 50);
    }
  };

  const handleCreateProject = async () => {
    if (!newProject.name.trim()) return;
    setCreating(true);
    setError("");
    try {
      const res = await API.post("/projects", {
        name: newProject.name.trim(),
        description: newProject.description.trim(),
      });
      setProjects((prev) => [...prev, res.data.project]);
      setNewProject({ name: "", description: "" });
      setIsOpen(false);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to create project.");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (projectId) => {
    // Optimistic removal
    setProjects((prev) => prev.filter((p) => p._id !== projectId));
    try {
      await API.delete(`/projects/${projectId}`);
    } catch (err) {
      // Revert on failure
      fetchProjects();
    }
  };

  const filteredProjects = projects.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">

        {/* ── HERO ── */}
        <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-r from-red-900 via-red-800 to-red-700 p-8 text-white shadow-xl transition-all duration-700 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
          <div className="absolute -top-10 -right-10 w-52 h-52 bg-white/5 rounded-full blur-2xl" />
          <div className="absolute -bottom-14 -left-10 w-60 h-60 bg-black/10 rounded-full blur-3xl" />
            <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-5">
             <div className="flex items-center gap-4">
               <div className="w-14 h-14 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center border border-white/20">
                 <FolderKanban size={28} className="text-white" />
               </div>
               <div>
                 <p className="text-red-200 text-sm font-medium">Your workspace</p>
                 <h1 className="text-3xl font-extrabold tracking-tight">Projects</h1>
                 <p className="text-red-200 text-sm mt-0.5">Manage all your projects in one place</p>
               </div>
             </div>
             {isAdmin && (
               <button
                 onClick={() => setIsOpen(true)}
                 className="flex items-center gap-2 bg-white text-red-800 font-semibold px-5 py-2.5 rounded-xl hover:bg-red-50 active:scale-[0.97] transition-all duration-200 shadow-md self-start md:self-auto"
               >
                 <Plus size={18} />
                 New Project
               </button>
             )}
           </div>
        </div>

        {/* ── SEARCH + STATS ── */}
        <div className={`flex flex-col md:flex-row gap-4 md:items-center md:justify-between transition-all duration-700 delay-150 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2.5 w-full md:max-w-sm shadow-sm focus-within:ring-2 focus-within:ring-red-400 focus-within:border-red-300 transition-all">
            <Search size={16} className="text-gray-400 shrink-0" />
            <input
              type="text"
              placeholder="Search projects..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full outline-none text-sm text-gray-700 bg-transparent placeholder:text-gray-400"
            />
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500 bg-white border border-gray-200 px-4 py-2 rounded-xl shadow-sm">
            <FolderKanban size={15} className="text-red-500" />
            <span><span className="font-bold text-gray-800">{filteredProjects.length}</span> projects</span>
          </div>
        </div>

        {/* ── ERROR BANNER ── */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
            {error}
          </div>
        )}

        {/* ── LOADING STATE ── */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 text-gray-400">
            <Loader2 size={36} className="animate-spin text-red-400 mb-3" />
            <p className="text-sm font-medium">Loading projects...</p>
          </div>
        ) : filteredProjects.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredProjects.map((project, i) => (
              <div
                key={project._id}
                className={`transition-all duration-500 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
                style={{ transitionDelay: `${200 + i * 80}ms` }}
              >
                <ProjectCard project={project} onDelete={handleDelete} />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-center text-gray-400 py-24">
            <div className="w-20 h-20 rounded-3xl bg-red-50 flex items-center justify-center mb-5 shadow-inner">
              <FolderKanban size={36} className="text-red-300" />
            </div>
            <p className="text-lg font-semibold text-gray-600">No projects found</p>
            <p className="text-sm mt-1 text-gray-400">Try creating a new project or adjusting your search</p>
            <button
              onClick={() => setIsOpen(true)}
              className="mt-5 flex items-center gap-2 bg-red-700 text-white px-5 py-2.5 rounded-xl hover:bg-red-800 transition-all font-medium shadow-sm"
            >
              <Plus size={16} />
              Create first project
            </button>
          </div>
        )}

        {/* ── MODAL ── */}
        <Modal isOpen={isOpen} onClose={() => { setIsOpen(false); setNewProject({ name: "", description: "" }); setError(""); }}>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
              <FolderKanban size={20} className="text-red-700" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Create New Project</h2>
              <p className="text-xs text-gray-400">Give your project a name to get started</p>
            </div>
          </div>

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm">
              {error}
            </div>
          )}

          <input
            type="text"
            placeholder="Project name *"
            value={newProject.name}
            onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
            onKeyDown={(e) => e.key === "Enter" && handleCreateProject()}
            className="w-full p-3 border border-gray-200 rounded-xl mb-3 focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-red-300 text-sm transition-all"
            autoFocus
          />
          <textarea
            placeholder="Description (optional)"
            value={newProject.description}
            onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
            rows={2}
            className="w-full p-3 border border-gray-200 rounded-xl mb-5 focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-red-300 text-sm transition-all resize-none"
          />

          <div className="flex justify-end gap-3">
            <button
              onClick={() => { setIsOpen(false); setNewProject({ name: "", description: "" }); setError(""); }}
              className="px-4 py-2 text-sm text-gray-500 hover:text-gray-800 rounded-lg hover:bg-gray-100 transition-all font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateProject}
              disabled={creating || !newProject.name.trim()}
              className="flex items-center gap-2 bg-red-700 hover:bg-red-800 text-white px-5 py-2 rounded-xl text-sm font-semibold shadow-sm active:scale-[0.97] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {creating ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />}
              {creating ? "Creating..." : "Create Project"}
            </button>
          </div>
        </Modal>

      </div>
    </div>
  );
}
