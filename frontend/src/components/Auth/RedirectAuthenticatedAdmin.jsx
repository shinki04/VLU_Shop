import { Navigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";

const RedirectAuthenticatedAdmin = ({ children }) => {
  const { isAuthenticated, user } = useAuthStore();

  if (isAuthenticated && user?.isVerified && user?.role === "admin") {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default RedirectAuthenticatedAdmin;