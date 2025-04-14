import { Navigate, Route, Routes, BrowserRouter } from "react-router-dom";
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

    

            <Route
              path="/admin"
              element={
                <AuthGuard requireAuth onlyAdmin requireVerified>
                  <AdminLayout />
                </AuthGuard>
              }
            >
               <Route path="" element={<AdminHome/>}/>
              <Route path="dashboard" element={<AdminDashboard/>}/>
              <Route path="category" element={<CategoryManagement/>}/>
              <Route path="users" element={<UserManagement/>} />


            </Route>
          </Routes>
        </BrowserRouter>
      </div>
    </HeroUIProvider>
  );
}

export default App;
