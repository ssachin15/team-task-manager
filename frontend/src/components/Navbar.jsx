import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useRBAC } from "../hooks/useRBAC";
import { LogOut } from "lucide-react";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { getRoleBadgeColor, ROLES } = useRBAC();

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">

        {/* LOGO */}
        <div className="text-xl font-bold bg-gradient-to-r from-red-600 to-red-800 bg-clip-text text-transparent">
          TaskFlow
        </div>

        {/* NAV LINKS */}
        <div className="flex items-center gap-6">

          <NavItem to="/" label="Dashboard" />
          <NavItem to="/projects" label="Projects" />
          
          {user ? (
            <div className="ml-4 flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-full bg-red-600 text-white flex items-center justify-center font-semibold shadow-sm">
                  {user.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-gray-700">{user.name}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getRoleBadgeColor()}`}>
                    {user.role || ROLES.MEMBER}
                  </span>
                </div>
              </div>
              <button
                onClick={logout}
                className="flex items-center gap-1 text-sm text-gray-500 hover:text-red-600 transition-colors"
                title="Logout"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <NavItem to="/login" label="Login" />
          )}

        </div>
      </div>
    </nav>
  );
}

/* 🔹 Reusable Nav Item */
function NavItem({ to, label }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `text-sm font-medium transition relative ${
          isActive
            ? "text-indigo-600"
            : "text-gray-500 hover:text-gray-900"
        }`
      }
    >
      {({ isActive }) => (
        <span className="relative">
          {label}

          {/* Active underline */}
          {isActive && (
            <span className="absolute left-0 -bottom-2 w-full h-[2px] bg-indigo-600 rounded-full" />
          )}
        </span>
      )}
    </NavLink>
  );
}
