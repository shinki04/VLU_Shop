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
  useDisclosure,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Divider,
  Image,
  Chip,
} from "@heroui/react";
import CustomInputPass from "../CustomInputPass";
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
    phone: "",
    address: "",
    password: "",
  });

  const baseUrl =
    import.meta.env.NODE_ENV === "production" ? "" : "http://localhost:3000";

  const getCurrent = async () => {
    await getUserDetails(user._id)
  };

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || "",
        email: user.email || "",
        phone: user.phone || "",
        address: user.address || "",
        password: "",
      });
      setImagePreview(user.image ? `${baseUrl}${user.image}` : null);
      getCurrent();
    }
  }, [user, baseUrl, imagePreview]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrorMess("Kích thước ảnh không được vượt quá 5MB");
        return;
      }
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
      try {
        const imageUrl = await uploadImage(file);
        await updateProfile({ image: imageUrl });
        toastCustom({
          title: "Thành công",
          description: "Ảnh đại diện đã thay đổi",
        });
      } catch (err) {
        setErrorMess(err.message || "Có lỗi upload ảnh");
      }
    }
  };

  useEffect(() => {
    if (error || errorMess) {
      onOpen();
    }
  }, [error, errorMess, onOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMess("");

    try {
      // Kiểm tra các trường bắt buộc
      if (!formData.username.trim()) {
        setErrorMess("Tên người dùng không được để trống");
        return;
      }

      if (!formData.email.trim()) {
        setErrorMess("Email không được để trống");
        return;
      }

      // Kiểm tra định dạng email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        setErrorMess("Email không hợp lệ");
        return;
      }

      let imageUrl = user?.image || "";
      if (image) {
        imageUrl = await uploadImage(image);
      }
      console.log(formData);
      const res = await updateProfile({ formData, image: imageUrl });
      console.log(res);
      toastCustom({
        title: "Thành công",
        description: "Cập nhật thông tin thành công",
      });
      onOpenChange(false);
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
        <Card className="max-w-3xl ">
          <CardHeader className="flex flex-col gap-3">
            <div className="flex justify-center">
              <Image
                alt="User Image"
                radius="sm"
                src={imagePreview || "/default-avatar.png"}
                width={400}
                isBlurred
                isZoomed
                loading="eager"
                // className="border-none bg-background/60 dark:bg-default-100/50"
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
            <div className="flex flex-col items-center">
              <p className="text-xl font-bold">{user?.username}</p>
              <p className="text-sm text-default-500">{user?.email}</p>
            </div>
          </CardHeader>
          <Divider />
          <CardBody>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-semibold">Số điện thoại</p>
                <p className="text-sm">{user?.phone || "Chưa cập nhật"}</p>
              </div>
              <div>
                <p className="text-sm font-semibold">Địa chỉ</p>
                <p className="text-sm">{user?.address || "Chưa cập nhật"}</p>
              </div>
              <div>
                <p className="text-sm font-semibold">Trạng thái xác thực</p>
                <Chip
                  color={user?.isVerified ? "success" : "warning"}
                  size="sm"
                  variant="flat"
                >
                  {user?.isVerified ? "Đã xác thực" : "Chưa xác thực"}
                </Chip>
              </div>
            </div>
          </CardBody>
          <Divider />
          <CardFooter>
            <Button color="primary" onPress={setUpdateModalOpen}>
              Cập nhật thông tin
            </Button>
          </CardFooter>
        </Card>
      </div>

      <Modal
        isOpen={updateModalOpen}
        onClose={() => setUpdateModalOpen(false)}
        // onOpenChange={onOpenChange}
      >
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
                  value={formData.email}
                  onChange={handleChange}
                  isRequired
                />

                {/* <Input
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
                /> */}

                {/* <CustomInputPass
                  label="Nhập lại mật khẩu"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  labelPlacement="inside"
                /> */}
              </div>
            </ModalBody>
            <ModalFooter>
              <Button
                color="danger"
                variant="light"
                onPress={() => onOpenChange(false)}
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
