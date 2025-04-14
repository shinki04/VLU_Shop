import useUserStore from "../../store/userStore";
import React, { useEffect, useState, useMemo } from "react";
import CustomModal from "../../components/CustomModal";
import {
  Spinner,
  Input,
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Image,
  Form,
  SelectItem,
  Select,
} from "@heroui/react";
import { toastCustom } from "../../hooks/toastCustom";
import { TableComponent } from "../../components/Table/Table";
import { TopContent } from "../../components/Table/TopContent";
import { debounce } from "lodash";

const columns = [
  { name: "STT", uid: "index" },
  { name: "Tên người dùng", uid: "username" },
  { name: "Avatar", uid: "image" },
  { name: "Email", uid: "email" },
  { name: "Role", uid: "role" },
  { name: "Xác thực", uid: "isVerified" },
  { name: "Action", uid: "actions" },
];

const INITIAL_VISIBLE_COLUMNS = [
  "index",
  "username",
  "image",
  "email",
  "role",
  "isVerified",
  "actions",
];

export default function UserManagement() {
  const {
    users,
    fetchUsers,
    searchUsersByKeyword,
    addUser,
    updateUser,
    deleteUser,
    isLoading,
    total,
    error,
    defaultImage,
    uploadImage,
    clearError,
  } = useUserStore();

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [visibleColumns, setVisibleColumns] = useState(
    new Set(INITIAL_VISIBLE_COLUMNS)
  );
  const [inputValue, setInputValue] = useState("");
  const [filterValue, setFilterValue] = useState("");
  const totalPages = useMemo(() => Math.ceil(total / limit), [total, limit]);

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  // Dữ liệu cho modal Thêm
  const [addUsername, setAddUsername] = useState("");
  const [addEmail, setAddEmail] = useState("");
  const [addPassword, setAddPassword] = useState("");
  const [addImage, setAddImage] = useState(null); // Thêm ảnh cho người dùng mới
  const [addRole, setAddRole] = useState("");
  const [addIsVerified, setAddIsVerified] = useState(false);

  // Dữ liệu cho modal Sửa
  const [editUsername, setEditUsername] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editImage, setEditImage] = useState(null); // Thêm ảnh cho người dùng khi sửa
  const [editRole, setEditRole] = useState("");
  const [editIsVerified, setEditIsVerified] = useState(false);

  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  // Hiển thị lỗi nếu có
  useEffect(() => {
    if (error) {
      onOpen();
      clearError();
    }
  }, [error, onOpen, clearError]);
  
  useEffect(() => {
    const fetchData = async () => {
      await fetchUsers(page, limit);
    };

    fetchData();
  }, []);
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (filterValue) {
          await searchUsersByKeyword(filterValue, page, limit);
        } else {
          await fetchUsers(page, limit);
        }
      } catch (err) {
        console.error("Error fetching users:", err);
      }
    };
    fetchData();
  }, [page, limit, filterValue]);

  const debouncedSetFilterValue = useMemo(
    () => debounce((value) => setFilterValue(value), 200),
    []
  );

  const handleInputChange = (value) => {
    setInputValue(value);
    debouncedSetFilterValue(value);
  };

  const handleAddUser = async () => {
    const imageUrl = !addImage
      ? await uploadImage(defaultImage)
      : await uploadImage(addImage);

    const newUser = {
      username: addUsername,
      email: addEmail,
      password: addPassword,
      role: addRole,
      image: imageUrl,
      isVerified: addIsVerified,
    };

    await addUser(newUser);

    toastCustom({
      title: "Successfully",
      description: "User added successfully!",
    });

    setAddModalOpen(false);
    setAddUsername("");
    setAddEmail("");
    setAddRole("");
    setAddIsVerified(false);
    setAddPassword("");
    setAddImage(null); // Reset ảnh sau khi thêm

    // Refresh danh sách người dùng
    await fetchUsers(page, limit);
  };

  const handleUpdateUser = async () => {
    if (selectedItem) {
      try {
        // Giữ lại URL cũ nếu không thay đổi
        let imageUrl = selectedItem.image;

        // Bước 1: upload ảnh nếu có
        if (editImage !== selectedItem.image) {
          imageUrl = await uploadImage(editImage);
        } else {
          imageUrl = selectedItem.image; // Keep old URL if no new image
        }

        const updated = {
          // ...selectedItem,
          _id: selectedItem._id,
          username: editUsername,
          role: editRole,
          image: imageUrl,
          isVerified: editIsVerified,
        };
        await updateUser(updated);

        toastCustom({
          title: "Successfully",
          description: "User updated successfully!",
        });

        setEditModalOpen(false);
        setEditUsername("");
        setEditEmail("");
        setEditImage(null); // Reset ảnh sau khi cập nhật

        // Refresh danh sách người dùng
        await fetchUsers(page, limit);
      } catch (err) {
        toastCustom({
          title: "Error",
          error: err.message || "Error updating user",
        });
      }
    } else {
      toastCustom({
        title: "No user",
        error: "Error updating user",
      });
    }
  };

  const handleDeleteUser = async () => {
    try {
      await deleteUser(selectedItem._id);

      toastCustom({
        title: "Successfully",
        description: "User deleted successfully!",
      });

      setDeleteModalOpen(false);

      // Refresh danh sách người dùng
      await fetchUsers(page, limit);
    } catch (err) {
      toastCustom({
        error: err.message || "Error deleting user",
      });
    }
  };

  return (
    <div className="">
      <CustomModal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        title="Oops!"
        message={error}
      />
      {/* Modal cho "Thêm" */}
      <Modal isOpen={addModalOpen} onClose={() => setAddModalOpen(false)}>
        <ModalContent>
          <ModalHeader>Thêm người dùng</ModalHeader>
          <ModalBody>
            <Input
              label="Tên người dùng"
              value={addUsername}
              onChange={(e) => setAddUsername(e.target.value)}
              placeholder="Nhập tên người dùng"
            />
            <Input
              label="Email"
              value={addEmail}
              onChange={(e) => setAddEmail(e.target.value)}
              placeholder="Nhập email"
            />
            <Input
              label="Mật khẩu"
              value={addPassword}
              onChange={(e) => setAddPassword(e.target.value)}
              placeholder="Nhập mật khẩu"
              type="password"
            />
            <Input
              label="Ảnh người dùng"
              type="file"
              onChange={(e) => setAddImage(e.target.files[0])}
            />
          </ModalBody>
          <ModalFooter>
            <Button variant="flat" onPress={() => setAddModalOpen(false)}>
              Hủy
            </Button>
            <Button color="primary" onPress={handleAddUser}>
              Lưu
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Modal cho "Sửa" */}
      <Modal
        size={"3xl"}
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
      >
        <ModalContent>
          <ModalHeader id="editUser">
            <p className="flex flex-col gap-1 leading-relaxed">
              Chỉnh sửa người dùng
            </p>
          </ModalHeader>
          <ModalBody>
            <div className="flex flex-col md:flex-row gap-8 w-full">
              <div className="md:flex md:basis-5/12 w-full items-center">
                <Image
                  alt="User Image"
                  src={`${import.meta.env.DEV ? "http://localhost:3000" : ""}${
                    Array.isArray(editImage) ? editImage[0] : editImage
                  }`}
                  isZoomed
                  className="block w-full h-auto object-cover "
                  loading="lazy"
                />
              </div>
              <div className="md:basis-7/12 w-full">
                <Form encType="multipart/form-data" className="space-y-4">
                  <Input
                    isRequired
                    label="Tên người dùng"
                    id="userName"
                    value={editUsername}
                    onChange={(e) => setEditUsername(e.target.value)}
                    placeholder="Nhập tên người dùng"
                  />
                  <Input
                    label="Email"
                    value={editEmail}
                    disabled
                    placeholder="Nhập email"
                  />
                  <Select
                    isRequired
                    className="max-w-xs"
                    label="Role"
                    fullWidth
                    selectedKeys={[editRole]}
                    onSelectionChange={(keys) =>
                      setEditRole(Array.from(keys)[0])
                    }
                  >
                    {["customer", "admin"].map((role) => (
                      <SelectItem key={role}>{role}</SelectItem>
                    ))}
                  </Select>

                  <Select
                    isRequired
                    className="max-w-xs"
                    label="Đã xác thực ?"
                    fullWidth
                    selectedKeys={[editIsVerified ? "true" : "false"]}
                    onSelectionChange={(keys) =>
                      setEditIsVerified(keys.has("true"))
                    }
                  >
                    {["true", "false"].map((editIsVerified) => (
                      <SelectItem key={editIsVerified}>
                        {editIsVerified}
                      </SelectItem>
                    ))}
                  </Select>

                  <Input
                    label="Ảnh người dùng"
                    type="file"
                    onChange={(e) => setEditImage(e.target.files[0])}
                  />
                </Form>
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="flat" onPress={() => setEditModalOpen(false)}>
              Hủy
            </Button>
            <Button color="primary" onPress={handleUpdateUser}>
              Lưu
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Modal cho "Xóa" */}
      <Modal isOpen={deleteModalOpen} onClose={() => setDeleteModalOpen(false)}>
        <ModalContent>
          <ModalHeader>Xác nhận xóa</ModalHeader>
          <ModalBody>
            <p>
              Bạn có chắc muốn xóa người dùng{" "}
              <strong>{selectedItem?.username}</strong> không?
            </p>
          </ModalBody>
          <ModalFooter>
            <Button variant="flat" onPress={() => setDeleteModalOpen(false)}>
              Hủy
            </Button>
            <Button color="danger" onPress={handleDeleteUser}>
              Xóa
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <h1 className="text-2xl font-semibold mb-4">Quản lý người dùng</h1>

      <TopContent
        filterValue={inputValue}
        setFilterValue={handleInputChange}
        visibleColumns={visibleColumns}
        setVisibleColumns={setVisibleColumns}
        limit={limit}
        setLimit={setLimit}
        setPage={setPage}
        columns={columns}
        onAddNew={setAddModalOpen}
      />
      {isLoading ? (
        <div className="flex justify-center py-8">
          <Spinner size="lg" />
        </div>
      ) : (
        <TableComponent
          items={users}
          columns={columns}
          page={page}
          setPage={setPage}
          limit={limit}
          totalPages={totalPages}
          visibleColumns={visibleColumns}
          onEdit={(user) => {
            setSelectedItem(user);
            setEditUsername(user.username);
            setEditEmail(user.email);
            setEditIsVerified(user.isVerified);
            setEditRole(user.role);
            setEditImage(user.image); // Set ảnh cũ cho modal sửa
            setEditModalOpen(true);
          }}
          onDelete={(user) => {
            setSelectedItem(user);
            setDeleteModalOpen(true);
          }}
        />
      )}
    </div>
  );
}
