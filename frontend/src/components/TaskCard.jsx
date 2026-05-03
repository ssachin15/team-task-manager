import { useState } from "react";
import { Calendar, Trash2, ArrowRight, Flag } from "lucide-react";

const statusStyles = {
  "To Do":       "bg-gray-100 text-gray-600 border-gray-200",
  "In Progress": "bg-amber-50 text-amber-700 border-amber-200",
  Done:          "bg-emerald-50 text-emerald-700 border-emerald-200",
};

const priorityStyles = {
  High:   "text-red-600 bg-red-50",
  Medium: "text-amber-600 bg-amber-50",
  Low:    "text-emerald-600 bg-emerald-50",
};

export default function TaskCard({ task, onStatusChange, onDelete }) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "Done";

  const handleDeleteConfirm = async (e) => {
    e.stopPropagation();
    setDeleting(true);
    await onDelete?.();
    setDeleting(false);
    setConfirmDelete(false);
  };

  return (
    <div className="relative group bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100 hover:border-red-100 overflow-hidden">

      {/* Left accent bar */}
      <div className={`absolute left-0 top-3 bottom-3 w-1 rounded-full ${
        task.status === "Done" ? "bg-emerald-300" :
        task.status === "In Progress" ? "bg-amber-300" : "bg-gray-200"
      }`} />

      {/* CONFIRM DELETE OVERLAY */}
      {confirmDelete && (
        <div
          className="absolute inset-0 bg-white/96 rounded-2xl flex flex-col items-center justify-center z-10 p-4 gap-2"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
            <Trash2 size={18} className="text-red-600" />
          </div>
          <p className="text-sm font-bold text-gray-800">Delete this task?</p>
          <p className="text-xs text-gray-400 text-center">This cannot be undone.</p>
          <div className="flex gap-2 w-full mt-1">
            <button
              onClick={(e) => { e.stopPropagation(); setConfirmDelete(false); }}
              className="flex-1 px-3 py-1.5 text-xs text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteConfirm}
              disabled={deleting}
              className="flex-1 px-3 py-1.5 text-xs text-white bg-red-700 hover:bg-red-800 rounded-xl font-semibold transition-all disabled:opacity-60"
            >
              {deleting ? "Deleting..." : "Delete"}
            </button>
          </div>
        </div>
      )}

      {/* HEADER */}
      <div className="flex items-start justify-between gap-2 mb-2 pl-3">
        <h3 className="font-semibold text-gray-800 text-sm leading-snug flex-1 line-clamp-2">
          {task.title}
        </h3>

        {/* Delete button — visible on hover */}
        <button
          onClick={(e) => { e.stopPropagation(); setConfirmDelete(true); }}
          className="opacity-0 group-hover:opacity-100 p-1 rounded-lg text-gray-300 hover:text-red-600 hover:bg-red-50 transition-all shrink-0 -mt-0.5"
          title="Delete task"
        >
          <Trash2 size={14} />
        </button>
      </div>

      {/* DESCRIPTION */}
      {task.description && (
        <p className="text-xs text-gray-400 pl-3 mb-3 line-clamp-2">{task.description}</p>
      )}

      {/* BADGES ROW */}
      <div className="pl-3 flex flex-wrap items-center gap-2 mb-3">
        {/* Status badge */}
        <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${statusStyles[task.status]}`}>
          {task.status}
        </span>

        {/* Priority badge */}
        {task.priority && (
          <span className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${priorityStyles[task.priority] || priorityStyles.Medium}`}>
            <Flag size={10} />
            {task.priority}
          </span>
        )}

        {/* Overdue badge */}
        {isOverdue && (
          <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-medium">
            Overdue
          </span>
        )}
      </div>

      {/* FOOTER */}
      <div className="pl-3 flex items-center justify-between">
        {/* Due date */}
        {task.dueDate ? (
          <div className={`flex items-center gap-1 text-xs ${isOverdue ? "text-red-500 font-medium" : "text-gray-400"}`}>
            <Calendar size={12} />
            <span>{new Date(task.dueDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>
          </div>
        ) : (
          <span className="text-xs text-gray-300">No due date</span>
        )}

        {/* Cycle status button */}
        {task.status !== "Done" && (
          <button
            onClick={(e) => { e.stopPropagation(); onStatusChange?.(); }}
            className="flex items-center gap-1 text-xs text-red-600 hover:text-red-800 hover:bg-red-50 px-2 py-1 rounded-lg font-medium transition-all opacity-0 group-hover:opacity-100"
          >
            {task.status === "To Do" ? "Start" : "Complete"}
            <ArrowRight size={11} />
          </button>
        )}
      </div>
    </div>
  );
}
