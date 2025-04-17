import React from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from "@heroui/react";

export default function DeleteModal({
  isOpen,
  onOpenChange,
  onDelete,
  itemName,
}) {
  const handleClose = () => {
    onOpenChange(false); // Đóng modal
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} backdrop="blur">
      <ModalContent>
        <ModalHeader>Xác nhận xóa</ModalHeader>
        <ModalBody>
          <p>
            Bạn có chắc muốn xóa <strong>{itemName ? itemName : ""}</strong> không?

          </p>
        </ModalBody>
        <ModalFooter>
          <Button variant="flat" onPress={handleClose}>
            Hủy
          </Button>
          <Button color="danger" onPress={() => onDelete && onDelete()}>
            Xóa
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
