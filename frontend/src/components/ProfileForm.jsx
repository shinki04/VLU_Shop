import React, { useState, useEffect } from "react";
import useUserStore from "../store/userStore";
import {
  Button,
  Input,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Divider,
  Image,
  useDisclosure,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/react";
import { toastCustom } from "../hooks/toastCustom";

const ProfileForm = () => {
  const { currentUser, updateProfile, uploadImage, isLoading } = useUserStore();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    phone: "",
    address: "",
  });
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (currentUser) {
      setFormData({
        username: currentUser.username || "",
        email: currentUser.email || "",
        phone: currentUser.phone || "",
        address: currentUser.address || "",
      });
      setImagePreview(currentUser.image || null);
    }
  }, [currentUser]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("Kích thước ảnh không được vượt quá 5MB");
        return;
      }
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      // Kiểm tra các trường bắt buộc
      if (!formData.username.trim()) {
        setError("Tên người dùng không được để trống");
        return;
      }

      if (!formData.email.trim()) {
        setError("Email không được để trống");
        return;
      }

      // Kiểm tra định dạng email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        setError("Email không hợp lệ");
        return;
      }

      let imageUrl = currentUser?.image || "";
      if (image) {
        imageUrl = await uploadImage(image);
      }

      await updateProfile({ ...formData, image: imageUrl });
      toastCustom({
        title: "Thành công",
        description: "Cập nhật thông tin thành công",
      });
      onOpenChange(false);
    } catch (err) {
      setError(err.message || "Có lỗi xảy ra khi cập nhật thông tin");
    }
  };

  return (
    <>
      <Card className="max-w-3xl mx-auto">
        <CardHeader className="flex flex-col gap-3">
          <div className="flex justify-center">
            <Image
              alt="User Image"
              radius="sm"
              src={imagePreview || "/default-avatar.png"}
              className="w-32 h-32 object-cover"
            />
          </div>
          <div className="flex flex-col items-center">
            <p className="text-xl font-bold">{currentUser?.username}</p>
            <p className="text-sm text-gray-500">{currentUser?.email}</p>
          </div>
        </CardHeader>
        <Divider />
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-semibold">Số điện thoại</p>
              <p className="text-sm">{currentUser?.phone || "Chưa cập nhật"}</p>
            </div>
            <div>
              <p className="text-sm font-semibold">Địa chỉ</p>
              <p className="text-sm">{currentUser?.address || "Chưa cập nhật"}</p>
            </div>
          </div>
        </CardBody>
        <Divider />
        <CardFooter>
          <Button color="primary" onPress={onOpen}>
            Cập nhật thông tin
          </Button>
        </CardFooter>
      </Card>

      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          <form onSubmit={handleSubmit}>
            <ModalHeader>Cập nhật thông tin cá nhân</ModalHeader>
            <ModalBody>
              {error && (
                <div className="text-red-500 text-sm mb-4">{error}</div>
              )}

              <div className="space-y-4">
                <div className="flex justify-center">
                  <Image
                    alt="User Image"
                    radius="sm"
                    src={imagePreview || "/default-avatar.png"}
                    className="w-24 h-24 object-cover"
                  />
                </div>
                <div className="flex justify-center">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className="text-sm text-blue-500 cursor-pointer hover:text-blue-700"
                  >
                    Thay đổi ảnh đại diện
                  </label>
                </div>

                <Input
                  label="Tên người dùng"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                />

                <Input
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />

                <Input
                  label="Số điện thoại"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                />

                <Input
                  label="Địa chỉ"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                />
              </div>
            </ModalBody>
            <ModalFooter>
              <Button color="danger" variant="light" onPress={() => onOpenChange(false)}>
                Hủy
              </Button>
              <Button color="primary" type="submit" isLoading={isLoading}>
                Cập nhật
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
    </>
  );
};

export default ProfileForm;