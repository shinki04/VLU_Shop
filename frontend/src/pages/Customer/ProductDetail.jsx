import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import useProductStore from "../../store/productStore";
import useCartStore from "../../store/cartStore";
import useReviewStore from "../../store/reviewStore";
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Image,
  Button,
  Chip,
  Spinner,
  Divider,
  Avatar,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Textarea,
  Select,
  SelectItem,
} from "@heroui/react";
import { ShoppingCart, Star, Plus, SortAsc, SortDesc } from "lucide-react";
import { formatPrice, formatDate } from "../../utils/formatters";
import { toastCustom } from "../../hooks/toastCustom";

// Component Rating tùy chỉnh
const Rating = ({ value, size = "md", readOnly = false, onChange }) => {
  const [hoverValue, setHoverValue] = useState(0);
  const stars = [1, 2, 3, 4, 5];
  
  const getSize = () => {
    switch (size) {
      case "sm": return "w-4 h-4";
      case "md": return "w-5 h-5";
      case "lg": return "w-6 h-6";
      default: return "w-5 h-5";
    }
  };

  return (
    <div className="flex gap-1">
      {stars.map((star) => (
        <Star
          key={star}
          className={`${getSize()} cursor-pointer ${
            (hoverValue || value) >= star ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
          }`}
          onMouseEnter={() => !readOnly && setHoverValue(star)}
          onMouseLeave={() => !readOnly && setHoverValue(0)}
          onClick={() => !readOnly && onChange && onChange(star)}
        />
      ))}
    </div>
  );
};

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { fetchProductById, isLoading } = useProductStore();
  const { addToCart } = useCartStore();
  const { addReview } = useReviewStore();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [showAddReview, setShowAddReview] = useState(false);
  const [newReview, setNewReview] = useState({
    rating: 5,
    comment: "",
  });

  // Hàm xử lý URL ảnh
  const getImageUrl = (image) => {
    if (!image) return "/default-product.png";
    if (image.startsWith("http")) return image;
    return `http://localhost:3000${image}`;
  };

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const data = await fetchProductById(id);
        setProduct(data);
      } catch (error) {
        toastCustom({
          title: "Lỗi",
          description: "Không thể tải thông tin sản phẩm",
          status: "error",
        });
        navigate("/products");
      }
    };

    fetchProduct();
  }, [id, fetchProductById, navigate]);

  const handleAddToCart = () => {
    if (product) {
      addToCart({ productId: product._id, quantity });
      toastCustom({
        title: "Thành công",
        description: "Đã thêm sản phẩm vào giỏ hàng",
        status: "success",
      });
    }
  };

  const handleImageClick = (index) => {
    setSelectedImage(index);
  };

  const handleAddReview = async () => {
    try {
      // Validate review data
      if (!newReview.rating) {
        toastCustom({
          title: "Lỗi",
          description: "Vui lòng chọn số sao đánh giá",
          status: "error",
        });
        return;
      }

      if (newReview.rating < 1 || newReview.rating > 5) {
        toastCustom({
          title: "Lỗi", 
          description: "Đánh giá phải từ 1 đến 5 sao",
          status: "error",
        });
        return;
      }

      if (!newReview.comment || newReview.comment.length < 10) {
        toastCustom({
          title: "Lỗi",
          description: "Nội dung đánh giá phải có ít nhất 10 ký tự",
          status: "error",
        });
        return;
      }

      await addReview(id, newReview);
      const updatedProduct = await fetchProductById(id);
      setProduct(updatedProduct);
      setShowAddReview(false);
      setNewReview({ rating: 5, comment: "" });
      toastCustom({
        title: "Thành công",
        description: "Đã thêm đánh giá thành công",
        status: "success",
      });
    } catch (error) {
      toastCustom({
        title: "Lỗi",
        description: error.response?.data?.message || "Không thể thêm đánh giá",
        status: "error",
      });
    }
  };

  const filteredReviews = product?.reviews
    ?.filter((review) => ratingFilter === "all" || review.rating === parseInt(ratingFilter))
    ?.sort((a, b) => {
      if (sortBy === "rating") {
        return sortOrder === "desc" ? b.rating - a.rating : a.rating - b.rating;
      } else {
        return sortOrder === "desc"
          ? new Date(b.createdAt) - new Date(a.createdAt)
          : new Date(a.createdAt) - new Date(b.createdAt);
      }
    });

  if (isLoading || !product) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Hình ảnh sản phẩm */}
        <div className="space-y-4">
          <Card className="h-full">
            <CardHeader className="p-0">
              <Image
                removeWrapper
                alt={product.name}
                className="w-full h-[400px] object-cover"
                src={getImageUrl(product.images?.[selectedImage])}
                fallbackSrc="/default-product.png"
                loading="lazy"
              />
            </CardHeader>
          </Card>
          
          {/* Grid hiển thị tất cả ảnh */}
          <div className="grid grid-cols-4 gap-2">
            {product.images?.map((image, index) => (
              <Card 
                key={index} 
                className={`cursor-pointer hover:opacity-80 transition-opacity ${
                  selectedImage === index ? 'ring-2 ring-primary' : ''
                }`}
                onPress={() => handleImageClick(index)}
              >
                <Image
                  removeWrapper
                  alt={`${product.name} - ${index + 1}`}
                  className="w-full h-24 object-cover"
                  src={getImageUrl(image)}
                  fallbackSrc="/default-product.png"
                  loading="lazy"
                />
              </Card>
            ))}
          </div>
        </div>

        {/* Thông tin sản phẩm */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">{product.name}</h1>
            <div className="flex items-center gap-2 mt-2">
              <Chip
                color={product.countInStock > 0 ? "success" : "danger"}
                size="sm"
              >
                {product.countInStock > 0 ? "Còn hàng" : "Hết hàng"}
              </Chip>
            </div>
          </div>

          <div className="text-2xl font-bold text-primary">
            {formatPrice(product.price)}
          </div>

          <Divider />

          <div>
            <h2 className="text-xl font-semibold mb-2">Mô tả sản phẩm</h2>
            <p className="text-gray-600">{product.description}</p>
          </div>

          <Divider />

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Button
                isIconOnly
                variant="flat"
                onPress={() => setQuantity(Math.max(1, quantity - 1))}
              >
                -
              </Button>
              <span className="w-8 text-center">{quantity}</span>
              <Button
                isIconOnly
                variant="flat"
                onPress={() =>
                  setQuantity(Math.min(product.countInStock, quantity + 1))
                }
              >
                +
              </Button>
            </div>

            <Button
              color="primary"
              className="flex-1"
              endContent={<ShoppingCart className="w-4 h-4" />}
              isDisabled={product.countInStock === 0}
              onPress={handleAddToCart}
            >
              Thêm vào giỏ
            </Button>
          </div>
        </div>
      </div>

      {/* Phần đánh giá */}
      <div className="mt-60">
        <h2 className="text-2xl font-bold mb-6">Đánh giá sản phẩm</h2>
        
        {/* Tổng quan đánh giá */}
        <div className="flex items-center gap-4 mb-8">
          <div className="text-4xl font-bold">{product.rating}</div>
          <div className="flex flex-col">
            <Rating 
              value={product.rating} 
              readOnly 
              size="lg"
              className="mb-1"
            />
            <span className="text-gray-500">
              {product.numReviews} đánh giá
            </span>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Đánh giá sản phẩm</h2>
            <Button
              color="primary"
              startContent={<Plus className="w-4 h-4" />}
              onPress={() => setShowAddReview(true)}
            >
              Thêm đánh giá
            </Button>
          </div>

          {/* Review Filters */}
          <div className="flex gap-4 mb-6">
            <Select
              label="Lọc theo đánh giá"
              value={ratingFilter}
              onChange={(e) => setRatingFilter(e.target.value)}
              className="w-40"
            >
              <SelectItem key="all" value="all">Tất cả</SelectItem>
              <SelectItem key="5" value="5">5 sao</SelectItem>
              <SelectItem key="4" value="4">4 sao</SelectItem>
              <SelectItem key="3" value="3">3 sao</SelectItem>
              <SelectItem key="2" value="2">2 sao</SelectItem>
              <SelectItem key="1" value="1">1 sao</SelectItem>
            </Select>
            <Select
              label="Sắp xếp theo"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-40"
            >
              <SelectItem key="createdAt" value="createdAt">Ngày đánh giá</SelectItem>
              <SelectItem key="rating" value="rating">Số sao</SelectItem>
            </Select>
            <Button
              isIconOnly
              variant="flat"
              onClick={() => setSortOrder(sortOrder === "desc" ? "asc" : "desc")}
            >
              {sortOrder === "desc" ? <SortDesc className="w-4 h-4" /> : <SortAsc className="w-4 h-4" />}
            </Button>
          </div>

          {/* Reviews List */}
          {filteredReviews && filteredReviews.length > 0 ? (
            <div className="space-y-4">
              {filteredReviews.map((review) => (
                <Card key={review._id} className="p-4">
                  <div className="flex items-start gap-4">
                    <Avatar
                      src={getImageUrl(review.user?.image)}
                      alt={review.user?.username}
                      className="w-10 h-10"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{review.user?.username}</p>
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  i < review.rating
                                    ? "text-yellow-400"
                                    : "text-gray-300"
                                }`}
                                fill={i < review.rating ? "currentColor" : "none"}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-sm text-gray-500">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <p className="mt-2 text-gray-600">{review.comment}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">Chưa có đánh giá nào</p>
          )}
        </div>
      </div>

      {/* Add Review Modal */}
      <Modal isOpen={showAddReview} onOpenChange={setShowAddReview}>
        <ModalContent>
          <ModalHeader>Thêm đánh giá</ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Đánh giá:</span>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-6 h-6 cursor-pointer ${
                        i < newReview.rating
                          ? "text-yellow-400"
                          : "text-gray-300"
                      }`}
                      fill={i < newReview.rating ? "currentColor" : "none"}
                      onClick={() => setNewReview({ ...newReview, rating: i + 1 })}
                    />
                  ))}
                </div>
              </div>
              <Textarea
                label="Bình luận"
                value={newReview.comment}
                onChange={(e) =>
                  setNewReview({ ...newReview, comment: e.target.value })
                }
                placeholder="Nhập bình luận của bạn..."
                minRows={3}
              />
            </div>
          </ModalBody>
          <ModalFooter>
            <Button
              color="danger"
              variant="light"
              onPress={() => setShowAddReview(false)}
            >
              Hủy
            </Button>
            <Button
              color="primary"
              onPress={handleAddReview}
              isDisabled={!newReview.comment.trim()}
            >
              Thêm đánh giá
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default ProductDetail;