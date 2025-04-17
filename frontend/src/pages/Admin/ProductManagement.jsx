import React, { useEffect, useState, useMemo } from "react";
import useProductStore from "../../store/productStore";
import useCategoryStore from "../../store/categoryStore";
import CustomModal from "../../components/Modal/CustomModal.jsx";
import DeleteModal from "../../components/Modal/DeleteModal.jsx";
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
import { debounce } from "lodash";

const columns = [
  { name: "STT", uid: "index" },
  { name: "Tên sản phẩm", uid: "name", sortable: true },
  { name: "Ảnh", uid: "images" },
  { name: "Giá", uid: "price", sortable: true },
  { name: "Danh mục", uid: "category", sortable: true },
  { name: "Tồn kho", uid: "countInStock", sortable: true },
  { name: "Mô tả", uid: "description", sortable: true },
  { name: "Hành động", uid: "actions" },
];

const INITIAL_VISIBLE_COLUMNS = [
  "index",
  "name",
  "images",
  "price",
  "category",
  "description",
  "countInStock",
  "actions",
];

export default function ProductManagement() {
  const {
    products,
    fetchAllProducts,
    filterProducts,
    addProduct,
    updateProduct,
    removeProduct,
    isLoading: productLoading,
    error: productError,
    totalProducts,
    uploadProductImages,
  } = useProductStore();

  const {
    categories,
    fetchCategories,
    isLoading: categoryLoading,
    error: categoryError,
  } = useCategoryStore();

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [visibleColumns, setVisibleColumns] = useState(
    new Set(INITIAL_VISIBLE_COLUMNS)
  );
  const [sortKey, setSortKey] = useState(null); // Không sắp xếp mặc định
  const [sortOrder, setSortOrder] = useState("asc");
  const [errorMess, setErrorMess] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [selectedCategories, setSelectedCategories] = useState(new Set());
  const [priceRange, setPriceRange] = useState([0, 999999999]);

  // Tính tổng số trang
  const totalPages = useMemo(() => {
    const total = totalProducts || 0;
    return Math.ceil(total / limit) || 1; // Đảm bảo ít nhất 1 trang
  }, [totalProducts, limit]);

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  // Dữ liệu cho modal Thêm
  const [addName, setAddName] = useState("");
  const [addDescription, setAddDescription] = useState("");
  const [addPrice, setAddPrice] = useState("");
  const [addCategory, setAddCategory] = useState("");
  const [addCountInStock, setAddCountInStock] = useState("");
  const [addBrand, setAddBrand] = useState("");
  const [addImages, setAddImages] = useState([]);

  // Dữ liệu cho modal Sửa
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editCountInStock, setEditCountInStock] = useState("");
  const [editBrand, setEditBrand] = useState("");
  const [editImages, setEditImages] = useState([]);

  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  // Xác định ID danh mục được chọn cho modal sửa
  const selectedCategoryId =
    editCategory && categories.some((cat) => cat._id === editCategory)
      ? editCategory
      : selectedItem?.category?._id &&
        categories.some((cat) => cat._id === selectedItem.category._id)
      ? selectedItem.category._id
      : null;

  // Lấy danh mục khi component mount
  useEffect(() => {
    const loadCategories = async () => {
      try {
        await fetchCategories(1, 100); // Lấy tối đa 100 danh mục
      } catch (err) {
        console.error("Lỗi khi lấy danh mục:", err);
        setErrorMess(err.message || "Lỗi khi lấy danh mục");
      }
    };
    loadCategories();
  }, [fetchCategories]);

  // Lấy sản phẩm khi page, limit, bộ lọc hoặc sắp xếp thay đổi
  useEffect(() => {
    const fetchData = async () => {
      try {
        const checked = [...selectedCategories].join(",");
        const priceRangeStr = priceRange.join(",");
        // Chỉ gọi filterProducts nếu có bộ lọc hoặc sắp xếp
        if (
          searchValue ||
          selectedCategories.size > 0 ||
          priceRange[0] > 0 ||
          priceRange[1] < 999999999 ||
          sortKey // Kiểm tra nếu có sắp xếp
        ) {
          await filterProducts(
            searchValue,
            checked,
            priceRangeStr,
            sortKey || "createdAt", // Mặc định sắp xếp theo createdAt nếu không có sortKey
            sortOrder,
            limit,
            page
          );
        } else {
          await fetchAllProducts(page, limit, sortKey, sortOrder);
        }
        console.log("Dữ liệu đã lấy:", {
          page,
          limit,
          totalProducts,
          totalPages,
        });
      } catch (err) {
        console.error("Lỗi khi lấy sản phẩm:", err);
        setErrorMess(err.message || "Lỗi khi lấy sản phẩm");
      }
    };
    fetchData();
  }, [
    page,
    limit,
    selectedCategories,
    priceRange,
    searchValue,
    sortKey,
    sortOrder,
    fetchAllProducts,
    filterProducts,
  ]);

  // Hiển thị modal lỗi nếu có lỗi
  useEffect(() => {
    if (productError || categoryError || errorMess) {
      onOpen();
    }
  }, [productError, categoryError, errorMess, onOpen]);

  // Xóa thông báo lỗi khi đóng modal
  useEffect(() => {
    if (!isOpen && errorMess) {
      setErrorMess("");
    }
  }, [isOpen]);

  // Debounced tìm kiếm
  const debouncedSetFilterValue = useMemo(
    () => debounce((value) => setSearchValue(value), 200),
    []
  );

  // Xử lý thay đổi input tìm kiếm
  const handleInputChange = (value) => {
    setInputValue(value);
    setPage(1); // Reset về trang 1 khi tìm kiếm
    debouncedSetFilterValue(value);
  };

  // Xóa bộ lọc
  const clearFilters = () => {
    setSelectedCategories(new Set());
    setPriceRange([0, 999999999]);
    setSearchValue("");
    setInputValue("");
    setSortKey(null); // Xóa trạng thái sắp xếp
    setSortOrder("asc");
    setPage(1);
  };

  // Xử lý sắp xếp
  const handleSort = async (newSortKey, newSortOrder) => {
    try {
      if (newSortKey !== sortKey || newSortOrder !== sortOrder) {
        setSortKey(newSortKey);
        setSortOrder(newSortOrder);
        setPage(1); // Reset về trang 1
        setLimit(5); // Đảm bảo limit nhất quán
        const checked = [...selectedCategories].join(",");
        const priceRangeStr = priceRange.join(",");
        await filterProducts(
          searchValue,
          checked,
          priceRangeStr,
          newSortKey,
          newSortOrder,
          limit, // Sử dụng limit đã cập nhật
          page // Sử dụng page đã cập nhật
        );
      }
    } catch (err) {
      setErrorMess(err.message || "Lỗi khi sắp xếp dữ liệu");
    }
  };

  // Xử lý thêm sản phẩm
  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      if (addImages.length > 5) {
        setErrorMess("Sản phẩm chỉ được tối đa 5 ảnh!");
        return;
      }
      const uploadResponse = await uploadProductImages(addImages);
      const imageUrls = uploadResponse.map((image) => image.url);

      const productData = {
        name: addName,
        description: addDescription,
        price: parseFloat(addPrice),
        category: addCategory,
        countInStock: parseInt(addCountInStock),
        brand: addBrand,
        images: imageUrls,
      };

      await addProduct(productData);

      toastCustom({
        title: "Thành công",
        description: "Thêm sản phẩm thành công!",
      });

      setAddModalOpen(false);
      setAddName("");
      setAddDescription("");
      setAddPrice("");
      setAddCategory("");
      setAddCountInStock("");
      setAddBrand("");
      setAddImages([]);

      // Làm mới danh sách sản phẩm với bộ lọc hiện tại
      const checked = [...selectedCategories].join(",");
      const priceRangeStr = priceRange.join(",");
      if (
        searchValue ||
        selectedCategories.size > 0 ||
        priceRange[0] > 0 ||
        priceRange[1] < 999999999 ||
        sortKey
      ) {
        await filterProducts(
          searchValue,
          checked,
          priceRangeStr,
          sortKey || "createdAt",
          sortOrder,
          limit,
          page
        );
      } else {
        await fetchAllProducts(page, limit, sortKey, sortOrder);
      }
    } catch (err) {
      toastCustom({
        title: "Lỗi",
        error: err.message || "Lỗi khi thêm sản phẩm",
      });
    }
  };

  // Xử lý cập nhật sản phẩm
  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    if (!selectedItem) {
      toastCustom({
        title: "Lỗi",
        error: "Không có sản phẩm nào được chọn",
      });
      return;
    }
    try {
      if (editImages.length > 5) {
        setErrorMess("Sản phẩm chỉ được tối đa 5 ảnh!");
        return;
      }
      const existingImages = selectedItem.images || [];
      const isNewImageAdded = editImages.some(
        (img) => !existingImages.includes(img)
      );
      let finalImages = [...editImages];

      if (isNewImageAdded) {
        const newImageFiles = editImages.filter(
          (img) => typeof img !== "string"
        );
        if (newImageFiles.length > 0) {
          const uploaded = await uploadProductImages(newImageFiles);
          finalImages = [
            ...editImages.filter((img) => typeof img === "string"),
            ...uploaded.map((u) => u.url),
          ];
        }
      }

      const updatedData = {
        name: editName,
        description: editDescription,
        price: parseFloat(editPrice),
        category: editCategory,
        countInStock: parseInt(editCountInStock),
        brand: editBrand,
        images: finalImages,
      };

      await updateProduct(selectedItem._id, updatedData);

      toastCustom({
        title: "Thành công",
        description: "Cập nhật sản phẩm thành công!",
      });

      setEditModalOpen(false);
      setEditName("");
      setEditDescription("");
      setEditPrice("");
      setEditCategory("");
      setEditCountInStock("");
      setEditBrand("");
      setEditImages([]);
      setSelectedItem(null);

      // Làm mới danh sách sản phẩm với bộ lọc hiện tại
      const checked = [...selectedCategories].join(",");
      const priceRangeStr = priceRange.join(",");
      if (
        searchValue ||
        selectedCategories.size > 0 ||
        priceRange[0] > 0 ||
        priceRange[1] < 999999999 ||
        sortKey
      ) {
        await filterProducts(
          searchValue,
          checked,
          priceRangeStr,
          sortKey || "createdAt",
          sortOrder,
          limit,
          page
        );
      } else {
        await fetchAllProducts(page, limit, sortKey, sortOrder);
      }
    } catch (err) {
      toastCustom({
        title: "Lỗi",
        error: err.message || "Lỗi khi cập nhật sản phẩm",
      });
    }
  };

  // Xử lý xóa sản phẩm
  const handleDeleteProduct = async () => {
    if (!selectedItem) return;
    try {
      await removeProduct(selectedItem._id);

      toastCustom({
        title: "Thành công",
        description: "Xóa sản phẩm thành công!",
      });

      setDeleteModalOpen(false);
      setSelectedItem(null);

      // Làm mới danh sách sản phẩm với bộ lọc hiện tại
      const checked = [...selectedCategories].join(",");
      const priceRangeStr = priceRange.join(",");
      if (
        searchValue ||
        selectedCategories.size > 0 ||
        priceRange[0] > 0 ||
        priceRange[1] < 999999999 ||
        sortKey
      ) {
        await filterProducts(
          searchValue,
          checked,
          priceRangeStr,
          sortKey || "createdAt",
          sortOrder,
          limit,
          page
        );
      } else {
        await fetchAllProducts(page, limit, sortKey, sortOrder);
      }
    } catch (err) {
      toastCustom({
        title: "Lỗi",
        error: err.message || "Lỗi khi xóa sản phẩm",
      });
    }
  };

  return (
    <div className="p-6">
      <CustomModal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        title="Lỗi!"
        message={productError || categoryError || errorMess}
      />

      {/* Modal cho Thêm */}
      <Modal isOpen={addModalOpen} onClose={() => setAddModalOpen(false)}>
        <ModalContent>
          <ModalHeader>Thêm sản phẩm</ModalHeader>
          <ModalBody>
            <Form
              encType="multipart/form-data"
              className="space-y-4"
              method="post"
              onSubmit={handleAddProduct}
            >
              <Input
                isRequired
                label="Tên sản phẩm"
                value={addName}
                onChange={(e) => setAddName(e.target.value)}
                placeholder="Nhập tên sản phẩm"
              />
              <Textarea
                label="Mô tả"
                value={addDescription}
                onChange={(e) => setAddDescription(e.target.value)}
                placeholder="Nhập mô tả sản phẩm"
              />
              <Input
                isRequired
                label="Giá"
                type="number"
                value={addPrice}
                onChange={(e) => setAddPrice(e.target.value)}
                placeholder="Nhập giá sản phẩm"
                min="0"
              />
              <Select
                isRequired
                className="max-w-xs"
                label="Danh mục"
                fullWidth
                selectedKeys={addCategory ? [addCategory] : []}
                onSelectionChange={(keys) =>
                  setAddCategory(Array.from(keys)[0])
                }
                isLoading={categoryLoading}
              >
                {categories.map((cat) => (
                  <SelectItem key={cat._id}>{cat.name}</SelectItem>
                ))}
              </Select>
              <Input
                isRequired
                label="Số lượng tồn kho"
                type="number"
                value={addCountInStock}
                onChange={(e) => setAddCountInStock(e.target.value)}
                placeholder="Nhập số lượng tồn kho"
                min="0"
              />
              <Input
                isRequired
                label="Thương hiệu"
                value={addBrand}
                onChange={(e) => setAddBrand(e.target.value)}
                placeholder="Nhập thương hiệu"
              />
              <ImagePreviewSection
                editImage={addImages}
                setEditImage={setAddImages}
                isArray={true}
              />
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

      {/* Modal cho Sửa */}
      <Modal
        size={"3xl"}
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
      >
        <ModalContent>
          <ModalHeader id="editProduct">Chỉnh sửa sản phẩm</ModalHeader>
          <ModalBody>
            <div className="w-full flex flex-col md:flex-row gap-4">
              <div className="w-full">
                <Form
                  encType="multipart/form-data"
                  className="space-y-4"
                  method="put"
                  onSubmit={handleUpdateProduct}
                >
                  <Input
                    isRequired
                    label="Tên sản phẩm"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="Nhập tên sản phẩm"
                  />
                  <Textarea
                    label="Mô tả"
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    placeholder="Nhập mô tả sản phẩm"
                  />
                  <Input
                    isRequired
                    label="Giá"
                    type="number"
                    value={editPrice}
                    onChange={(e) => setEditPrice(e.target.value)}
                    placeholder="Nhập giá sản phẩm"
                    min="0"
                  />
                  <Select
                    isRequired
                    className="max-w-xs"
                    label="Danh mục"
                    fullWidth
                    selectedKeys={
                      selectedCategoryId ? [selectedCategoryId] : []
                    }
                    onSelectionChange={(keys) =>
                      setEditCategory(Array.from(keys)[0])
                    }
                    isLoading={categoryLoading}
                  >
                    {categories.map((cat) => (
                      <SelectItem key={cat._id}>{cat.name}</SelectItem>
                    ))}
                  </Select>
                  <Input
                    isRequired
                    label="Số lượng tồn kho"
                    type="number"
                    value={editCountInStock}
                    onChange={(e) => setEditCountInStock(e.target.value)}
                    placeholder="Nhập số lượng tồn kho"
                    min="0"
                  />
                  <Input
                    isRequired
                    label="Thương hiệu"
                    value={editBrand}
                    onChange={(e) => setEditBrand(e.target.value)}
                    placeholder="Nhập thương hiệu"
                  />
                  <ImagePreviewSection
                    editImage={editImages}
                    setEditImage={setEditImages}
                    isArray={true}
                  />
                  <div className="flex flex-row gap-2">
                    <Button
                      variant="flat"
                      onPress={() => setEditModalOpen(false)}
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

      {/* Modal cho Xóa */}
      <DeleteModal
        isOpen={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        onDelete={handleDeleteProduct}
        itemName={selectedItem?.name}
      />

      <h1 className="text-2xl font-semibold mb-4">Quản lý sản phẩm</h1>

      <TopContent
        filterValue={inputValue}
        setFilterValue={handleInputChange}
        visibleColumns={visibleColumns}
        setVisibleColumns={setVisibleColumns}
        limit={limit}
        setLimit={setLimit}
        setPage={setPage}
        columns={columns}
        onAddNew={() => setAddModalOpen(true)}
      />

      {/* Bộ lọc */}
      <div className="flex flex-col gap-4">
        {/* Bộ lọc danh mục */}
        <div className="flex gap-2 items-center">
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
                setPage(1);
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
                        setPage(1);
                      }}
                    >
                      {category.name}
                    </Chip>
                  )
                );
              })}
            </div>
          )}
        </div>

        {/* Thanh kéo giá */}
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
              setPage(1);
            }}
            label="Khoảng giá"
          />
        </div>

        {/* Nút xóa bộ lọc */}
        {(selectedCategories.size > 0 ||
          priceRange[0] > 0 ||
          priceRange[1] < 999999999) && (
          <Button variant="flat" color="danger" onPress={clearFilters}>
            Xóa bộ lọc
          </Button>
        )}
      </div>

      <TableComponent
        items={products.map((item, index) => ({
          ...item,
          index: (page - 1) * limit + index + 1,
          category: item.category?.name || item.category,
        }))}
        columns={columns}
        page={page}
        setPage={setPage}
        limit={limit}
        totalPages={totalPages}
        visibleColumns={visibleColumns}
        onEdit={(product) => {
          const originalProduct = products.find((p) => p._id === product._id);
          setSelectedItem(product);
          setEditName(product.name);
          setEditDescription(product.description);
          setEditPrice(product.price);
          setEditCategory(originalProduct?.category?._id || null);
          setEditCountInStock(product.countInStock);
          setEditBrand(product.brand);
          setEditImages(product.images);
          setEditModalOpen(true);
        }}
        onDelete={(product) => {
          setSelectedItem(product);
          setDeleteModalOpen(true);
        }}
        isLoading={productLoading || categoryLoading}
        isSorting
        onSort={handleSort}
      />
    </div>
  );
}
