import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from "@heroui/react";

const CustomModal = ({ isOpen, onOpenChange, title, message }) => {
  // Hàm đóng modal khi người dùng ấn nút "OK"
  const handleClose = () => {
    onOpenChange(false);  // Đóng modal
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} backdrop="blur">
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          {title || "Notification"}
        </ModalHeader>
        <ModalBody>
          <div className="text-sm p-2 text-red-500 font-medium">
            {message || "Have error"}
          </div>
        </ModalBody>
        <ModalFooter>
          {/* Khi người dùng ấn "OK", gọi handleClose */}
          <Button color="primary" variant="light" onPress={handleClose}>
            OK
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default CustomModal;
