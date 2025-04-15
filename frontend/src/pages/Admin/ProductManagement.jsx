import { useEffect, useState, useMemo } from "react";
import useProductStore from "../../store/productStore";
import CustomModal from "../../components/Modal/CustomModal";
import DeleteModal from "../../components/Modal/DeleteModal";
import ImagePreviewSection from "../../components/ImagePreviewSection";
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
    isLoading,
    fetchProductById,
    filterProducts,
    error,
    clearError,
    total,
  } = useProductStore();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

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

  // Dữ liệu cho modal Sửa

  // Hiển thị lỗi nếu có
  useEffect(() => {
    if (error) {
      onOpen();
      console.log(error);
    }
  }, [error, onOpen, clearError]);

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
  }, [page, limit, filterValue]);

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

  return (
    <div>
      <CustomModal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        title="Oops!"
        message={error}
      />
      {/* Modal cho "Thêm" */}
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
      />
    </div>
  );
}
