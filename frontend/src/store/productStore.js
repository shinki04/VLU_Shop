import { create } from "zustand";
// import { persist } from "zustand/middleware";
import axios from "axios";

const PRODUCT_API =
  import.meta.env.MODE === "development"
    ? "http://localhost:3000/api/products"
    : "/api/products";

const useProductStore = create((set) => ({
  products: [],
  product: null,
  isLoading: false,
  error: null,
  total: 0,
  page: 1,
  limit: 5,

  clearError: () => set({ error: null }),

  // Thêm sản phẩm mới
  addProduct: async (productData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(`${PRODUCT_API}`, productData);
      set((state) => ({
        products: [...state.products, response.data.product],
        isLoading: false,
      }));
    } catch (error) {
      set({
        isLoading: false,
        error: error.response?.data.message || error.message,
      });
    }
  },

  // Cập nhật sản phẩm
  updateProduct: async (productId, updatedData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.put(
        `${PRODUCT_API}/${productId}`,
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
    }
  },

  // Xóa sản phẩm
  removeProduct: async (productId) => {
    set({ isLoading: true, error: null });
    try {
      await axios.delete(`${PRODUCT_API}/${productId}`);
      set((state) => ({
        products: state.products.filter((prod) => prod._id !== productId),
        isLoading: false,
      }));
    } catch (error) {
      set({
        isLoading: false,
        error: error.response?.data.message || error.message,
      });
    }
  },

  // Lấy sản phẩm theo ID
  fetchProductById: async (productId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get(`${PRODUCT_API}/${productId}`);
      set({ product: response.data.product, isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        error: error.response?.data.message || error.message,
      });
    }
  },

  // Lấy tất cả sản phẩm với phân trang
  fetchAllProducts: async (page = 1, limit = 10) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get(`${PRODUCT_API}`, {
        params: { page, limit },
      });
      set({ products: response.data.products, isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        error: error.response?.data.message || error.message,
      });
    }
  },

  // Lọc sản phẩm
  filterProducts: async (filters) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get(`${PRODUCT_API}/filter`, {
        params: filters,
      });
      set({ products: response.data.products, isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        error: error.response?.data.message || error.message,
      });
    }
  },

  // Lấy sản phẩm mới nhất
  fetchNewProducts: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get(`${PRODUCT_API}/new`);
      set({ products: response.data.products, isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        error: error.response?.data.message || error.message,
      });
    }
  },
}));

export default useProductStore;
