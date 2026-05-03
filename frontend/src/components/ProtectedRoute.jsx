import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { hasRole } from "../utils/rbac";

export default function ProtectedRoute({ children, requiredRole }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && !hasRole(user.role, requiredRole)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}
