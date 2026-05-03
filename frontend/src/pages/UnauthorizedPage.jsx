import { useNavigate } from "react-router-dom";
import { ShieldX, ArrowLeft, Home } from "lucide-react";

export default function UnauthorizedPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <ShieldX size={40} className="text-red-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-500">
            You don't have permission to access this page. Contact your administrator if you believe this is an error.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center gap-2 px-5 py-2.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-medium"
          >
            <ArrowLeft size={16} />
            Go Back
          </button>
          <button
            onClick={() => navigate("/")}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-red-700 text-white rounded-xl hover:bg-red-800 transition-all font-medium"
          >
            <Home size={16} />
            Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
