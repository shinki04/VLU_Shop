import { create } from "zustand";
import axios from "axios";
import { toastCustom } from "../hooks/toastCustom";

const CART_API = import.meta.env.VITE_API_URL || "http://localhost:3000";

// Cấu hình axios để gửi cookie
axios.defaults.withCredentials = true;

const useCartStore = create((set, get) => ({
  items: [],
  isLoading: false,
  error: null,
  page: 1,
  limit: 5,
  totalItems: 0,
  totalPages: 0,

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

  addToCart: async ({ productId, quantity }) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(`${CART_API}/api/cart/add`, {
        productId,
        quantity,
      });
      set({ items: response.data.items, isLoading: false });
     
    } catch (error) {
      set({
        isLoading: false,
        error: error.response?.data?.message || "Lỗi khi thêm sản phẩm vào giỏ hàng",
      });
    
    }
  },

  updateCart: async ({ items }) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.put(`${CART_API}/api/cart/update`, { items });
      set({ items: response.data.cart.items, isLoading: false });
     
    } catch (error) {
      set({
        isLoading: false,
        error: error.response?.data?.message || "Lỗi khi cập nhật giỏ hàng",
      });
      
    }
  },

  deleteFromCart: async (productId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.delete(`${CART_API}/api/cart`, {
        data: { productIds: [productId] }, // Gửi productIds trong body
      });
      set({ items: response.data.cart.items, isLoading: false }); // Sửa để lấy cart.items
    
    } catch (error) {
      set({
        isLoading: false,
        error: error.response?.data?.message || "Lỗi khi xóa sản phẩm khỏi giỏ hàng",
      });
    
    }
  },

  clearCart: async () => {
    set({ isLoading: true, error: null });
    try {
      await axios.delete(`${CART_API}/api/cart`);
      set({ items: [], isLoading: false });
      
    } catch (error) {
      set({
        isLoading: false,
        error: error.response?.data?.message || "Lỗi khi xóa giỏ hàng",
      });
     
    }
  },

  clearError: () => set({ error: null }),

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

  updateItemQuantity: async (productId, quantity) => {
    set({ isLoading: true, error: null });
    try {
      const currentItems = get().items;
      const updatedItems = currentItems.map(item => {
        if (item.product._id === productId) {
          return {
            product: item.product._id,
            quantity: quantity,
          };
        }
        return {
          product: item.product._id,
          quantity: item.quantity,
        };
      });
      
      const response = await axios.put(`${CART_API}/api/cart/update`, { items: updatedItems });
      
      const processedItems = response.data.cart.items.map(newItem => {
        const currentItem = currentItems.find(item => item.product._id === newItem.product._id);
        return {
          ...newItem,
          product: {
            ...newItem.product,
            image: currentItem?.product?.image || newItem.product.image,
          },
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