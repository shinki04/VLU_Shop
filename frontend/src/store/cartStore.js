import { create } from "zustand";
import axios from "axios";

const CART_API =
  import.meta.env.MODE === "development"
    ? "http://localhost:3000/api/cart"
    : "/api/cart";

const useCartStore = create((set) => ({
  items: [],
  isLoading: false,
  error: null,
  page: 1,
  limit: 5,
  totalItems: 0,
  totalPages: 0,

  clearError: () => set({ error: null }),

  // Thêm sản phẩm vào giỏ hàng
  addToCart: async ({ productId, quantity }) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(`${CART_API}/add`, { productId, quantity });
      set({
        items: response.data.cart.items,
        isLoading: false,
      });
    } catch (error) {
      set({
        isLoading: false,
        error: error.response?.data.message || error.message,
      });
    }
  },

  // Lấy giỏ hàng có phân trang
  fetchCart: async (page = 1, limit = 5) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get(`${CART_API}`, {
        params: { page, limit },
      });
      set({
        items: response.data.items,
        page: response.data.page,
        limit: response.data.limit,
        totalItems: response.data.totalItems,
        totalPages: response.data.totalPages,
        isLoading: false,
      });
    } catch (error) {
      set({
        isLoading: false,
        error: error.response?.data.message || error.message,
      });
    }
  },

  // Cập nhật giỏ hàng (toàn bộ items)
  updateCart: async (items) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.put(`${CART_API}/update`, { items });
      set({
        items: response.data.cart.items,
        isLoading: false,
      });
    } catch (error) {
      set({
        isLoading: false,
        error: error.response?.data.message || error.message,
      });
    }
  },

  // Xóa sản phẩm khỏi giỏ hàng (hoặc xóa toàn bộ nếu không truyền productIds)
  deleteFromCart: async (productIds = []) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.put(`${CART_API}/delete`, { productIds });
      set({
        items: response.data.cart.items,
        isLoading: false,
      });
    } catch (error) {
      set({
        isLoading: false,
        error: error.response?.data.message || error.message,
      });
    }
  },
}));

export default useCartStore;
