import React, { useEffect, useState, useMemo } from "react";
import useReviewStore from "../../store/reviewStore";
import useProductStore from "../../store/productStore";
import CustomModal from "../../components/Modal/CustomModal.jsx";
import DeleteModal from "../../components/Modal/DeleteModal.jsx";
import ReactRatingStarsComponent from "../../components/ReactRatingStarsComponent.jsx";
import {
  Spinner,
  Input,
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Form,
  Select,
  SelectItem,
  Textarea,
  useDisclosure,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Slider,
  Chip,
} from "@heroui/react";
import { toastCustom } from "../../hooks/toastCustom";
import { TableComponent } from "../../components/Table/Table";
import { TopContent } from "../../components/Table/TopContent";
import StarSlider from "../../components/StarSlider";
import { set } from "lodash";
const columns = [
  { name: "STT", uid: "index" },
  { name: "Sản phẩm", uid: "product", sortable: true },
  { name: "Người dùng", uid: "username", sortable: true },
  { name: "Đánh giá", uid: "rating", sortable: true },
  { name: "Bình luận", uid: "comment", sortable: true },
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
    searchedProducts,
    totalReviews,
    getAllReviews,
    searchProductsWithAvgRating,
    updateReview,
    deleteReview,
    isLoading,
    error,
    totalPages,
    clearError,
  } = useReviewStore();
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
  const [sortKey, setSortKey] = useState(null);
  const [sortOrder, setSortOrder] = useState("asc");
  const [errorMess, setErrorMess] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [selectedProducts, setSelectedProducts] = useState(new Set());
  const [ratingRange, setRatingRange] = useState([0, 5]);
  const [isRequesting, setIsRequesting] = useState(false);

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const [editRating, setEditRating] = useState(0);
  const [editComment, setEditComment] = useState("");

  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  // Fetch products on component mount
  useEffect(() => {
    const loadProducts = async () => {
      try {
        await fetchAllProducts(1, 1000);
      } catch (err) {
        console.error("Error fetching products:", err);
        setErrorMess(err.message || "Error fetching products");
      }
    };
    loadProducts();
  }, [fetchAllProducts]);

  // Sửa lại useEffect để tránh gọi API nhiều lần
  // Modify the useEffect to ensure we're sending the correct page
  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      // Nếu đang có request, không gửi request mới
      if (isRequesting) return;

      setIsRequesting(true);
      try {
        const productIds = [...selectedProducts];
        console.log(
          `ReviewManagement: Fetching data for page ${page}, limit ${limit}`
        );

        // Thêm timestamp để tránh cache
        const timestamp = new Date().getTime();

        if (
          searchValue ||
          selectedProducts.size > 0 ||
          ratingRange[0] > 0 ||
          ratingRange[1] < 5 ||
          sortKey
        ) {
          if (isMounted) {
            await searchProductsWithAvgRating({
              productIds: productIds.length > 0 ? productIds : undefined,
              ratingRange: `${ratingRange[0]},${ratingRange[1]}`,
              keyword: searchValue || undefined,
              page: page,
              limit: limit,
              sortKey: sortKey || "createdAt",
              sortOrder,
              _t: timestamp, // Thêm timestamp để tránh cache
            });
          }
        } else {
          if (isMounted) {
            await getAllReviews(
              page,
              limit,
              searchValue,
              sortKey,
              sortOrder,
              timestamp
            );
          }
        }
      } catch (err) {
        if (isMounted) {
          console.error("Error fetching reviews:", err);
          setErrorMess(err.message || "Error fetching reviews");
        }
      } finally {
        if (isMounted) {
          setIsRequesting(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [
    page,
    limit,
    selectedProducts,
    ratingRange,
    searchValue,
    sortKey,
    sortOrder,
    searchProductsWithAvgRating,
    getAllReviews,
  ]);

  // Show error modal if there's an error
  useEffect(() => {
    if (error || productError || errorMess) {
      onOpen();
    }
  }, [error, productError, errorMess, onOpen]);

  // Handle search input change
  const handleInputChange = (value) => {
    setInputValue(value);
    setSearchValue(value);
    setPage(1); // Chỉ reset page khi người dùng thực sự thay đổi giá trị tìm kiếm
  };

  // Clear filters
  const clearFilters = () => {
    setSelectedProducts(new Set());
    setRatingRange([0, 5]);
    setSearchValue("");
    setInputValue("");
    setSortKey(null);
    setSortOrder("asc");
    setPage(1);
  };

  // Sửa lại hàm handleSort để không gọi API trực tiếp
  // Sửa lại hàm handleSort để map đúng sortKey
  const handleSort = (newSortKey, newSortOrder) => {
    // Map sortKey từ UI sang sortKey mà API hiểu được
    let apiSortKey = newSortKey;
    if (newSortKey === "rating") {
      apiSortKey = "avgRating";
    } else if (newSortKey === "product") {
      apiSortKey = "name";
    } else if (newSortKey === "username") {
      apiSortKey = "username"; // Đảm bảo username được xử lý đúng
    }

    setSortKey(apiSortKey);
    setSortOrder(newSortOrder);
    setPage(1); // Reset về trang 1 khi sort
  };
  // Handle review update
  const handleUpdateReview = async (e) => {
    e.preventDefault();
    if (!selectedItem) {
      toastCustom({
        title: "Error",
        error: "No review selected",
      });
      return;
    }
    try {
      if (!editRating) {
        toastCustom({
          title: "Error",
          error: "Please select a rating",
        });
        return;
      }
      if (editComment.length < 10) {
        toastCustom({
          title: "Error",
          error: "Comment must be at least 10 characters",
        });
        return;
      }
      console.log("Updating review:", { selectedItem });

      await updateReview(selectedItem.productId, {
        rating: parseInt(editRating),
        comment: editComment,
      });

      toastCustom({
        title: "Success",
        description: "Review updated successfully!",
      });

      setEditModalOpen(false);
      setEditRating("");
      setEditComment("");
      setSelectedItem(null);
    } catch (err) {
      toastCustom({
        title: "Error",
        error: err.message || "Error updating review",
      });
    }
  };
  // Handle review deletion
  const handleDeleteReview = async () => {
    if (!selectedItem) return;
    try {
      await deleteReview(selectedItem.productId);

      toastCustom({
        title: "Success",
        description: "Review deleted successfully!",
      });

      setDeleteModalOpen(false);
      setSelectedItem(null);
    } catch (err) {
      toastCustom({
        title: "Error",
        error: err.message || "Error deleting review",
      });
    }
  };
  // Sửa lại formattedReviews để xử lý dữ liệu đúng cách
  // Sửa lại formattedReviews để xử lý dữ liệu đúng cách
  const formattedReviews = useMemo(() => {
    let data = [];

    if (
      searchValue ||
      selectedProducts.size > 0 ||
      ratingRange[0] > 0 ||
      ratingRange[1] < 5 ||
      sortKey
    ) {
      // Kiểm tra xem searchedProducts có tồn tại và có phải là mảng không
      if (Array.isArray(searchedProducts) && searchedProducts.length > 0) {
        // Flatten searchedProducts -> array of reviews
        data = searchedProducts.flatMap((product) => {
          if (!product.reviews || !Array.isArray(product.reviews)) {
            return [];
          }
          return product.reviews.map((review) => ({
            ...review,
            product: {
              _id: product._id,
              name: product.name,
            },
            avgRating: product.avgRating,
          }));
        });
      }
    } else {
      data = reviews || [];
    }

    console.log("Data length before formatting:", data.length);

    // Không cần phải cắt dữ liệu ở đây vì API đã xử lý phân trang
    return data.map((item, index) => ({
      id: item._id || `review-${index}`,
      // Tính toán index dựa trên page và limit hiện tại
      index: (page - 1) * limit + index + 1,
      product: item.product?.name || "Unknown product",
      username: item.name || item.user?.username || "Unknown user",
      rating: item.avgRating ? item.avgRating.toFixed(1) : item.rating || 0,
      comment: item.comment || "No comment",
      productId: item.product?._id || item.product || item._id,
    }));
  }, [
    reviews,
    searchedProducts,
    searchValue,
    selectedProducts,
    ratingRange,
    sortKey,
    page,
    limit,
  ]);

  // Thêm useEffect để log dữ liệu khi formattedReviews thay đổi
  useEffect(() => {
    console.log("Formatted reviews:", formattedReviews.length);
    console.log("Current page:", page);
    console.log("Current limit:", limit);
    console.log("Total pages:", totalPages);
  }, [formattedReviews, page, limit, totalPages]);

  return (
    <div className="p-6">
      <CustomModal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        title="Error!"
        message={error || productError || errorMess}
        onClose={() => {
          setErrorMess("");
          clearError();
        }}
      />

      {/* Edit Modal */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setEditRating("");
          setEditComment("");
          setSelectedItem(null);
        }}
      >
        <ModalContent>
          <ModalHeader>Edit Review</ModalHeader>
          <ModalBody>
            <Form
              className="space-y-4"
              method="put"
              onSubmit={handleUpdateReview}
            >
              {/* <Select
                isRequired
                label="Rating"
                fullWidth
                textValue={editRating}
                selectedKeys={editRating ? [editRating.toString()] : []}
                onSelectionChange={(keys) => setEditRating(Array.from(keys)[0])}
              >
                {[1, 2, 3, 4, 5].map((rating) => (
                  <SelectItem key={rating}>{rating} stars</SelectItem>
                ))}
              </Select> */}

              {/* <Slider
                className="max-w-md"
                color="foreground"
                defaultValue={editRating ? [editRating.toString()] : []}
                getValue={(value) => setEditRating(value[0])}
                // value={[editRating]}
                label="Rating"
                maxValue={5}
                minValue={1}
                showSteps={true}
                size="sm"
                step={1}
              /> */}
              {/* <StarSlider
                value={editRating ? [editRating.toString()] : []}
                  onChangeRange={(range) => setEditRating(range)}

                /> */}
              <ReactRatingStarsComponent
                defaultValue={parseInt(editRating)}
                onChangeRange={(value) => setEditRating(value)}
                className="w-full"
                size={24}
              />

              <Textarea
                isRequired
                label="Comment"
                value={editComment}
                onChange={(e) => setEditComment(e.target.value)}
                placeholder="Enter comment (minimum 10 characters)"
              />
              <div className="flex flex-row gap-2">
                <Button
                  variant="flat"
                  onPress={() => {
                    setEditModalOpen(false);
                    setEditRating("");
                    setEditComment("");
                    setSelectedItem(null);
                  }}
                >
                  Cancel
                </Button>
                <Button color="primary" type="submit">
                  Save
                </Button>
              </div>
            </Form>
          </ModalBody>
          <ModalFooter />
        </ModalContent>
      </Modal>

      {/* Delete Modal */}
      <DeleteModal
        isOpen={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        onDelete={handleDeleteReview}
        itemName={selectedItem?.comment?.substring(0, 20) + "..."}
      />

      <h1 className="text-2xl font-semibold mb-4">Review Management</h1>

      <TopContent
        filterValue={inputValue}
        setFilterValue={handleInputChange}
        visibleColumns={visibleColumns}
        setVisibleColumns={setVisibleColumns}
        limit={limit}
        setLimit={setLimit}
        setPage={setPage}
        columns={columns}
        onAddNew={() => setErrorMess("Không được tự thêm mới review")}
      />

      {/* Filters */}
      <div className="flex flex-col gap-4">
        {/* Product Filter */}
        <div className="flex gap-2 items-center">
          <Dropdown>
            <DropdownTrigger>
              <Button disableRipple variant="bordered" color="primary">
                {selectedProducts.size > 0
                  ? `${selectedProducts.size} products selected`
                  : "Select products"}
              </Button>
            </DropdownTrigger>
            <DropdownMenu
              aria-label="Product filter"
              selectionMode="multiple"
              selectedKeys={selectedProducts}
              onSelectionChange={(keys) => {
                setSelectedProducts(keys);
                setPage(1);
              }}
            >
              {products.map((product) => (
                <DropdownItem key={product._id}>{product.name}</DropdownItem>
              ))}
            </DropdownMenu>
          </Dropdown>
          {selectedProducts.size > 0 && (
            <div className="flex gap-1">
              {[...selectedProducts].map((prodId) => {
                const product = products.find((p) => p._id === prodId);
                return (
                  product && (
                    <Chip
                      key={prodId}
                      color="primary"
                      onClose={() => {
                        const newSet = new Set(selectedProducts);
                        newSet.delete(prodId);
                        setSelectedProducts(newSet);
                        setPage(1);
                      }}
                    >
                      {product.name}
                    </Chip>
                  )
                );
              })}
            </div>
          )}
        </div>

        {/* Rating Range Slider */}
        <div className="flex flex-col gap-2 max-w-md">
          <Slider
            formatOptions={{ style: "decimal", minimumFractionDigits: 1 }}
            showTooltip={true}
            defaultValue={[0, 5]}
            showSteps={true}
            step={1}
            minValue={0}
            maxValue={5}
            value={ratingRange}
            onChange={(value) => {
              setRatingRange(value);
              setPage(1);
            }}
            label="Rating Range"
            isRange
          />
        </div>

        {/* Clear Filters Button */}
        {(selectedProducts.size > 0 ||
          ratingRange[0] > 0 ||
          ratingRange[1] < 5 ||
          searchValue) && (
          <Button variant="flat" color="danger" onPress={clearFilters}>
            Clear Filters
          </Button>
        )}
      </div>

      <TableComponent
        items={formattedReviews}
        columns={columns}
        page={page}
        setPage={(newPage) => {
          if (newPage !== page && !isRequesting) {
            console.log("ReviewManagement: Changing page to:", newPage);
            setPage(newPage);
          }
        }}
        limit={limit}
        totalPages={totalPages}
        visibleColumns={visibleColumns}
        onEdit={(review) => {
          setSelectedItem(review);
          setEditRating(review.rating.toString());
          setEditComment(review.comment);
          setEditModalOpen(true);
        }}
        onDelete={(review) => {
          setSelectedItem(review);
          setDeleteModalOpen(true);
        }}
        isLoading={isLoading || productLoading || isRequesting}
        isSorting
        onSort={handleSort}
      />
    </div>
  );
}
