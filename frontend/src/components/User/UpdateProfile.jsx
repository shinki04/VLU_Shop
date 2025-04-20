import React, { useState, useEffect } from "react";
import useUserStore from "../../store/userStore";
import {
  Button,
  Input,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Divider,
  Image,
  useDisclosure,
  Chip,
} from "@heroui/react";
import { toastCustom } from "../../hooks/toastCustom";
import CustomModal from "../../components/Modal/CustomModal.jsx";

const UpdateProfile = () => {
  const [errorMess, setErrorMess] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const { user, updateProfile, isLoading, error, uploadImage, getUserDetails } =
    useUserStore();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
  });

  const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";

  const getCurrent = async () => {
    await getUserDetails(user._id);
  };
  console.log("user", `${baseUrl}${user.image}`);

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || "",
        phone: user.phone || "",
      });
      if (!image) {
        setImagePreview(user.image ? `${baseUrl}${user.image}` : null);
      }
      getCurrent();
    }
  }, [user, baseUrl]);

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
        setErrorMess("Kích thước ảnh không được vượt quá 5MB");
        return;
      }
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  useEffect(() => {
    if (error || errorMess) {
      onOpen();
    }
  }, [error, errorMess, onOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (!formData.username.trim()) {
        setErrorMess("Tên người dùng không được để trống");
        return;
      }

      if (!formData.phone.trim()) {
        setErrorMess("Phone không được để trống");
        return;
      }

      let imageUrl = user?.image || "";
      if (image) {
        imageUrl = await uploadImage(image);
        if (!imageUrl) {
          throw new Error("Không thể upload ảnh");
        }
      }

      const profileData = {
        username: formData.username,
        phone: formData.phone,
        image: imageUrl,
      };

      console.log("Submitting profile data:", profileData);
      await updateProfile(profileData);
      // console.log("Update response:", res);

      toastCustom({
        title: "Thành công",
        description: "Cập nhật thông tin thành công",
      });
      setUpdateModalOpen(false);
    } catch (err) {
      setErrorMess(err.message || "Có lỗi xảy ra khi cập nhật thông tin");
    }
  };

  return (
    <>
      <CustomModal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        title="Oops!"
        message={error || errorMess}
      />
      <div className="flex justify-center">
        <Card className="max-w-3xl">
          <CardHeader className="flex flex-col gap-3">
            <div className="flex justify-center">
              <Image
                alt="User Image"
                radius="sm"
                src={imagePreview || "/default-avatar.png"}
                width={400}
                isBlurred
                isZoomed
                className="z-50 opacity-100"
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
              {/* <label
                htmlFor="image-upload"
                className="text-sm text-blue-500 cursor-pointer hover:text-blue-700"
              >
                Thay đổi ảnh đại diện
              </label> */}
            </div>
            <div className="flex flex-col items-center">
              <p className="text-xl font-bold">{user?.username}</p>
              <p className="text-sm text-default-500">{user?.email}</p>
            </div>
          </CardHeader>
          <Divider />
          <CardBody>
            <div className="flex flex-col gap-4 justify-center leading-normal	">
              <div className="flex flex-col my-3 items-center">
                <p className="text-sm font-semibold py-1">
                  Trạng thái xác thực
                </p>
                <Chip
                  color={user?.isVerified ? "success" : "warning"}
                  size="sm"
                  variant="flat"
                >
                  {user?.isVerified ? "Đã xác thực" : "Chưa xác thực"}
                </Chip>
                <div className="flex flex-col my-3 items-center">
                  <p className="text-sm font-semibold py-1">"Số điện thoại</p>
                  <p className="text-sm">{user?.phone || "Chưa cập nhật"}</p>
                </div>
              </div>
            </div>
          </CardBody>
          <Divider />
          <CardFooter>
            <Button
              color="primary"
              className="w-full"
              onPress={() => setUpdateModalOpen(true)}
            >
              Cập nhật thông tin
            </Button>
          </CardFooter>
        </Card>
      </div>

      <Modal isOpen={updateModalOpen} onClose={() => setUpdateModalOpen(false)}>
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
                    id="image-upload-modal"
                  />
                  <label
                    htmlFor="image-upload-modal"
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
                  isRequired
                />

                <Input
                  label="Email"
                  name="email"
                  type="email"
                  value={user?.email}
                  isReadOnly
                  isDisabled
                />
                <Input
                  label="Số điện thoại"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
            </ModalBody>
            <ModalFooter>
              <Button
                color="danger"
                variant="light"
                onPress={() => setUpdateModalOpen(false)}
              >
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

export default UpdateProfile;
