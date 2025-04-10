// src/components/Auth/AuthGuard.jsx
import { useAuthStore } from "../../store/authStore";
import { useRedirectWithModal } from "../../hooks/useRedirectWithModal";
import { Modal } from "@heroui/react";

export default function AuthGuard({
  children,
  requireAuth = false,
  requireVerified = false,
  onlyAdmin = false,
  redirectTo = "/login"
}) {
  const { isAuthenticated, user } = useAuthStore();
  const { showModal, redirect, confirm, cancel } = useRedirectWithModal();

  if (requireAuth && !isAuthenticated) {
    if (!showModal) redirect(redirectTo);

    return (
      <>
        {showModal && (
          <Modal open title="Thông báo" onClose={cancel}>
            <p className="mb-4">Bạn cần đăng nhập để tiếp tục.</p>
            <div className="flex justify-end gap-3">
              <button
                className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
                onClick={cancel}
              >
                Hủy
              </button>
              <button
                className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
                onClick={confirm}
              >
                OK
              </button>
            </div>
          </Modal>
        )}
      </>
    );
  }

  if (requireVerified && !user?.isVerified) {
    return <Navigate to="/verify-email" replace />;
  }

  if (onlyAdmin && user?.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return children;
}
