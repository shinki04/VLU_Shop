import { create } from "zustand";
// import { persist } from "zustand/middleware";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

// const PRODUCT_API =
//   import.meta.env.MODE === "development"
//     ? "http://localhost:3000/api/products"
//     : "/api/products";

// const UPLOAD_URL =
//   import.meta.env.MODE === "development"
//     ? "http://localhost:3000/api/upload"
//     : "/api/upload";

    const PRODUCT_API = import.meta.env.VITE_API_URL || "http://localhost:3000";
    const UPLOAD_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const useProductStore = create((set) => ({
  products: [],
  product: null,
  isLoading: false,
  error: null,
  totalProducts: 0,
  page: 1,
  limit: 5,
  // totalPages: 0,
  sortBy: null,
  sortOrder: "desc",

  clearError: () => set({ error: null }),

  // Thêm sản phẩm mới
  addProduct: async (productData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(`${PRODUCT_API}/api/products`, productData);
      set((state) => ({
        products: [...state.products, response.data.product],
        isLoading: false,
      }));
    } catch (error) {
      set({
        isLoading: false,
        error:
          error.response?.data.message || error.message || "Error add data",
      });
      throw error;
    }
  },

  // Cập nhật sản phẩm
  updateProduct: async (productId, updatedData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.put(
        `${PRODUCT_API}/api/products/${productId}`,
        updatedData
      );
      set((state) => ({
        products: state.products.map((prod) =>
          prod._id === response.data.product._id ? response.data.product : prod
        ),
        isLoading: false,
      }));
    } catch (error) {
      set({
        isLoading: false,
        error: error.response?.data.message || error.message,
      });
      throw error;
    }
  },

  // Xóa sản phẩm
  removeProduct: async (productId) => {
    set({ isLoading: true, error: null });
    try {
      await axios.delete(`${PRODUCT_API}/api/products/${productId}`);
      set((state) => ({
        products: state.products.filter((prod) => prod._id !== productId),
        isLoading: false,
      }));
    } catch (error) {
      set({
        isLoading: false,
        error: error.response?.data.message || error.message,
      });
      throw error;
    }
  },

  // Lấy sản phẩm theo ID
  fetchProductById: async (productId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get(`${PRODUCT_API}/api/products/${productId}`);
      set({ product: response.data.product, isLoading: false });
      return response.data.product;
    } catch (error) {
      set({
        isLoading: false,
        error: error.response?.data.message || error.message,
      });
      throw error;
    }
  },

  // Lấy tất cả sản phẩm với phân trang
  fetchAllProducts: async (page = 1, limit = 10) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get(`${PRODUCT_API}/api/products`, {
        params: { page, limit },
      });
      set({
        products: response.data.products,
        totalProducts: response.data.totalProducts,
        page: response.data.page,
        limit: response.data.limit,
        isLoading: false,
      });
    } catch (error) {
      set({
        isLoading: false,
        error: error.response?.data.message || error.message,
      });
      throw error;
    }
  },

  // Lọc sản phẩm
  filterProducts: async (
    searchValue,
    checked,
    priceRange,
    sortBy = null,
    sortOrder = "desc",
    limit,
    page
  ) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get(`${PRODUCT_API}/api/products/filter`, {
        params: {
          search: searchValue, // Điều này giữ nguyên, searchValue là giá trị tìm kiếm
          page, // Thay vì `search`, truyền `page`
          limit, // Lấy giá trị từ `limit`
          sortBy, // Truyền trường sắp xếp
          sortOrder, // Truyền thứ tự sắp xếp
          checked, // Truyền giá trị `checked` cho bộ lọc
          priceRange, // Truyền giá trị `priceRange` cho bộ lọc
        },
      });
      set({ products: response.data.products,
        totalProducts: response.data.totalProducts,
        page: response.data.page,
        limit: response.data.limit,
        sortBy: response.data.sortBy,
        sortOrder: response.data.sortOrder,        
        isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        error: error.response?.data.message || error.message,
      });
      throw error;
    }
  },

  // Lấy sản phẩm mới nhất
  fetchNewProducts: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get(`${PRODUCT_API}/api/products/new`);
      set({ products: response.data.products, isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        error: error.response?.data.message || error.message,
      });
      throw error;
    }
  },

  uploadProductImages: async (images) => {
    set({ isLoading: true, error: null });
    try {
      const formData = new FormData();

      // Append all images to the form data
      images.forEach((image) => {
        formData.append("images", image); // Assumes that the backend expects 'images' as the field name
      });
      // formData.append("images", images);
      // Send multiple images to the backend
      const res = await axios.post(`${UPLOAD_URL}/api/upload?type=multiple`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });

      // Assuming the backend returns an array of image URLs
      const imageUrls = res.data.images; // Backend should return an array of image URLs

      // Update the product with new images

      set({ isLoading: false });

      return imageUrls; // Return the image URLs
    } catch (err) {
      set({
        error: err.response?.data?.message || "Image upload failed",
        isLoading: false,
      });
      throw err;
    }
  },
}));

export default useProductStore;
