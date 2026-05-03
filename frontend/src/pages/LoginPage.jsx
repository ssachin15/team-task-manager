import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, AlertCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate("/");
    } catch (err) {
      setError(
        err?.response?.data?.message || "Login failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50">

      {/* LEFT SIDE */}
      <div className="hidden md:flex w-1/2 bg-gradient-to-br from-red-900 via-red-800 to-red-700 text-white flex-col justify-between p-12">
        <h1 className="text-3xl font-bold tracking-wide">TaskFlow</h1>

        <div>
          <h2 className="text-4xl font-semibold leading-tight">
            Manage your work. <br /> Stay focused.
          </h2>
          <p className="mt-4 text-red-100 max-w-md">
            A smarter way to organize projects, track progress, and stay productive every day.
          </p>
        </div>

        <p className="text-sm text-red-200">© 2026 TaskFlow</p>
      </div>

      {/* RIGHT SIDE */}
      <div className="flex w-full md:w-1/2 items-center justify-center px-6">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-md backdrop-blur-xl bg-white/70 border border-white/40 p-8 rounded-3xl shadow-xl"
        >
          {/* HEADER */}
          <h2 className="text-2xl font-semibold mb-2 text-gray-900">
            Welcome back 👋
          </h2>
          <p className="text-gray-500 mb-6 text-sm">Please login to continue</p>

          {/* ERROR */}
          {error && (
            <div className="flex items-center gap-2 mb-5 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              <AlertCircle size={16} className="shrink-0" />
              {error}
            </div>
          )}

          {/* EMAIL */}
          <div className="mb-4">
            <label className="text-sm text-gray-600">Email</label>
            <div className="flex items-center mt-1 border border-gray-200 rounded-lg px-3 focus-within:ring-2 focus-within:ring-red-500 transition">
              <Mail size={16} className="text-gray-400" />
              <input
                type="email"
                placeholder="you@example.com"
                required
                className="w-full p-3 bg-transparent focus:outline-none"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
          </div>

          {/* PASSWORD */}
          <div className="mb-6">
            <label className="text-sm text-gray-600">Password</label>
            <div className="flex items-center mt-1 border border-gray-200 rounded-lg px-3 focus-within:ring-2 focus-within:ring-red-500 transition">
              <Lock size={16} className="text-gray-400" />
                <input
                  type="password"
                  placeholder="••••••••"
                  required
                  autocomplete="current-password"
                  className="w-full p-3 bg-transparent focus:outline-none"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
            </div>
          </div>

          {/* BUTTON */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-700 text-white py-3 rounded-lg font-medium hover:bg-red-800 active:scale-[0.98] transition shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Logging in..." : "Login"}
          </button>

          {/* FOOTER */}
          <p className="text-sm text-gray-500 mt-6 text-center">
            Don't have an account?{" "}
            <Link to="/signup" className="text-red-700 hover:underline font-medium">
              Sign up
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
