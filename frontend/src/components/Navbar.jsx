import { NavLink } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">

        {/* LOGO */}
        <div className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          TaskFlow
        </div>

        {/* NAV LINKS */}
        <div className="flex items-center gap-6">

          <NavItem to="/" label="Dashboard" />
          <NavItem to="/projects" label="Projects" />
          <NavItem to="/login" label="Login" />

          {/* USER AVATAR (fake for now) */}
          <div className="ml-4">
            <div className="w-9 h-9 rounded-full bg-indigo-600 text-white flex items-center justify-center font-semibold shadow-sm">
              S
            </div>
          </div>

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
