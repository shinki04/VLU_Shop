import React, { useEffect, useState, useMemo, use } from "react";
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
} from "@heroui/react";
import { toastCustom } from "../../hooks/toastCustom";
import { TableComponent } from "../../components/Table/Table";
import { TopContent } from "../../components/Table/TopContent";
import { add, debounce } from "lodash";

const columns = [
  { name: "STT", uid: "index" },
  { name: "Tên sản phẩm", uid: "name" },
  { name: "Ảnh", uid: "images" },
  { name: "Giá", uid: "price" },
  { name: "Danh mục", uid: "category" },
  { name: "Tồn kho", uid: "countInStock" },
  { name: "Hành động", uid: "actions" },
];

const INITIAL_VISIBLE_COLUMNS = [
  "index",
  "name",
  "images",
  "price",
  "category",
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
    total,
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
  const [sortBy, setSortBy] = useState(null);
  const [sortOrder, setSortOrder] = useState("desc");
  const [errorMess, setErrorMess] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [filterValue, setFilterValue] = useState("");
  const totalPages = useMemo(() => Math.ceil(total / limit), [total, limit]);

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


  const currentSelected = categories.some((cat) => cat._id === editCategory)
    ? editCategory
    : categories.some((cat) => cat._id === products.category?._id)
    ? products.category?._id
    : null;
  // Lấy danh mục khi component mount
  useEffect(() => {
    const loadCategories = async () => {
      try {
        await fetchCategories(1, 100); // Lấy tối đa 100 danh mục
      } catch (err) {
        console.error("Error fetching categories:", err);
      }
    };
    loadCategories();
  }, [fetchCategories]);

  // Hiển thị lỗi nếu có (từ product hoặc category store)
  useEffect(() => {
    if (productError || categoryError || errorMess) {
      onOpen();
    }
  }, [productError, categoryError, onOpen, errorMess]);

  useEffect(() => {
    if (!isOpen && errorMess) {
      console.log("Modal closed. Clearing error message.");
      setErrorMess("");
    }
  }, [isOpen]);
  // Lấy dữ liệu sản phẩm
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (filterValue) {
          await filterProducts(
            { search: filterValue },
            null,
            null,
            "desc",
            page,
            limit
          );
        } else {
          await fetchAllProducts(page, limit);
        }
      } catch (err) {
        console.error("Error fetching products:", err);
      }
    };
    fetchData();
  }, [page, limit, filterValue, fetchAllProducts, filterProducts]);

  const debouncedSetFilterValue = useMemo(
    () => debounce((value) => setFilterValue(value), 200),
    []
  );

  const handleInputChange = (value) => {
    setInputValue(value);
    debouncedSetFilterValue(value);
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      console.log(addImages);
      if (addImages.length > 5) {
        setErrorMess("Sản phẩm chỉ được tối đa 5 ảnh!");
        // throw new Error("Sản phẩm chỉ được tối đa 5 ảnh!");
        return;
      }
      // Gọi hàm uploadProductImages để tải ảnh lên và nhận phản hồi
      const uploadResponse = await uploadProductImages(addImages);
      console.log(uploadResponse);

      // Lấy mảng URL ảnh từ phản hồi
      const imageUrls = uploadResponse.map((image) => image.url); // Trích xuất các URL từ mảng ảnh

      console.log(imageUrls);
      const productData = {
        name: addName,
        description: addDescription,
        price: parseFloat(addPrice),
        category: addCategory,
        countInStock: parseInt(addCountInStock),
        brand: addBrand,
        images: imageUrls,
      };
      console.log(productData);

      await addProduct(productData);

      toastCustom({
        title: "Successfully",
        description: "Product added successfully!",
      });

      setAddModalOpen(false);
      setAddName("");
      setAddDescription("");
      setAddPrice("");
      setAddCategory("");
      setAddCountInStock("");
      setAddBrand("");
      setAddImages([]);

      // Refresh danh sách sản phẩm
      await fetchAllProducts(page, limit);
    } catch (err) {
      toastCustom({
        title: "Error",
        error: err.message || "Error adding product",
      });
    }
  };

  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    if (selectedItem) {
      if (editImages.length > 5) {
        setErrorMess("Sản phẩm chỉ được tối đa 5 ảnh!");
        // throw new Error("Sản phẩm chỉ được tối đa 5 ảnh!");
        return;
      }
      try {
        const existingImages = selectedItem.images || [];

        // Check nếu có ảnh mới (ảnh trong editImages mà không có trong existingImages)
        const isNewImageAdded = editImages.some(
          (img) => !existingImages.includes(img)
        );

        let finalImages = [...editImages];

        if (isNewImageAdded) {
          // Tìm các ảnh mới (có thể là File hoặc blob URL nếu dùng input file)
          const newImageFiles = editImages.filter(
            (img) => typeof img !== "string"
          );
          console.log(newImageFiles);

          if (newImageFiles.length > 0) {
            const uploaded = await uploadProductImages(newImageFiles);
            finalImages = [
              ...editImages.filter((img) => typeof img === "string"),
              ...uploaded.map((u) => u.url),
            ];
          }
        }

        console.log(editImages);
        console.log(isNewImageAdded);
        console.log(finalImages);

        // const existingImages = selectedItem.images || [];

        // console.log(editImages);
        // console.log(selectedItem.images);
        // console.log(existingImages);

        // // Lọc ra ảnh mới (kiểu File) chưa có trong danh sách ảnh cũ (kiểu URL)
        // const newImages = editImages.filter(
        //   (img) => typeof img !== "string" && !existingImages.includes(img)
        // );
        // console.log(newImages);

        // let uploadedImages = [];
        // if (newImages.length > 0) {
        //   uploadedImages = await uploadProductImages(newImages);
        // }

        // // Nếu người dùng đã chọn lại toàn bộ ảnh (tức là ảnh kiểu File), dùng ảnh mới
        // // Nếu không có ảnh mới thì giữ ảnh cũ
        // const finalImages =
        //   uploadedImages.length > 0
        //     ? uploadedImages.map((img) => img.url)
        //     : existingImages;

        // const uploadResponse = await uploadProductImages(editImages);
        // console.log(uploadResponse);

        //  // Nếu có ảnh mới, upload ảnh mới và lấy URL
        // if (editImages.length > 0) {
        //   const uploadedImages = await uploadProductImages(editImages);
        //   console.log(uploadedImages);
        // }

        // const imageUrls = uploadResponse.map((image) => image.url); // Trích xuất các URL từ mảng ảnh
        // const imageUrls = editImages.length > 0
        // ? (await uploadProductImages(editImages)).map((image) => image.url)
        // : selectedItem.images;

        // Nếu không có ảnh mới, giữ nguyên ảnh cũ
        // const existingImages = selectedItem.images || []; // Lấy ảnh cũ từ sản phẩm
        // const editImages = imageUrls.length > 0 ? imageUrls : existingImages; // Nếu có ảnh mới, sử dụng ảnh mới, nếu không thì giữ nguyên ảnh cũ

        const updatedData = {
          name: editName,
          description: editDescription,
          price: parseFloat(editPrice),
          category: editCategory,
          countInStock: parseInt(editCountInStock),
          brand: editBrand,
          images: finalImages,
        };
        console.log(updatedData);

        await updateProduct(selectedItem._id, updatedData);

        toastCustom({
          title: "Successfully",
          description: "Product updated successfully!",
        });

        setEditModalOpen(false);
        setEditName("");
        setEditDescription("");
        setEditPrice("");
        setEditCategory("");
        setEditCountInStock("");
        setEditBrand("");
        setEditImages([]);

        // Refresh danh sách sản phẩm
        await fetchAllProducts(page, limit);
      } catch (err) {
        toastCustom({
          title: "Error",
          error: err.message || "Error updating product",
        });
      }
    } else {
      toastCustom({
        title: "No product",
        error: "Error updating product",
      });
    }
  };

  const handleDeleteProduct = async () => {
    try {
      await removeProduct(selectedItem._id);

      toastCustom({
        title: "Successfully",
        description: "Product deleted successfully!",
      });

      setDeleteModalOpen(false);

      // Refresh danh sách sản phẩm
      await fetchAllProducts(page, limit);
    } catch (err) {
      toastCustom({
        title: "Error",
        error: err.message || "Error deleting product",
      });
    }
  };

  return (
    <div className="">
      <CustomModal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        title="Oops!"
        message={productError || categoryError || errorMess}
      />
      {/* Modal cho "Thêm" */}
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
                selectedKeys={[addCategory]}
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

      {/* Modal cho "Sửa" */}
      <Modal
        size={"3xl"}
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
      >
        <ModalContent>
          <ModalHeader id="editProduct">
            <p className="flex flex-col gap-1 leading-relaxed">
              Chỉnh sửa sản phẩm
            </p>
          </ModalHeader>
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
                     selectedKeys={currentSelected ? [currentSelected] : []}
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

      {/* Modal cho "Xóa" */}
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
        onAddNew={setAddModalOpen}
      />

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
          setSelectedItem(product);
          setEditName(product.name);
          setEditDescription(product.description);
          setEditPrice(product.price);
          setEditCategory(product.category?._id || product.category);
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
      />
    </div>
  );
}
