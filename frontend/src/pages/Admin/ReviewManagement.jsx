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
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Card,
  CardHeader,
  Avatar,
  CardBody,
  Divider,
} from "@heroui/react";
import { toastCustom } from "../../hooks/toastCustom";
import { TableComponent } from "../../components/Table/Table";
import { TopContent } from "../../components/Table/TopContent";
import StarSlider from "../../components/StarSlider";
import { set } from "lodash";
import { Star, Search, SortAsc, SortDesc } from "lucide-react";
import { formatDate } from "../../utils/formatters";

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

const ReviewManagement = () => {
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

  useEffect(() => {
    fetchReviews();
  }, [sortKey, sortOrder, ratingRange, searchValue, selectedProducts]);

  const fetchReviews = async () => {
    try {
      setErrorMess("");
      setIsRequesting(true);
      const productIds = [...selectedProducts];
      console.log(
        `ReviewManagement: Fetching data for page ${page}, limit ${limit}`
      );

      const timestamp = new Date().getTime();

      if (
        searchValue ||
        selectedProducts.size > 0 ||
        ratingRange[0] > 0 ||
        ratingRange[1] < 5 ||
        sortKey
      ) {
        await searchProductsWithAvgRating({
          productIds: productIds.length > 0 ? productIds : undefined,
          ratingRange: `${ratingRange[0]},${ratingRange[1]}`,
          keyword: searchValue || undefined,
          page: page,
          limit: limit,
          sortKey: sortKey || "createdAt",
          sortOrder,
          _t: timestamp,
        });
      } else {
        await getAllReviews(
          page,
          limit,
          searchValue,
          sortKey,
          sortOrder,
          timestamp
        );
      }
    } catch (err) {
      console.error("Error fetching reviews:", err);
      setErrorMess(err.message || "Error fetching reviews");
    } finally {
      setIsRequesting(false);
    }
  };

  useEffect(() => {
    if (error || productError || errorMess) {
      onOpen();
    }
  }, [error, productError, errorMess, onOpen]);

  const handleInputChange = (value) => {
    setInputValue(value);
    setSearchValue(value);
    setPage(1);
  };

  const clearFilters = () => {
    setSelectedProducts(new Set());
    setRatingRange([0, 5]);
    setSearchValue("");
    setInputValue("");
    setSortKey(null);
    setSortOrder("asc");
    setPage(1);
  };

  const handleSort = async (newSortKey, newSortOrder) => {
    try {
      setErrorMess("");
      setIsRequesting(true);

      let apiSortKey = newSortKey;
      if (newSortKey === "rating") {
        apiSortKey = "avgRating";
      } else if (newSortKey === "product") {
        apiSortKey = "name";
      } else if (newSortKey === "username") {
        apiSortKey = "username";
      }

      const productIds = [...selectedProducts];
      const timestamp = new Date().getTime();

      if (
        searchValue ||
        selectedProducts.size > 0 ||
        ratingRange[0] > 0 ||
        ratingRange[1] < 5
      ) {
        await searchProductsWithAvgRating({
          productIds: productIds.length > 0 ? productIds : undefined,
          ratingRange: `${ratingRange[0]},${ratingRange[1]}`,
          keyword: searchValue || undefined,
          page: 1, // Reset to first page
          limit: limit,
          sortKey: apiSortKey,
          sortOrder: newSortOrder,
          _t: timestamp,
        });
      } else {
        await getAllReviews(
          1, // Reset to first page
          limit,
          searchValue,
          apiSortKey,
          newSortOrder,
          timestamp
        );
      }

      setSortKey(apiSortKey);
      setSortOrder(newSortOrder);
      setPage(1);
    } catch (err) {
      console.error("Error sorting reviews:", err);
      setErrorMess(err.message || "Error sorting reviews");
    } finally {
      setIsRequesting(false);
    }
  };

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

  const formattedReviews = useMemo(() => {
    let data = [];

    if (
      searchValue ||
      selectedProducts.size > 0 ||
      ratingRange[0] > 0 ||
      ratingRange[1] < 5 ||
      sortKey
    ) {
      if (Array.isArray(searchedProducts) && searchedProducts.length > 0) {
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

    return data.map((item, index) => ({
      id: item._id || `review-${index}`,
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

  useEffect(() => {
    console.log("Formatted reviews:", formattedReviews.length);
    console.log("Current page:", page);
    console.log("Current limit:", limit);
    console.log("Total pages:", totalPages);
  }, [formattedReviews, page, limit, totalPages]);

  return (
    <div className="p-4">
      <Card className="mb-4">
        <CardHeader className="flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">Quản lý đánh giá</h1>
          </div>
        </CardHeader>
        <CardBody className="overflow-x-auto">
          <div className="flex gap-4">
            <Input
              placeholder="Tìm kiếm theo tên người dùng hoặc sản phẩm"
              value={inputValue}
              onChange={handleInputChange}
              startContent={<Search className="" />}
              className="w-full"
            />
            <Select
              label="Lọc theo đánh giá"
              value={ratingRange[0].toString()}
              onChange={(e) =>
                setRatingRange([parseInt(e.target.value), ratingRange[1]])
              }
              className="w-full"
              size="sm"
            >
              <SelectItem key="1" value="1">
                1 sao
              </SelectItem>
              <SelectItem key="2" value="2">
                2 sao
              </SelectItem>
              <SelectItem key="3" value="3">
                3 sao
              </SelectItem>
              <SelectItem key="4" value="4">
                4 sao
              </SelectItem>
              <SelectItem key="5" value="5">
                5 sao
              </SelectItem>
            </Select>
            <Select
              label="Sắp xếp theo"
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value)}
              className="w-full"
              size="sm"
            >
              <SelectItem key="createdAt" value="createdAt">
                Ngày đánh giá
              </SelectItem>
              <SelectItem key="rating" value="rating">
                Số sao
              </SelectItem>
            </Select>
            <Button
              isIconOnly
              variant="flat"
              size="xl"
              className="w-80 rounded-lg	"
              onPress={() =>
                setSortOrder(sortOrder === "desc" ? "asc" : "desc")
              }
            >
              {sortOrder === "desc" ? (
                <SortDesc className="w-4 h-4" />
              ) : (
                <SortAsc className="w-4 h-4" />
              )}
            </Button>
          </div>
        </CardBody>
      </Card>

      {/* Select lọc trạng thái đơn hàng */}
      <div className="my-10 flex flex-wrap gap-4 items-end">
        <div className="w-full md:w-96 space-y-2 sm:2">
          <label className="text-sm font-medium">
            Lọc theo số sao ({ratingRange[0]} - {ratingRange[1]} sao)
          </label>
          <Slider
            size="sm"
            step={0.5}
            minValue={0}
            maxValue={5}
            value={ratingRange}
            onChange={setRatingRange}
            className="w-full"
            marks={[
              { value: 0, label: "0" },
              { value: 1, label: "1" },
              { value: 2, label: "2" },
              { value: 3, label: "3" },
              { value: 4, label: "4" },
              { value: 5, label: "5" },
            ]}
            showTooltip={true}
            tooltipContent={(value) => `${value} sao`}
          />
        </div>
      </div>

      {isLoading || productLoading ? (
        <div className="flex justify-center items-center h-64">
          <Spinner size="lg" />
        </div>
      ) : (
        <Table aria-label="Reviews table">
          <TableHeader>
            <TableColumn>Người dùng</TableColumn>
            <TableColumn>Sản phẩm</TableColumn>
            <TableColumn>Đánh giá</TableColumn>
            <TableColumn>Bình luận</TableColumn>
            <TableColumn>Ngày đánh giá</TableColumn>
            <TableColumn>Hành động</TableColumn>
          </TableHeader>
          <TableBody>
            {formattedReviews.map((review) => (
              <TableRow key={review.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Avatar
                      src={
                        review.username.startsWith("http")
                          ? review.username
                          : products.find((p) => p._id === review.productId)
                              ?.image || ""
                      }
                      alt={review.username}
                      size="sm"
                    />
                    <span>{review.username}</span>
                  </div>
                </TableCell>
                <TableCell>{review.product}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < parseFloat(review.rating)
                            ? "text-yellow-400"
                            : "text-gray-300"
                        }`}
                        fill={
                          i < parseFloat(review.rating)
                            ? "currentColor"
                            : "none"
                        }
                      />
                    ))}
                  </div>
                </TableCell>
                <TableCell>{review.comment}</TableCell>
                <TableCell>{formatDate(review.index)}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      color="danger"
                      size="sm"
                      variant="flat"
                      onPress={() => {
                        setSelectedItem(review);
                        onOpen();
                      }}
                    >
                      Xóa
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          <ModalHeader>Xác nhận xóa đánh giá</ModalHeader>
          <ModalBody>
            <p>Bạn có chắc chắn muốn xóa đánh giá này?</p>
          </ModalBody>
          <ModalFooter>
            <Button color="danger" variant="light" onPress={onOpenChange}>
              Hủy
            </Button>
            <Button
              color="danger"
              onPress={() => {
                handleDeleteReview();
                onOpenChange();
              }}
            >
              Xóa
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default ReviewManagement;
