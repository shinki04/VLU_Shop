import { create } from "zustand";
import axios from "axios";
import { toastCustom } from "../hooks/toastCustom";


// const CART_API =
//   import.meta.env.MODE === "development"
//     ? "http://localhost:3000/api/cart"
//     : "/api/cart";

    const CART_API = import.meta.env.VITE_API_URL || "http://localhost:3000";

const useCartStore = create((set, get) => ({
  items: [],
  isLoading: false,
  error: null,
  page: 1,
  limit: 5,
  totalItems: 0,
  totalPages: 0,

  // Tính toán các số tiền
  get subtotal() {
    return get().items.reduce((total, item) => total + item.price * item.quantity, 0);
  },

  get shippingPrice() {
    const subtotal = get().subtotal;
    return subtotal > 1000000 ? 0 : 30000;
  },

  get taxPrice() {
    return Math.round(get().subtotal * 0.1);
  },

  get totalPrice() {
    return get().subtotal + get().shippingPrice + get().taxPrice;
  },

  // Lấy giỏ hàng
  getCart: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get(`${CART_API}/api/cart`);
      set({ items: response.data.items, isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        error: error.response?.data?.message || "Lỗi khi lấy giỏ hàng",
      });
    }
  },

  // Thêm sản phẩm vào giỏ hàng
  addToCart: async ({ productId, quantity }) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(`${CART_API}/api/cart/add`, {
        productId,
        quantity,
      });
      set({ items: response.data.items, isLoading: false });
      toastCustom({
        title: "success",
        description: "Đã thêm sản phẩm vào giỏ hàng",
      });
    } catch (error) {
      set({
        isLoading: false,
        error: error.response?.data?.message || "Lỗi khi thêm sản phẩm vào giỏ hàng",
      });
      toastCustom({
        title: "error",
        description: error.response?.data?.message || "Lỗi khi thêm sản phẩm vào giỏ hàng",
      });
    }
  },

  // Cập nhật số lượng sản phẩm
  updateCart: async ({ productId, quantity }) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.put(`${CART_API}/api/cart/update`, {
        productId,
        quantity,
      });
      set({ items: response.data.items, isLoading: false });
      toastCustom({
        title: "success",
        description: "Đã cập nhật giỏ hàng",
      });
    } catch (error) {
      set({
        isLoading: false,
        error: error.response?.data?.message || "Lỗi khi cập nhật giỏ hàng",
      });
      toastCustom({
        title: "error",
        description: error.response?.data?.message || "Lỗi khi cập nhật giỏ hàng",
      });
    }
  },

  // Xóa sản phẩm khỏi giỏ hàng
  deleteFromCart: async (productId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.delete(`${CART_API}/api/cart/${productId}`);
      set({ items: response.data.items, isLoading: false });
      toastCustom({
        title: "success",
        description: "Đã xóa sản phẩm khỏi giỏ hàng",
      });
    } catch (error) {
      set({
        isLoading: false,
        error: error.response?.data?.message || "Lỗi khi xóa sản phẩm khỏi giỏ hàng",
      });
      toastCustom({
        title: "error",
        description: error.response?.data?.message || "Lỗi khi xóa sản phẩm khỏi giỏ hàng",
      });
    }
  },

  // Xóa toàn bộ giỏ hàng
  clearCart: async () => {
    set({ isLoading: true, error: null });
    try {
      await axios.delete(`${CART_API}/api/cart`);
      set({ items: [], isLoading: false });
      toastCustom({
        title: "success",
        description: "Đã xóa toàn bộ giỏ hàng",
      });
    } catch (error) {
      set({
        isLoading: false,
        error: error.response?.data?.message || "Lỗi khi xóa giỏ hàng",
      });
      toastCustom({
        title: "error",
        description: error.response?.data?.message || "Lỗi khi xóa giỏ hàng",
      });
    }
  },

  // Xóa lỗi
  clearError: () => set({ error: null }),

  // Lấy giỏ hàng có phân trang
  fetchCart: async (page = 1, limit = 5) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get(`${CART_API}/api/cart`, {
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
  updateItemQuantity: async (productId, quantity) => {
    set({ isLoading: true, error: null });
    try {
      const currentItems = get().items;
      const updatedItems = currentItems.map(item => {
        if (item.product._id === productId) {
          return {
            ...item,
            quantity: quantity
          };
        }
        return item;
      });
      
      const response = await axios.put(`${CART_API}/api/cart/update`, { items: updatedItems });
      
      // Kết hợp dữ liệu mới với URL ảnh từ state hiện tại
      const processedItems = response.data.cart.items.map(newItem => {
        const currentItem = currentItems.find(item => item.product._id === newItem.product._id);
        return {
          ...newItem,
          product: {
            ...newItem.product,
            image: currentItem?.product?.image || newItem.product.image
          }
        };
      });
      
      set({
        items: processedItems,
        isLoading: false,
      });
      return processedItems;
    } catch (error) {
      set({
        isLoading: false,
        error: error.response?.data.message || error.message,
      });
      throw error;
    }
  },
}));

export default useCartStore;
