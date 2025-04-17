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
  { name: "STT", uid: "index", sortable: true },
  { name: "Tên danh mục", uid: "name", sortable: true },
  { name: "Action", uid: "actions", sortable: true },
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
    clearError,
  } = useCategoryStore();

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [visibleColumns, setVisibleColumns] = useState(
    new Set(INITIAL_VISIBLE_COLUMNS)
  );
  const [inputValue, setInputValue] = useState("");
  const [filterValue, setFilterValue] = useState("");
  const [sortKey, setSortKey] = useState(null);
  const [sortOrder, setSortOrder] = useState("asc");
  const totalPages = useMemo(() => Math.ceil(total / limit), [total, limit]);

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [addName, setAddName] = useState("");
  const [editName, setEditName] = useState("");
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [errorMess, setErrorMess] = useState("");

  // Modified handleSort to use updated page and limit
  const handleSort = async (newSortKey, newSortOrder) => {
    try {
      // Only update state if sortKey or sortOrder has changed
      if (newSortKey !== sortKey || newSortOrder !== sortOrder) {
        setSortKey(newSortKey);
        setSortOrder(newSortOrder);
        setPage(1); // Reset to page 1
        setLimit(10); // Reset to default limit
        // Use updated page (1) and limit (10) directly
        await searchCategoryByKeyword(
          filterValue,
          page, // Use updated page
          limit, // Use updated limit
          newSortOrder,
          newSortKey
        );
      }
    } catch (err) {
      setErrorMess(err.message || "Error sorting data");
    }
  };

  // Fetch data when page, limit, filterValue, sortKey, or sortOrder changes
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (filterValue) {
          await searchCategoryByKeyword(
            filterValue,
            page,
            limit,
            sortOrder,
            sortKey
          );
        } else {
          await fetchCategories(page, limit);
        }
      } catch (err) {
        setErrorMess(err.message || "Error fetching data");
      }
    };
    fetchData();
  }, [
    page,
    limit,
    filterValue,
    sortKey,
    sortOrder,
    fetchCategories,
    searchCategoryByKeyword,
  ]);

  // Debounced filter value update
  const debouncedSetFilterValue = useMemo(
    () =>
      debounce((value) => {
        setFilterValue(value);
      }, 200),
    []
  );

  const handleCloseModal = () => {
    clearError();
  };

  const handleInputChange = (value) => {
    setInputValue(value);
    debouncedSetFilterValue(value);
  };

  useEffect(() => {
    setPage(1);
  }, [filterValue]);

  useEffect(() => {
    if (error) {
      onOpen();
    }
  }, [error, onOpen]);

  const handleAdd = () => {
    setAddModalOpen(true);
  };

  const handleSaveAdd = async () => {
    try {
      await addCategory({ name: addName });
      toastCustom({
        title: "Successfully",
        description: "Add success",
      });
      if (filterValue) {
        await searchCategoryByKeyword(
          filterValue,
          page,
          limit,
          sortOrder,
          sortKey
        );
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

  const handleEdit = (item) => {
    setSelectedItem(item);
    setEditName(item.name);
    setEditModalOpen(true);
  };

  const handleSaveEdit = async () => {
    if (selectedItem) {
      try {
        const updated = { ...selectedItem, name: editName };
        await updateCategory(updated);
        toastCustom({
          title: "Successfully",
          description: "Update success",
        });
        if (filterValue) {
          await searchCategoryByKeyword(
            filterValue,
            page,
            limit,
            sortOrder,
            sortKey
          );
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

  const handleDelete = (item) => {
    setSelectedItem(item);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (selectedItem) {
      try {
        await deleteCategory(selectedItem._id);
        toastCustom({
          title: "Successfully",
          description: "Delete success",
        });
        if (filterValue) {
          await searchCategoryByKeyword(
            filterValue,
            page,
            limit,
            sortOrder,
            sortKey
          );
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
      <DeleteModal
        isOpen={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        itemName={selectedItem?.name}
        onDelete={handleConfirmDelete}
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
        items={categories}
        columns={columns}
        page={page}
        setPage={setPage}
        limit={limit}
        totalPages={totalPages}
        visibleColumns={visibleColumns}
        onEdit={handleEdit}
        onDelete={handleDelete}
        isLoading={isLoading}
        isSorting={true}
        onSort={handleSort}
      />
    </div>
  );
}
