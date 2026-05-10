import { useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { useNavigate } from "react-router-dom";
import { authApi } from "@/services/Api";
import { LogOut } from "lucide-react";

export default function Logout() {
  const { access_token, logout } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    const performLogout = async () => {
      try {
        // Call API to invalidate token on server
        if (access_token) {
          await authApi.signOut(access_token);
        }
      } catch (error) {
        console.error("Logout API error:", error);
        // Still logout locally even if API fails
      } finally {
        // Clear store state
        logout();
        // Redirect to login page after a short delay
        setTimeout(() => {
          navigate('/login');
        }, 1500);
      }
    };

    performLogout();
  }, [access_token, logout, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center max-w-md p-8">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <LogOut className="w-10 h-10 text-red-600" />
        </div>
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">
          Logging out...
        </h1>
        <p className="text-gray-600 mb-6">
          Please wait while we securely log you out.
        </p>
        <div className="flex justify-center">
          <svg className="animate-spin h-8 w-8 text-gray-900" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        </div>
        <p className="mt-6 text-sm text-gray-400">
          You will be redirected to the login page.
        </p>
      </div>
    </div>
  );
}