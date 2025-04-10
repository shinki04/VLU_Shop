import { Navigate, Route, Routes, BrowserRouter } from "react-router-dom";
import { HeroUIProvider } from "@heroui/react";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import { EmailVerificationPage } from "./pages/EmailVerificationPage";
import { useAuthStore } from "./store/authStore";
import { ToastProvider } from "@heroui/toast";
import { ForgotPasswordPage } from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import ProtectedRoute from "./components/Auth/ProtectedRoute";
import RedirectAuthenticatedAdmin from "./components/Auth/RedirectAuthenticatedAdmin";
import AuthGuard from "./components/Auth/AuthGuard";
import AdminLayout from "./pages/Admin/AdminLayout";
// redirect authenticated users to the home page
// const RedirectAuthenticatedUser = ({ children }) => {
// 	const { isAuthenticated, user } = useAuthStore();

// 	if (isAuthenticated && user.isVerified) {
// 		return <Navigate to='/' replace />;
// 	}

// 	return children;
// };

function App() {
  return (
    <HeroUIProvider>
      <ToastProvider placement="top-right" />
      <div className="container mx-auto">
        <BrowserRouter>
          <Routes>
            <Route
              path="/"
              element={
                // <ProtectedRoute>
                <HomePage />
                // </ProtectedRoute>
              }
            />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/verify-email" element={<EmailVerificationPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route
              path="/reset-password/:token"
              element={<ResetPasswordPage />}
            />
            {/* <Route path="/logout" element={<LogoutPage />} /> */}

            <AuthGuard requireAuth onlyAdmin requireVerified>
              <Route path="/admin" element={<AdminLayout />}></Route>
            </AuthGuard>
          </Routes>
        </BrowserRouter>
      </div>
    </HeroUIProvider>
  );
}

export default App;
