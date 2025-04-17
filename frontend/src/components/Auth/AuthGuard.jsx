import useUserStore from "../../store/userStore";
import { useNavigate } from "react-router-dom";
import {
  Modal,
  ModalHeader,
  ModalContent,
  ModalBody,
  ModalFooter,
  Button,
  useDisclosure,
} from "@heroui/react";
import { useEffect, useState } from "react";

export default function AuthGuard({
  children,
  requireAuth = false,
  requireVerified = false,
  onlyAdmin = false,
  redirectTo = "/login",
}) {
  const { isAuthenticated, user } = useUserStore();
  const navigate = useNavigate();

  // State để xác định loại modal nào sẽ hiển thị
  const [modalType, setModalType] = useState(null); // 'login' | 'verify' | 'admin'
  const { isOpen, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    // Kiểm tra từng điều kiện theo thứ tự ưu tiên
    if (requireAuth && !isAuthenticated) {
      setModalType("login");
      onOpen();
    } else if (requireVerified && isAuthenticated && user && !user.isVerified) {
      setModalType("verify");
      onOpen();
    } else if (onlyAdmin && isAuthenticated && user && user.role !== "admin") {
      setModalType("admin");
      onOpen();
    }
  }, [requireAuth, requireVerified, onlyAdmin, isAuthenticated, user, onOpen]);

  const handleConfirm = () => {
    onClose();
    if (modalType === "login") {
      navigate(redirectTo);
    } else if (modalType === "verify") {
      navigate("/verify-email");
    } else if (modalType === "admin") {
      navigate("/");
    }
  };

  if (modalType) {
    return (
      <Modal isOpen={isOpen} onOpenChange={onClose} backdrop="blur">
        <ModalContent>
          <ModalHeader>
            {modalType === "login"
              ? "Yêu cầu đăng nhập"
              : modalType === "verify"
              ? "Xác minh tài khoản"
              : "Quyền truy cập bị từ chối"}
          </ModalHeader>
          <ModalBody>
            {modalType === "login" && <p>Bạn cần đăng nhập để truy cập trang này.</p>}
            {modalType === "verify" && <p>Vui lòng xác minh email để tiếp tục.</p>}
            {modalType === "admin" && <p>Bạn không có quyền truy cập trang này.</p>}
          </ModalBody>
          <ModalFooter>
            {/* <Button color="danger" variant="light" onPress={onClose}>
              Hủy
            </Button> */}
            <Button color="primary" onPress={handleConfirm}>
              OK
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    );
  }

  return children;
}
