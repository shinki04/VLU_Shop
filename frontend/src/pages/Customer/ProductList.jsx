import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useProductStore from "../../store/productStore";
import useCartStore from "../../store/cartStore";
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Image,
  Button,
  Input,
  Select,
  SelectItem,
  Spinner,
  Pagination,
  Chip,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Slider,
} from "@heroui/react";
import { ShoppingCart, Search, Filter, X, Eye } from "lucide-react";
import { formatPrice } from "../../utils/formatters";

const ProductList = () => {
  const navigate = useNavigate();
  const { products, fetchAllProducts, isLoading } = useProductStore();
  const { addToCart } = useCartStore();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategories, setSelectedCategories] = useState(new Set());
  const [priceRange, setPriceRange] = useState([0, 999999999]);
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8);

  const baseUrl = import.meta.env.NODE_ENV === "production" ? "" : "http://localhost:3000";

  useEffect(() => {
    fetchAllProducts();
  }, [fetchAllProducts]);

  // Lọc sản phẩm
  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategories.size === 0 
      ? true 
      : selectedCategories.has(product.category._id);
    const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1];
    return matchesSearch && matchesCategory && matchesPrice;
  });

  // Sắp xếp sản phẩm
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === "price") {
      return sortOrder === "asc" ? a.price - b.price : b.price - a.price;
    } else if (sortBy === "name") {
      return sortOrder === "asc"
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name);
    }
    return 0;
  });

  // Phân trang
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProducts = sortedProducts.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage);

  // Lấy danh sách categories duy nhất
  const categories = products.reduce((acc, product) => {
    const existingCategory = acc.find(cat => cat._id === product.category._id);
    if (!existingCategory) {
      acc.push(product.category);
    }
    return acc;
  }, []);

  const handleAddToCart = (product) => {
    addToCart({ productId: product._id, quantity: 1 });
  };

  const getImageUrl = (product) => {
    const imageUrl = Array.isArray(product.images)
      ? product.images[0]
      : product.images;
    return imageUrl ? `${baseUrl}${imageUrl}` : "/default-product.png";
  };

  const clearFilters = () => {
    setSelectedCategories(new Set());
    setPriceRange([0, 999999999]);
    setCurrentPage(1);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Search and Filter Section */}
      <div className="mb-8 flex flex-col gap-4">
        <div className="flex gap-4">
          <Input
            type="text"
            placeholder="Tìm kiếm sản phẩm..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            startContent={<Search className="w-4 h-4" />}
            className="flex-1"
          />
          <Select
            label="Sắp xếp"
            selectedKeys={[`${sortBy}-${sortOrder}`]}
            onSelectionChange={(keys) => {
              const [newSortBy, newSortOrder] = Array.from(keys)[0].split("-");
              setSortBy(newSortBy);
              setSortOrder(newSortOrder);
            }}
            className="w-40"
          >
            <SelectItem key="name-asc" value="name-asc" textValue="Tên A-Z">
              Tên A-Z
            </SelectItem>
            <SelectItem key="name-desc" value="name-desc" textValue="Tên Z-A">
              Tên Z-A
            </SelectItem>
            <SelectItem key="price-asc" value="price-asc" textValue="Giá tăng dần">
              Giá tăng dần
            </SelectItem>
            <SelectItem key="price-desc" value="price-desc" textValue="Giá giảm dần">
              Giá giảm dần
            </SelectItem>
          </Select>
        </div>

        <div className="flex flex-wrap gap-4 items-center">
          <Dropdown>
            <DropdownTrigger>
              <Button disableRipple variant="bordered" color="primary">
                {selectedCategories.size > 0
                  ? `${selectedCategories.size} danh mục đã chọn`
                  : "Chọn danh mục"}
              </Button>
            </DropdownTrigger>
            <DropdownMenu
              aria-label="Bộ lọc danh mục"
              selectionMode="multiple"
              selectedKeys={selectedCategories}
              onSelectionChange={(keys) => {
                setSelectedCategories(keys);
                setCurrentPage(1);
              }}
            >
              {categories.map((category) => (
                <DropdownItem key={category._id}>{category.name}</DropdownItem>
              ))}
            </DropdownMenu>
          </Dropdown>
          {selectedCategories.size > 0 && (
            <div className="flex gap-1">
              {[...selectedCategories].map((catId) => {
                const category = categories.find((c) => c._id === catId);
                return (
                  category && (
                    <Chip
                      key={catId}
                      color="primary"
                      onClose={() => {
                        const newSet = new Set(selectedCategories);
                        newSet.delete(catId);
                        setSelectedCategories(newSet);
                        setCurrentPage(1);
                      }}
                    >
                      {category.name}
                    </Chip>
                  )
                );
              })}
            </div>
          )}

          <div className="flex flex-col gap-2 max-w-md">
            <Slider
              formatOptions={{
                locale: "vi-VN",
                style: "currency",
                currency: "VND",
              }}
              showTooltip={true}
              tooltipValueFormatOptions={{
                locale: "vi-VN",
                style: "currency",
                currency: "VND",
              }}
              defaultValue={[0, 999999999]}
              step={100000}
              minValue={0}
              maxValue={999999999}
              value={priceRange}
              onChange={(value) => {
                setPriceRange(value);
                setCurrentPage(1);
              }}
              label="Khoảng giá"
            />
          </div>

          {(selectedCategories.size > 0 ||
            priceRange[0] > 0 ||
            priceRange[1] < 999999999) && (
            <Button 
              variant="flat" 
              color="danger" 
              onPress={clearFilters}
              startContent={<X className="w-4 h-4" />}
            >
              Xóa bộ lọc
            </Button>
          )}
        </div>
      </div>

      {/* Products Grid */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Spinner size="lg" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {currentProducts.map((product) => (
              <Card key={product._id} className="h-full">
                <CardHeader className="p-0">
                  <Image
                    removeWrapper
                    alt={product.name}
                    className="w-full h-[200px] object-cover"
                    src={getImageUrl(product)}
                    fallbackSrc="/default-product.png"
                    loading="lazy"
                  />
                </CardHeader>
                <CardBody className="p-4">
                  <h3 className="font-semibold text-lg">{product.name}</h3>
                  <p className="text-gray-600 line-clamp-2">{product.description}</p>
                  <div className="flex justify-between items-center mt-4">
                    <span className="text-xl font-bold text-primary">
                      {formatPrice(product.price)}
                    </span>
                    <Chip
                      color={product.countInStock > 0 ? "success" : "danger"}
                      size="sm"
                    >
                      {product.countInStock > 0 ? "Còn hàng" : "Hết hàng"}
                    </Chip>
                  </div>
                </CardBody>
                <CardFooter className="p-4 flex gap-2">
                  <Button
                    color="primary"
                    variant="flat"
                    className="flex-1"
                    endContent={<Eye className="w-4 h-4" />}
                    onPress={() => navigate(`/products/${product._id}`)}
                  >
                    Xem chi tiết
                  </Button>
                  <Button
                    color="primary"
                    endContent={<ShoppingCart className="w-4 h-4" />}
                    isDisabled={product.countInStock === 0}
                    onPress={() => handleAddToCart(product)}
                  >
                    Thêm vào giỏ
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-8">
              <Pagination
                total={totalPages}
                page={currentPage}
                onChange={setCurrentPage}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ProductList;