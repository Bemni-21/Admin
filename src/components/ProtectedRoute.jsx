import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";

// Check if user has been inactive for more than 5 minutes
const isInactive = () => {
  const lastActivity = localStorage.getItem('last_activity');
  if (!lastActivity) return true;
  
  const now = Date.now();
  const inactiveTime = now - parseInt(lastActivity);
  const INACTIVITY_LIMIT = 5 * 60 * 1000; // 5 minutes
  
  return inactiveTime >= INACTIVITY_LIMIT;
};

export default function ProtectedRoute({ children }) {
  const { access_token, logout } = useAuthStore();
  
  // If no token, redirect to login
  if (!access_token) {
    return <Navigate to="/login" replace />;
  }
  
  // Check if user has been inactive for more than 5 minutes
  if (isInactive()) {
    // Clear session due to inactivity
    logout();
    localStorage.removeItem('last_activity');
    return <Navigate to="/login" replace />;
  }
  
  // Update last activity when accessing protected route
  localStorage.setItem('last_activity', Date.now().toString());
  
  // Token exists and user is active, allow access
  return children;
}