import { useAuthStore } from "../../store/authStore";
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
import { useEffect } from "react";

export default function AuthGuard({
  children,
  requireAuth = false,
  requireVerified = false,
  onlyAdmin = false,
  redirectTo = "/login",
}) {
  const { isAuthenticated, user } = useAuthStore();
  const navigate = useNavigate();
  const { isOpen, onOpen, onClose } = useDisclosure();

  // Nếu cần đăng nhập nhưng chưa đăng nhập, mở modal
  useEffect(() => {
    if (requireAuth && !isAuthenticated) {
      onOpen();
    }
  }, [requireAuth, isAuthenticated, onOpen]);

  const handleConfirm = () => {
    onClose(); // đóng modal trước
    navigate(redirectTo); // điều hướng
  };

  // Nếu chưa đăng nhập, chỉ hiện modal và không hiển thị children
  if (requireAuth && !isAuthenticated) {
    return (
      <>
        <Modal
          isOpen={isOpen}
          onOpenChange={onClose}
          backdrop="blur"
        >
          <ModalContent>
            <ModalHeader>Yêu cầu đăng nhập</ModalHeader>
            <ModalBody>
              <p>Bạn cần đăng nhập để truy cập trang này.</p>
            </ModalBody>
            <ModalFooter>
              <Button  color="danger" variant="light" onPress={onClose}>
                Hủy
              </Button>
              <Button color="primary" onPress={handleConfirm}>
                OK
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </>
    );
  }

  // Nếu yêu cầu xác minh email nhưng user chưa xác minh
  if (requireVerified && !user?.isVerified) {
    return navigate("/verify-email");
  }

  // Nếu chỉ cho admin nhưng user không phải admin
  if (onlyAdmin && user?.role !== "admin") {
    return navigate("/");
  }

  return children;
}
