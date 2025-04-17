import { create } from "zustand";
import axios, { all } from "axios";

const REVIEW_API =
  import.meta.env.MODE === "development"
    ? "http://localhost:3000/api/reviews"
    : "/api/reviews";

// Ensure axios sends cookies with requests
axios.defaults.withCredentials = true;

const useReviewStore = create((set, get) => ({
  reviews: [],
  userReviews: [],
  allReviews: [],
  searchedProducts: [],
  isLoading: false,
  error: null,
  message: null,
  totalReviews: 0,
  totalPages: 1,
  currentPage: 1,

  // Clear error and success messages
  clearError: () => set({ error: null, message: null }),

  // Add a review for a product
  addReview: async (productId, reviewData) => {
    set({ isLoading: true, error: null, message: null });
    try {
      const response = await axios.post(
        `${REVIEW_API}/${productId}`,
        reviewData
      );
      set({
        reviews: response.data.review,
        userReviews: response.data.review,
        allReviews: response.data.reviews,
        totalReviews: response.data.numReviews,

        message: "Thêm đánh giá thành công",
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error.response?.data?.message || "Lỗi khi thêm đánh giá",
        isLoading: false,
      });
      throw error;
    }
  },

  // Update a review for a product
  updateReview: async (productId, reviewData) => {
    set({ isLoading: true, error: null, message: null });
    try {
      const response = await axios.put(
        `${REVIEW_API}/${productId}`,
        reviewData
      );
      set({
        reviews: response.data.review
          ? get().reviews.map((r) =>
              r._id === response.data.review._id ? response.data.review : r
            )
          : get().reviews,
        userReviews: response.data.review
          ? get().userReviews.map((r) =>
              r._id === response.data.review._id ? response.data.review : r
            )
          : get().userReviews,
        message: "Cập nhật đánh giá thành công",
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error.response?.data?.message || "Lỗi khi cập nhật đánh giá",
        isLoading: false,
      });
      throw error;
    }
  },

  // Get reviews for a specific product
  getProductReviews: async (productId) => {
    set({ isLoading: true, error: null, message: null });
    try {
      const response = await axios.get(`${REVIEW_API}/${productId}`);
      set({
        reviews: response.data.reviews,
        totalReviews: response.data.numReviews,
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error.response?.data?.message || "Lỗi khi lấy đánh giá sản phẩm",
        isLoading: false,
      });
      throw error;
    }
  },

  // Delete a review for a product
  deleteReview: async (productId) => {
    set({ isLoading: true, error: null, message: null });
    try {
      const response = await axios.delete(`${REVIEW_API}/${productId}`);
      set({
        reviews: get().reviews.filter((r) => r.product !== productId),
        userReviews: get().userReviews.filter((r) => r.product !== productId),
        message: "Xóa đánh giá thành công",
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error.response?.data?.message || "Lỗi khi xóa đánh giá",
        isLoading: false,
      });
      throw error;
    }
  },

  // Get all reviews for the authenticated user
  getUserReviews: async (page = 1, limit = 10) => {
    set({ isLoading: true, error: null, message: null });
    try {
      const response = await axios.get(`${REVIEW_API}/user`, {
        params: { page, limit },
      });
      set({
        userReviews: response.data.reviews,
        totalReviews: response.data.totalReviews,
        totalPages: response.data.totalPages,
        currentPage: response.data.currentPage,
        isLoading: false,
      });
    } catch (error) {
      set({
        error:
          error.response?.data?.message ||
          "Lỗi khi lấy đánh giá của người dùng",
        isLoading: false,
      });
      throw error;
    }
  },

  // Get all reviews (admin or general use) with optional keyword search
  getAllReviews: async (page = 1, limit = 10, keyword = "") => {
    set({ isLoading: true, error: null, message: null });
    try {
      const response = await axios.get(`${REVIEW_API}`, {
        params: { page, limit, keyword },
      });
      set({
        allReviews: response.data.reviews,
        totalReviews: response.data.totalReviews,
        totalPages: response.data.totalPages,
        currentPage: response.data.currentPage,
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error.response?.data?.message || "Lỗi khi lấy tất cả đánh giá",
        isLoading: false,
      });
      throw error;
    }
  },

  // Search products with average rating
  searchProductsWithAvgRating: async ({
    productIds,
    ratingRange = "0,5", // Chuỗi "min,max"
    keyword,
    page = 1,
    limit = 10,
    sortKey = "",
    sortOrder = "asc",
  }) => {
    set({ isLoading: true, error: null, message: null });
    try {
      const response = await axios.get(`${REVIEW_API}/filter`, {
        params: {
          productids: productIds?.join(","), // Chuyển đổi mảng thành chuỗi
          ratingRange, // Gửi trực tiếp chuỗi "min,max"
          keyword,
          page,
          limit,
          sortKey,
          sortOrder,
        },
      });
      set({
        searchedProducts: response.data.products,
        totalReviews: response.data.totalProducts,
        totalPages: response.data.totalPages,
        currentPage: response.data.currentPage,
        isLoading: false,
        
      });
      return response.data;
    } catch (error) {
      set({
        error: error.response?.data?.message || "Lỗi khi tìm kiếm sản phẩm",
        isLoading: false,
      });
      throw error;
    }
  },

}));

export default useReviewStore;
