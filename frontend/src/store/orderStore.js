import { create } from "zustand";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

// const ORDER_API =
//   import.meta.env.MODE === "development"
//     ? "http://localhost:3000/api/orders"
//     : "/api/orders";

const ORDER_API = import.meta.env.VITE_API_URL || "http://localhost:3000";

const useOrderStore = create((set, get) => ({
  orders: [],
  order: null,
  isLoading: false,
  error: null,
  totalOrders: 0,
  totalPages: 0,
  page: 1,
  limit: 10,

  // Lấy tất cả đơn hàng (Admin)
  getAllOrders: async (params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get(`${ORDER_API}/api/orders`, { params });
      set({
        orders: response.data.orders,
        totalOrders: response.data.totalOrders,
        totalPages: response.data.totalPages,
        page: response.data.page,
        limit: response.data.limit,
        isLoading: false,
      });
      return response.data;
    } catch (error) {
      set({
        isLoading: false,
        error: error.response?.data?.message || "Lỗi khi lấy tất cả đơn hàng",
      });
      throw error;
    }
  },

  // Lấy đơn hàng của người dùng hiện tại
  getMyOrders: async (page = 1, limit = 10) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get(`${ORDER_API}/api/orders/myorders`, {
        params: { page, limit },
      });
      set({
        orders: response.data.orders,
        totalOrders: response.data.totalOrders,
        totalPages: response.data.totalPages,
        page: response.data.page,
        limit: response.data.limit,
        isLoading: false,
      });
      return response.data;
    } catch (error) {
      set({
        isLoading: false,
        error: error.response?.data?.message || "Lỗi khi lấy đơn hàng của bạn",
      });
      throw error;
    }
  },

  // Lấy chi tiết đơn hàng
  getOrderDetails: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get(`${ORDER_API}/api/orders/${id}`);
      set({ order: response.data.order, isLoading: false });
      return response.data;
    } catch (error) {
      set({
        isLoading: false,
        error: error.response?.data?.message || "Lỗi khi lấy chi tiết đơn hàng",
      });
      throw error;
    }
  },

  // Tạo đơn hàng mới (User)
  createOrder: async (orderData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(`${ORDER_API}/api/orders`, orderData);
      set({ isLoading: false });
      return response.data;
    } catch (error) {
      set({
        isLoading: false,
        error: error.response?.data?.message || "Lỗi khi tạo đơn hàng",
      });
      throw error;
    }
  },

  // Tạo đơn hàng mới (Admin)
  createOrderByAdmin: async (orderData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(
        `${ORDER_API}/api/orders/admin`,
        orderData
      );
      set({ isLoading: false });
      return response.data;
    } catch (error) {
      set({
        isLoading: false,
        error: error.response?.data?.message || "Lỗi khi tạo đơn hàng",
      });
      throw error;
    }
  },

  // Cập nhật đơn hàng
  updateOrder: async (id, orderData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.put(
        `${ORDER_API}/api/orders/${id}`,
        orderData
      );
      set({ isLoading: false });
      return response.data;
    } catch (error) {
      set({
        isLoading: false,
        error: error.response?.data?.message || "Lỗi khi cập nhật đơn hàng",
      });
      throw error;
    }
  },

  // Xóa đơn hàng
  deleteOrder: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.delete(`${ORDER_API}/api/orders/${id}`);
      set({ isLoading: false });
      return response.data;
    } catch (error) {
      set({
        isLoading: false,
        error: error.response?.data?.message || "Lỗi khi xóa đơn hàng",
      });
      throw error;
    }
  },

  // Thanh toán đơn hàng
  payOrder: async (id, paymentResult) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.put(
        `${ORDER_API}/api/orders/${id}/pay`,
        paymentResult
      );
      set({ isLoading: false });
      return response.data;
    } catch (error) {
      set({
        isLoading: false,
        error: error.response?.data?.message || "Lỗi khi thanh toán đơn hàng",
      });
      throw error;
    }
  },

  // Đánh dấu đơn hàng đã giao
  deliverOrder: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.put(
        `${ORDER_API}/api/orders/${id}/deliver`,
        {}
      );
      set({ isLoading: false });
      return response.data;
    } catch (error) {
      set({
        isLoading: false,
        error:
          error.response?.data?.message ||
          "Lỗi khi cập nhật trạng thái giao hàng",
      });
      throw error;
    }
  },

  // Lấy thống kê đơn hàng
  getOrderStats: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get(`${ORDER_API}/api/orders/stats`);
      set({ isLoading: false });
      return response.data;
    } catch (error) {
      set({
        isLoading: false,
        error: error.response?.data?.message || "Lỗi khi lấy thống kê đơn hàng",
      });
      throw error;
    }
  },

  // Clear error
  clearError: () => set({ error: null }),
}));

export default useOrderStore;
