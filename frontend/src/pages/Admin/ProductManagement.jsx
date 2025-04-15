import { useEffect, useState, useMemo } from "react";
import useProductStore from "../../store/productStore";
import CustomModal from "../../components/Modal/CustomModal";
import DeleteModal from "../../components/Modal/DeleteModal";
import ImagePreviewSection from "../../components/ImagePreviewSection";
import useCategoryStore from "../../store/categoryStore";

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
  { name: "Name", uid: "name" },
  { name: "images", uid: "images" },
  { name: "Description", uid: "description" },
  { name: "NumReviews", uid: "numReviews" },
  { name: "Price", uid: "price" },
  { name: "CountInStock", uid: "countInStock" },
  { name: "Action", uid: "actions" },
];

const INITIAL_VISIBLE_COLUMNS = [
  "index",
  "name",
  "images",
  "description",
  "numReviews",
  "price",
  "countInStock",
  "actions",
];

export default function ProductManagement() {
  const {
    products,
    fetchAllProducts,
    addProduct,
    updateProduct,
    removeProduct,

    fetchProductById,
    filterProducts,

    isLoading: isProductLoading,
    error: productError,
    total: productTotal,
    clearError: clearProductError,
  } = useProductStore();

  const {
    categories,
    isLoading,
    error,
    total,
    fetchCategories,
    searchCategoryByKeyword,
    isLoading: isCategoryLoading,
    error: categoryError,
    total: categoryTotal,
    clearError: clearCategoryError,
  } = useCategoryStore();

  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [visibleColumns, setVisibleColumns] = useState(
    new Set(INITIAL_VISIBLE_COLUMNS)
  );
  const [inputValue, setInputValue] = useState("");
  const [filterValue, setFilterValue] = useState("");
  const [searchCategory, setSearchCategory] = useState("");
  const totalPages = useMemo(() => Math.ceil(total / limit), [total, limit]);

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  // Dữ liệu cho modal Thêm
  const [addName, setAddName] = useState("");
  const [addDescription, setAddDescription] = useState("");
  const [addPrice, setAddPrice] = useState("");
  const [addImages, setAddImages] = useState(null); // Thêm ảnh cho người dùng mới
  const [addCategory, setAddCategory] = useState("");
  const [addCountInStock, setAddCountInStock] = useState(false);
  const [addBrand, setAddBrand] = useState("");
  // Dữ liệu cho modal Sửa

  // Hiển thị lỗi nếu có
  useEffect(() => {
    if (error) {
      onOpen();
      console.log(error);
    }
  }, [error, onOpen]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (filterValue) {
          await filterProducts(filterValue, page, limit);
        } else {
          await fetchAllProducts(page, limit);
        }
      } catch (err) {
        console.error("Error fetching users:", err);
      }
    };
    fetchData();
  }, [page, limit, filterValue,fetchAllProducts, filterProducts]);

  // Fetch categories khi mount
  useEffect(() => {
    fetchCategories(1, 100);
  }, [fetchCategories]);

  const debouncedSetFilterValue = useMemo(
    () => debounce((value) => setFilterValue(value), 200),
    []
  );

  const handleInputChange = (value) => {
    setInputValue(value);
    debouncedSetFilterValue(value);
  };

  // Xử lý mở modal "Sửa"
  const handleEdit = (item) => {
    setSelectedItem(item);
    // setEditName(item.name);
    setEditModalOpen(true);
  };

  // Xử lý mở modal "Xóa"
  const handleDelete = (item) => {
    setSelectedItem(item);
    setDeleteModalOpen(true);
  };
  // Xử lý xác nhận xóa
  const handleConfirmDelete = async () => {
    if (selectedItem) {
      try {
        await removeProduct(selectedItem._id);
        toastCustom({
          title: "Successfully",
          description: "Delete success",
        });
        // Refresh danh sách sau khi xóa
        if (filterValue) {
          await searchCategoryByKeyword(filterValue, page, limit);
        } else {
          await fetchCategories(page, limit);
        }
      } catch (err) {
        toastCustom({
          error: err.message || "Error deleting category",
        });
      }
      setDeleteModalOpen(false);
      setSelectedItem(null);
    }
  };

  const handleSort = async (sortKey, sortOrder) => {
    await fetchAllProducts(page, limit, sortKey, sortOrder);
  };
  return (
    <div>
      <CustomModal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        title="Oops!"
        message={error}
      />
      {/* Modal cho "Thêm" */}
      <Modal
        size="full"
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
      >
        <ModalContent>
          <ModalHeader>Thêm sản phẩm</ModalHeader>
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
                onChange={(e) => {
                  setAddPassword(e.target.value);
                }}
                // isInvalid={addPassword}
                // errorMessage={addPassword}
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

      {/* Modal cho "Sửa" */}
      {/* Modal cho "Xóa" */}
      <DeleteModal
        isOpen={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        itemName={selectedItem?.name}
      />

      <h1 className="text-2xl font-semibold mb-4">Quản lý Sản phẩm</h1>

      <TopContent
        filterValue={inputValue}
        setFilterValue={handleInputChange}
        visibleColumns={visibleColumns}
        setVisibleColumns={setVisibleColumns}
        limit={limit}
        setLimit={setLimit}
        setPage={setPage}
        // onAddNew={handleAdd}
        columns={columns}
      />
      <TableComponent
        items={products} // Sử dụng categories trực tiếp từ store
        columns={columns}
        page={page}
        setPage={setPage}
        limit={limit}
        totalPages={totalPages}
        visibleColumns={visibleColumns}
        onEdit={handleEdit}
        onDelete={handleDelete}
        isLoading={isLoading}
        onSort={handleSort}
      />
    </div>
  );
}
