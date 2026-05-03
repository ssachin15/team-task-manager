// Role hierarchy (higher roles inherit permissions of lower roles)
const ROLE_HIERARCHY = {
  'Admin': 3,
  'Owner': 2,
  'Member': 1
};

// Available roles
export const ROLES = {
  ADMIN: 'Admin',
  OWNER: 'Owner',
  MEMBER: 'Member'
};

// Check if user has required role or higher
export function hasRole(userRole, requiredRole) {
  if (!userRole || !requiredRole) return false;
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}

// Check if user is Admin
export function isAdmin(userRole) {
  return userRole === ROLES.ADMIN;
}

// Check if user is Owner or above
export function isOwnerOrAbove(userRole) {
  return hasRole(userRole, ROLES.OWNER);
}

// Check if user can manage project (Owner or Admin)
export function canManageProject(userRole) {
  return hasRole(userRole, ROLES.OWNER);
}

// Check if user can delete project (Admin only)
export function canDeleteProject(userRole) {
  return isAdmin(userRole);
}

// Check if user can add/remove members (Owner or Admin)
export function canManageMembers(userRole) {
  return hasRole(userRole, ROLES.OWNER);
}

// Check if user can create tasks (any authenticated user)
export function canCreateTask(userRole) {
  return !!userRole;
}

// Check if user can edit/delete task (Admin or task creator)
export function canModifyTask(userRole, taskCreatorId, currentUserId) {
  return isAdmin(userRole) || taskCreatorId === currentUserId;
}

// Get role badge color
export function getRoleBadgeColor(role) {
  switch (role) {
    case ROLES.ADMIN: return 'bg-red-100 text-red-800';
    case ROLES.OWNER: return 'bg-blue-100 text-blue-800';
    case ROLES.MEMBER: return 'bg-gray-100 text-gray-800';
    default: return 'bg-gray-100 text-gray-800';
  }
}
