import React, { useEffect, useState, useMemo } from "react";
import useReviewStore from "../../store/reviewStore";
import useUserStore from "../../store/userStore";
import useProductStore from "../../store/productStore";
import CustomModal from "../../components/Modal/CustomModal.jsx";
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
  Form,
  Select,
  SelectItem,
} from "@heroui/react";
import { toastCustom } from "../../hooks/toastCustom";
import { TableComponent } from "../../components/Table/Table";
import { TopContent } from "../../components/Table/TopContent";
import { debounce } from "lodash";

const columns = [
  { name: "STT", uid: "index" },
  { name: "Sản phẩm", uid: "product" },
  { name: "Người dùng", uid: "username" },
  { name: "Đánh giá", uid: "rating" },
  { name: "Bình luận", uid: "comment" },
  { name: "Hành động", uid: "actions" },
];

const INITIAL_VISIBLE_COLUMNS = [
  "index",
  "product",
  "username",
  "rating",
  "comment",
  "actions",
];

export default function ReviewManagement() {
  const {
    allReviews: reviews,
    getAllReviews,
    updateReview,
    deleteReview,
    isLoading,
    error,
    totalReviews: total,
    totalPages,
    currentPage,
    clearError,
  } = useReviewStore();
  const { currentUser } = useUserStore();
  const {
    products,
    fetchAllProducts,
    isLoading: productLoading,
    error: productError,
  } = useProductStore();

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [visibleColumns, setVisibleColumns] = useState(
    new Set(INITIAL_VISIBLE_COLUMNS)
  );
  const [inputValue, setInputValue] = useState("");
  const [filterValue, setFilterValue] = useState("");
  const [productFilter, setProductFilter] = useState("");
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  // Edit modal data
  const [editRating, setEditRating] = useState("");
  const [editComment, setEditComment] = useState("");

  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  // Handle error display for reviews and products
  useEffect(() => {
    if (error || productError) {
      onOpen();
    }
  }, [error, productError, onOpen]);

  // Fetch products for dropdown
  useEffect(() => {
    fetchAllProducts(1, 1000); // Fetch up to 1000 products
  }, [fetchAllProducts]);

  // Fetch reviews
  useEffect(() => {
    const fetchData = async () => {
      try {
        await getAllReviews(page, limit, filterValue);
      } catch (err) {
        console.error("Error fetching reviews:", err);
      }
    };
    fetchData();
  }, [page, limit, filterValue, getAllReviews]);

  const debouncedSetFilterValue = useMemo(
    () => debounce((value) => setFilterValue(value), 200),
    []
  );

  const handleInputChange = (value) => {
    setInputValue(value);
    debouncedSetFilterValue(value);
  };

  const handleUpdateReview = async (e) => {
    e.preventDefault();
    if (selectedItem) {
      try {
        // Client-side validation
        if (!editRating) {
          toastCustom({
            title: "Error",
            error: "Vui lòng chọn đánh giá",
          });
          return;
        }
        if (editComment.length < 10) {
          toastCustom({
            title: "Error",
            error: "Bình luận phải có ít nhất 10 ký tự",
          });
          return;
        }

        await updateReview(selectedItem.product, {
          rating: parseInt(editRating),
          comment: editComment,
        });

        toastCustom({
          title: "Thành công",
          description: "Đánh giá đã được cập nhật!",
        });

        setEditModalOpen(false);
        setEditRating("");
        setEditComment("");
        await getAllReviews(page, limit, filterValue);
      } catch (err) {
        toastCustom({
          title: "Lỗi",
          error: err.message || "Cập nhật đánh giá thất bại",
        });
      }
    }
  };

  const handleDeleteReview = async () => {
    try {
      await deleteReview(selectedItem.product);

      toastCustom({
        title: "Thành công",
        description: "Đánh giá đã được xóa!",
      });

      setDeleteModalOpen(false);
      await getAllReviews(page, limit, filterValue);
    } catch (err) {
      toastCustom({
        title: "Lỗi",
        error: err.message || "Xóa đánh giá thất bại",
      });
    }
  };

  // Format reviews for table
  const formattedReviews = reviews.map((review, index) => ({
    ...review,
    index: (page - 1) * limit + index + 1,
    product: review.product?.name || "Sản phẩm không xác định",
    username: review.user?.username || review.name || "Người dùng không xác định",
  }));

  // Check if user is admin
  const isAdmin = currentUser?.role === "admin";

  return (
    <div className="">
      <CustomModal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        title="Lỗi!"
        message={error || productError}
        onClose={clearError}
      />

      {/* Modal for Edit */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setEditRating("");
          setEditComment("");
        }}
      >
        <ModalContent>
          <ModalHeader>Chỉnh sửa đánh giá</ModalHeader>
          <ModalBody>
            <Form
              className="space-y-4"
              method="put"
              onSubmit={handleUpdateReview}
            >
              <Select
                isRequired
                label="Đánh giá"
                fullWidth
                selectedKeys={editRating ? [editRating.toString()] : []}
                onSelectionChange={(keys) => setEditRating(Array.from(keys)[0])}
              >
                {[1, 2, 3, 4, 5].map((rating) => (
                  <SelectItem key={rating}>{rating} sao</SelectItem>
                ))}
              </Select>
              <Input
                isRequired
                label="Bình luận"
                value={editComment}
                onChange={(e) => setEditComment(e.target.value)}
                placeholder="Nhập bình luận (tối thiểu 10 ký tự)"
              />
              <div className="flex flex-row gap-2">
                <Button
                  variant="flat"
                  onPress={() => {
                    setEditModalOpen(false);
                    setEditRating("");
                    setEditComment("");
                  }}
                >
                  Hủy
                </Button>
                <Button color="primary" type="submit">
                  Lưu
                </Button>
              </div>
            </Form>
          </ModalBody>
          <ModalFooter />
        </ModalContent>
      </Modal>

      {/* Modal for Delete */}
      <DeleteModal
        isOpen={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        onDelete={handleDeleteReview}
        itemName={selectedItem?.comment?.substring(0, 20) + "..."}
      />

      <h1 className="text-2xl font-semibold mb-4">Quản lý đánh giá</h1>

      <TopContent
        filterValue={inputValue}
        setFilterValue={handleInputChange}
        visibleColumns={visibleColumns}
        setVisibleColumns={setVisibleColumns}
        limit={limit}
        setLimit={setLimit}
        setPage={setPage}
        columns={columns}
        additionalContent={
          <Select
            label="Lọc theo sản phẩm"
            placeholder="Chọn sản phẩm"
            className="max-w-xs"
            selectedKeys={productFilter ? [productFilter] : []}
            onSelectionChange={(keys) => {
              const selected = Array.from(keys)[0];
              setProductFilter(selected || "");
              setFilterValue(selected ? `product:${selected}` : inputValue);
            }}
          >
            {products.map((product) => (
              <SelectItem key={product._id} value={product._id}>
                {product.name}
              </SelectItem>
            ))}
          </Select>
        }
      />

      <TableComponent
        items={formattedReviews}
        columns={columns}
        page={page}
        setPage={setPage}
        limit={limit}
        totalPages={totalPages}
        visibleColumns={visibleColumns}
        onEdit={
          isAdmin
            ? (review) => {
                setSelectedItem(review);
                setEditRating(review.rating.toString());
                setEditComment(review.comment);
                setEditModalOpen(true);
              }
            : null
        }
        onDelete={
          isAdmin
            ? (review) => {
                setSelectedItem(review);
                setDeleteModalOpen(true);
              }
            : null
        }
        isLoading={isLoading || productLoading}
        isSorting={false}
        isFiltering={false}
      />
    </div>
  );
}