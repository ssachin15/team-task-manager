import { useAuth } from "../context/AuthContext";
import {
  hasRole,
  isAdmin,
  isOwnerOrAbove,
  canManageProject,
  canDeleteProject,
  canManageMembers,
  canCreateTask,
  canModifyTask,
  getRoleBadgeColor,
  ROLES
} from "../utils/rbac";

export function useRBAC() {
  const { user } = useAuth();
  const userRole = user?.role;

  return {
    // Role checks
    userRole,
    isAdmin: isAdmin(userRole),
    isOwnerOrAbove: isOwnerOrAbove(userRole),
    
    // Permission checks
    hasRole: (requiredRole) => hasRole(userRole, requiredRole),
    canManageProject: canManageProject(userRole),
    canDeleteProject: canDeleteProject(userRole),
    canManageMembers: canManageMembers(userRole),
    canCreateTask: canCreateTask(userRole),
    canModifyTask: (taskCreatorId) => canModifyTask(userRole, taskCreatorId, user?._id),
    
    // Helpers
    getRoleBadgeColor: () => getRoleBadgeColor(userRole),
    ROLES
  };
}
