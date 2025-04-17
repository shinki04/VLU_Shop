import { Navigate, Route, Routes, BrowserRouter } from "react-router-dom";
import { useEffect } from "react";
import { HeroUIProvider } from "@heroui/react";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/Auth/LoginPage";
import RegisterPage from "./pages/Auth/RegisterPage";
import { EmailVerificationPage } from "./pages/Auth/EmailVerificationPage";
import { ToastProvider } from "@heroui/toast";
import { ForgotPasswordPage } from "./pages/Auth/ForgotPasswordPage";
import ResetPasswordPage from "./pages/Auth/ResetPasswordPage";

import AuthGuard from "./components/Auth/AuthGuard";
import AdminLayout from "./pages/Admin/AdminLayout";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import CategoryManagement from "./pages/Admin/CategoryManagement";
import AdminHome from "./pages/Admin/AdminHome";
import UserManagement from "./pages/Admin/UserManagement";
import NotFound from "./pages/NotFound";
import ProductManagement from "./pages/Admin/ProductManagement";
import ReviewManagement from "./pages/Admin/reviewManagement";
import { Rotate3D } from "lucide-react";
// redirect authenticated users to the home page
// const RedirectAuthenticatedUser = ({ children }) => {
// 	const { isAuthenticated, user } = useAuthStore();

// 	if (isAuthenticated && user.isVerified) {
// 		return <Navigate to='/' replace />;
// 	}

// 	return children;
// };

function App() {
  useEffect(() => {
    const updateViewportHeight = () => {
      const vh = window.visualViewport?.height ?? window.innerHeight;
      document.documentElement.style.setProperty(
        "--visual-viewport-height",
        `${vh}px`
      );
    };

    updateViewportHeight();
    window.visualViewport?.addEventListener("resize", updateViewportHeight);
    window.addEventListener("resize", updateViewportHeight);

    return () => {
      window.visualViewport?.removeEventListener(
        "resize",
        updateViewportHeight
      );
      window.removeEventListener("resize", updateViewportHeight);
    };
  }, []);
  return (
    <HeroUIProvider>
      <ToastProvider placement="top-right" />
      <div className="h-[var(--visual-viewport-height)]  min-h-screen container mx-auto">
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/verify-email" element={<EmailVerificationPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route
              path="/reset-password/:token"
              element={<ResetPasswordPage />}
            />
            {/* <Route path="/logout" element={<LogoutPage />} /> */}

            <Route
              path="/admin"
              element={
                <AuthGuard requireAuth onlyAdmin requireVerified>
                  <AdminLayout />
                </AuthGuard>
              }
            >
              <Route path="" element={<AdminHome />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="category" element={<CategoryManagement />} />
              <Route path="users" element={<UserManagement />} />
              <Route path="products" element={<ProductManagement />} />
              <Route path="reviews" element={<ReviewManagement />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </div>
    </HeroUIProvider>
  );
}

export default App;
