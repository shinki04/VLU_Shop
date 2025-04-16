import React, { useEffect, useState, useMemo } from "react";
import CustomModal from "../../components/Modal/CustomModal";
import DeleteModal from "../../components/Modal/DeleteModal";

import {
  Spinner,
  Card,
  CardBody,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Input,
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@heroui/react";
import {
  Mail,
  Lock,
  Loader,
  EyeClosed,
  Eye,
  CircleCheck,
  X,
} from "lucide-react";
import { toastCustom } from "../../hooks/toastCustom";
import useCategoryStore from "../../store/categoryStore";
import { PaginationControls } from "../../components/Pagination/PaginationControls";
import { PageSizeSelector } from "../../components/Pagination/PageSizeSelector";
import { TextSearch, Plus, ChevronDown } from "lucide-react";
import { TableComponent } from "../../components/Table/Table";
import { TopContent } from "../../components/Table/TopContent";
import { debounce } from "lodash";
const columns = [
  { name: "STT", uid: "index" },
  { name: "Tên danh mục", uid: "name" },
  { name: "Action", uid: "actions" },
];

const INITIAL_VISIBLE_COLUMNS = ["index", "name", "actions"];

export default function CategoryManagement() {
  const {
    categories,
    isLoading,
    error,
    total,
    fetchCategories,
    addCategory,
    updateCategory,
    deleteCategory,
    searchCategoryByKeyword,
    clearError, // Thêm hàm tìm kiếm
  } = useCategoryStore();

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [visibleColumns, setVisibleColumns] = useState(
    new Set(INITIAL_VISIBLE_COLUMNS)
  );
  const [inputValue, setInputValue] = useState(""); // Giá trị hiển thị trong input
  const [filterValue, setFilterValue] = useState(""); // Giá trị dùng để tìm kiếm
  // Tính tổng số trang dựa trên total từ store
  const totalPages = useMemo(() => Math.ceil(total / limit), [total, limit]);

  // Trạng thái cho modal
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [addName, setAddName] = useState("");
  const [editName, setEditName] = useState("");
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [errorMess, setErrorMess] = useState("");

  const handleSort = async (sortKey, sortOrder) => {
    try {
      setPage(1); // Reset về trang đầu khi sắp xếp
      setLimit(10); // Reset về limit mặc định khi sắp xếp
      await searchCategoryByKeyword(
        filterValue,
        page,
        limit,
        sortOrder,
        sortKey
      );
    } catch (err) {
      setErrorMess(err.message || "Error sorting data");
    }
  };

  // Fetch dữ liệu khi page, limit, hoặc filterValue thay đổi

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (filterValue) {
          // Gọi API tìm kiếm nếu có filterValue
          await searchCategoryByKeyword(filterValue, page, limit);
        } else {
          // Gọi API fetch thông thường nếu không có filterValue
          await fetchCategories(page, limit);
        }
      } catch (err) {
        setErrorMess(err.message || "Error fetching data");
      }
    };
    fetchData();
  }, [page, limit, filterValue, fetchCategories, searchCategoryByKeyword]);

  // Tạo hàm debounce để giới hạn tần suất cập nhật filterValue
  const debouncedSetFilterValue = useMemo(
    () =>
      debounce((value) => {
        setFilterValue(value);
      }, 200), // Chờ 200ms sau khi người dùng ngừng gõ
    []
  );

  const handleCloseModal = () => {
    clearError();
  };

  // Xử lý thay đổi input
  const handleInputChange = (value) => {
    setInputValue(value); // Cập nhật ngay giá trị hiển thị
    debouncedSetFilterValue(value); // Cập nhật filterValue sau khi debounce
  };
  // Reset về trang đầu khi filterValue thay đổi
  useEffect(() => {
    setPage(1);
  }, [filterValue]);

  // Hiển thị lỗi nếu có
  useEffect(() => {
    if (error) {
      onOpen();
    }
  }, [error, onOpen]);

  // Xử lý mở modal "Thêm"
  const handleAdd = () => {
    setAddModalOpen(true);
  };

  // Xử lý lưu khi thêm
  const handleSaveAdd = async () => {
    try {
      await addCategory({ name: addName });
      toastCustom({
        title: "Successfully",
        description: "Add success",
      });
      // Refresh danh sách sau khi thêm
      if (filterValue) {
        await searchCategoryByKeyword(filterValue, page, limit);
      } else {
        await fetchCategories(page, limit);
      }
    } catch (err) {
      toastCustom({
        error: err.message || "Error adding category",
      });
    }
    setAddModalOpen(false);
    setAddName("");
  };

  // Xử lý mở modal "Sửa"
  const handleEdit = (item) => {
    setSelectedItem(item);
    setEditName(item.name);
    setEditModalOpen(true);
  };

  // Xử lý lưu khi chỉnh sửa
  const handleSaveEdit = async () => {
    if (selectedItem) {
      try {
        const updated = { ...selectedItem, name: editName };
        await updateCategory(updated);
        toastCustom({
          title: "Successfully",
          description: "Update success",
        });
        // Refresh danh sách sau khi sửa
        if (filterValue) {
          await searchCategoryByKeyword(filterValue, page, limit);
        } else {
          await fetchCategories(page, limit);
        }
      } catch (err) {
        toastCustom({
          error: err.message || "Error updating category",
        });
      }
      setEditModalOpen(false);
      setSelectedItem(null);
      setEditName("");
    }
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
        await deleteCategory(selectedItem._id);
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
    <div className="p-6">
      <CustomModal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        title="Oops!"
        message={error || errorMess}
        onClose={handleCloseModal}
      />
      {/* Modal cho "Thêm" */}
      <Modal isOpen={addModalOpen} onClose={() => setAddModalOpen(false)}>
        <ModalContent>
          <ModalHeader>Thêm danh mục</ModalHeader>
          <ModalBody>
            <Input
              isRequired
              label="Tên danh mục"
              value={addName}
              onChange={(e) => setAddName(e.target.value)}
              placeholder="Nhập tên danh mục"
              isInvalid={addName !== ""} // Kiểm tra độ dài tên danh mục
              errorMessage="Tên danh mục phải có ít nhất 3 ký tự"
            />
          </ModalBody>
          <ModalFooter>
            <Button variant="flat" onPress={() => setAddModalOpen(false)}>
              Hủy
            </Button>
            <Button color="primary" onPress={handleSaveAdd}>
              Lưu
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Modal cho "Sửa" */}
      <Modal isOpen={editModalOpen} onClose={() => setEditModalOpen(false)}>
        <ModalContent>
          <ModalHeader>Chỉnh sửa danh mục</ModalHeader>
          <ModalBody>
            <Input
              label="Tên danh mục"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              placeholder="Nhập tên danh mục"
            />
          </ModalBody>
          <ModalFooter>
            <Button variant="flat" onPress={() => setEditModalOpen(false)}>
              Hủy
            </Button>
            <Button color="primary" onPress={handleSaveEdit}>
              Lưu
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Modal cho "Xóa" */}
      <DeleteModal
        isOpen={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        itemName={selectedItem?.name}
        onDelete={handleConfirmDelete} // Thêm hàm xóa vào props
      />

      <h1 className="text-2xl font-semibold mb-4">Quản lý danh mục</h1>

      <TopContent
        filterValue={inputValue}
        setFilterValue={handleInputChange}
        visibleColumns={visibleColumns}
        setVisibleColumns={setVisibleColumns}
        limit={limit}
        setLimit={setLimit}
        setPage={setPage}
        onAddNew={handleAdd}
        columns={columns}
      />

      <TableComponent
        items={categories} // Sử dụng categories trực tiếp từ store
        columns={columns}
        page={page}
        setPage={setPage}
        limit={limit}
        totalPages={totalPages}
        visibleColumns={visibleColumns}
        onEdit={handleEdit}
        onDelete={handleDelete}
        isLoading={isLoading}
        isSorting
        onSort={handleSort} // Thêm hàm sắp xếp vào props
      />
    </div>
  );
}
