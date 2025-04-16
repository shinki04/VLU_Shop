import useUserStore from "../../store/userStore";
import React, { useEffect, useState, useMemo } from "react";
import CustomModal from "../../components/Modal/CustomModal.jsx";
import { PasswordCriteria } from "../../components/PasswordStrengthMeter";
import DeleteModal from "../../components/Modal/DeleteModal.jsx";
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
import CustomInputPass from "../../components/CustomInputPass.jsx";

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
    updateUser,
    deleteUser,
    isLoading,
    total,
    error,
    createUserByAdmin,
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
  const [passwordError, setPasswordError] = useState("");
  const [usernameError, setUsernameError] = useState("");

  // Add modal data
  const [addUsername, setAddUsername] = useState("");
  const [addEmail, setAddEmail] = useState("");
  const [addPassword, setAddPassword] = useState("");
  const [addImage, setAddImage] = useState(null);
  const [addRole, setAddRole] = useState("");
  const [addIsVerified, setAddIsVerified] = useState(false);

  // Edit modal data
  const [editUsername, setEditUsername] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editImage, setEditImage] = useState(null); // File or URL string
  const [editRole, setEditRole] = useState("");
  const [editIsVerified, setEditIsVerified] = useState(false);
  const [editImagePreview, setEditImagePreview] = useState(null); // Preview URL for new image

  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const serverURL = import.meta.env.DEV ? "http://localhost:3000" : "";

  // Handle error display
  useEffect(() => {
    if (error) {
      onOpen();
      console.log(error);
    }
  }, [error, onOpen]);

  // Fetch users
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
  }, [page, limit, filterValue, fetchUsers, searchUsersByKeyword]);

  // Cleanup preview URL when editImagePreview changes
  useEffect(() => {
    return () => {
      if (editImagePreview) {
        URL.revokeObjectURL(editImagePreview);
      }
    };
  }, [editImagePreview]);

  const debouncedSetFilterValue = useMemo(
    () => debounce((value) => setFilterValue(value), 200),
    []
  );

  const handleInputChange = (value) => {
    setInputValue(value);
    debouncedSetFilterValue(value);
  };

  // Handle image change for edit modal
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEditImage(file);
      setEditImagePreview(URL.createObjectURL(file));
    }
  };

  // Handle image removal for edit modal
  const handleRemoveImage = () => {
    if (editImagePreview) {
      URL.revokeObjectURL(editImagePreview);
    }
    setEditImage(null);
    setEditImagePreview(null);
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      const newUser = {
        username: addUsername,
        email: addEmail,
        password: addPassword,
        role: addRole,
        isVerified: addIsVerified,
      };
      await createUserByAdmin(newUser);

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
      setAddImage(null);

      await fetchUsers(page, limit);
    } catch (err) {
      toastCustom({
        title: "Error",
        error: error || err.message || "Error adding user",
      });
    }
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    if (selectedItem) {
      try {
        let imageUrl = selectedItem.image;

        if (editImage && editImage instanceof File) {
          imageUrl = await uploadImage(editImage);
        }

        const updated = {
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
        setEditImage(null);
        setEditImagePreview(null);

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

      {/* Modal for Add */}
      <Modal isOpen={addModalOpen} onClose={() => setAddModalOpen(false)}>
        <ModalContent>
          <ModalHeader>Thêm người dùng</ModalHeader>
          <ModalBody>
            <Form
              encType="multipart/form-data"
              className="space-y-4"
              method="post"
              onSubmit={handleAddUser}
            >
              <Input
                label="Tên người dùng"
                value={addUsername}
                onChange={(e) => setAddUsername(e.target.value)}
                placeholder="Nhập tên người dùng"
              />
              <Input
                label="Email"
                type="email"
                isRequired
                value={addEmail}
                onChange={(e) => setAddEmail(e.target.value)}
                placeholder="Nhập email"
              />
              <CustomInputPass
                isRequired
                label="Mật khẩu"
                value={addPassword}
                onChange={(e) => setAddPassword(e.target.value)}
              />
              <Select
                isRequired
                className="max-w-xs"
                label="Role"
                fullWidth
                selectedKeys={[addRole]}
                onSelectionChange={(keys) => setAddRole(Array.from(keys)[0])}
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
                selectedKeys={[addIsVerified ? "true" : "false"]}
                onSelectionChange={(keys) => setAddIsVerified(keys.has("true"))}
              >
                {["true", "false"].map((addIsVerified) => (
                  <SelectItem key={addIsVerified}>{addIsVerified}</SelectItem>
                ))}
              </Select>
              <PasswordCriteria password={addPassword} />
              <div className="flex flex-row gap-3">
                <Button variant="flat" onPress={() => setAddModalOpen(false)}>
                  Hủy
                </Button>
                <Button color="primary" type="submit">
                  Lưu
                </Button>
              </div>
            </Form>
          </ModalBody>
          <ModalFooter></ModalFooter>
        </ModalContent>
      </Modal>

      {/* Modal for Edit */}
      <Modal
        size={"3xl"}
        isOpen={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          if (editImagePreview) {
            URL.revokeObjectURL(editImagePreview);
          }
          setEditImage(null);
          setEditImagePreview(null);
        }}
      >
        <ModalContent>
          <ModalHeader id="editUser">
            <p className="flex flex-col gap-1 leading-relaxed">
              Chỉnh sửa người dùng
            </p>
          </ModalHeader>
          <ModalBody>
            <div className="w-full flex flex-col md:flex-row gap-4">
              <div className="md:basis-5/12 w-full">
                {editImagePreview ? (
                  <div className="relative group">
                    <Image
                      src={editImagePreview}
                      alt="New Image Preview"
                      className="w-full h-auto object-cover rounded-lg"
                      isZoomed
                    />
                    <Button
                      size="sm"
                      color="danger"
                      onPress={handleRemoveImage}
                      className="absolute top-2 right-2 opacity-80 hover:opacity-100 z-50"
                    >
                      X
                    </Button>
                  </div>
                ) : editImage ? (
                  <div className="relative group">
                    <Image
                      src={`${serverURL}${editImage}`}
                      alt="Old Image"
                      className="w-full h-auto object-cover rounded-lg"
                      isZoomed
                    />
                    <Button
                      size="sm"
                      color="danger"
                      onPress={handleRemoveImage}
                      className="absolute top-2 right-2 opacity-80 hover:opacity-100 z-50"
                    >
                      X
                    </Button>
                  </div>
                ) : (
                  <Spinner
                    variant="dots"
                    color="secondary"
                    size="md"
                    label="Chưa có ảnh..."
                    className="mt-4"
                  />
                )}
              </div>
              <div className="w-full">
                <Form
                  encType="multipart/form-data"
                  className="space-y-4"
                  method="put"
                  onSubmit={handleUpdateUser}
                >
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
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                  <div className="flex flex-row gap-2">
                    <Button
                      variant="flat"
                      onPress={() => {
                        setEditModalOpen(false);
                        if (editImagePreview) {
                          URL.revokeObjectURL(editImagePreview);
                        }
                        setEditImage(null);
                        setEditImagePreview(null);
                      }}
                    >
                      Hủy
                    </Button>
                    <Button color="primary" type="submit">
                      Lưu
                    </Button>
                  </div>
                </Form>
              </div>
            </div>
          </ModalBody>
          <ModalFooter></ModalFooter>
        </ModalContent>
      </Modal>

      {/* Modal for Delete */}
      <DeleteModal
        isOpen={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        onDelete={handleDeleteUser}
        itemName={selectedItem?.username}
      />

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
          setEditImage(user.image);
          setEditImagePreview(null);
          setEditModalOpen(true);
        }}
        onDelete={(user) => {
          setSelectedItem(user);
          setDeleteModalOpen(true);
        }}
        isLoading={isLoading}
      />
    </div>
  );
}