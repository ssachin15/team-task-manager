import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FolderKanban, Trash2 } from "lucide-react";
import { useRBAC } from "../hooks/useRBAC";

export default function ProjectCard({ project, onDelete }) {
  const navigate = useNavigate();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const { canDeleteProject } = useRBAC();

  const totalTasks = project.tasks?.length || project.tasks || 0;
  const completedTasks = Math.floor(totalTasks * 0.6);
  const progress = totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const handleDeleteClick = (e) => {
    e.stopPropagation(); // prevent card navigation
    setConfirmDelete(true);
  };

  const handleConfirmDelete = async (e) => {
    e.stopPropagation();
    setDeleting(true);
    await onDelete(project._id || project.id);
    setDeleting(false);
    setConfirmDelete(false);
  };

  const handleCancelDelete = (e) => {
    e.stopPropagation();
    setConfirmDelete(false);
  };

  return (
    <div
      onClick={() => navigate(`/projects/${project._id || project.id}`)}
      className="relative bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer group overflow-hidden"
    >
      {/* Top accent line on hover */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-red-800 to-red-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {/* CONFIRM DELETE OVERLAY */}
      {confirmDelete && (
        <div
          className="absolute inset-0 bg-white/95 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center z-10 p-5 gap-3"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-1">
            <Trash2 size={22} className="text-red-600" />
          </div>
          <p className="text-sm font-bold text-gray-800 text-center">Delete this project?</p>
          <p className="text-xs text-gray-400 text-center">This will also delete all tasks inside it. This action cannot be undone.</p>
          <div className="flex gap-2 mt-1 w-full">
            <button
              onClick={handleCancelDelete}
              className="flex-1 px-3 py-2 text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmDelete}
              disabled={deleting}
              className="flex-1 px-3 py-2 text-sm text-white bg-red-700 hover:bg-red-800 rounded-xl font-semibold transition-all disabled:opacity-60 flex items-center justify-center gap-1"
            >
              {deleting ? "Deleting..." : "Delete"}
            </button>
          </div>
        </div>
      )}

      {/* TOP */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-red-100 text-red-700">
            <FolderKanban size={18} />
          </div>
          <h2 className="text-lg font-semibold text-gray-800 group-hover:text-red-700 transition">
            {project.name}
          </h2>
        </div>

        {/* DELETE BUTTON - Only visible if user can delete project */}
         {canDeleteProject && (
           <button
             onClick={handleDeleteClick}
             className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all"
             title="Delete project"
           >
             <Trash2 size={16} />
           </button>
         )}
      </div>

      {/* DESCRIPTION */}
      {project.description && (
        <p className="text-xs text-gray-400 mb-3 line-clamp-2">{project.description}</p>
      )}

      {/* TASK COUNT */}
      <p className="text-sm text-gray-500">{totalTasks} tasks</p>

      {/* PROGRESS BAR */}
      <div className="mt-4">
        <div className="flex justify-between text-xs text-gray-400 mb-1">
          <span>Progress</span>
          <span>{progress}%</span>
        </div>
        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-2 bg-gradient-to-r from-red-800 to-red-600 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* HOVER ACTION */}
      <div className="mt-4 text-sm text-red-700 opacity-0 group-hover:opacity-100 transition font-medium">
        View Project →
      </div>
    </div>
  );
}
