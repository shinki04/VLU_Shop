import { create } from 'zustand';
import axios from 'axios';

const REVIEW_API =
  import.meta.env.MODE === 'development'
    ? 'http://localhost:3000/api/reviews'
    : '/api/reviews';

// Ensure axios sends cookies with requests
axios.defaults.withCredentials = true;

const useReviewStore = create((set) => ({
  reviews: [],
  userReviews: [],
  allReviews: [],
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
      const response = await axios.post(`${REVIEW_API}/${productId}`, reviewData);
      set({ message: response.data.message, isLoading: false });
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Error adding review',
        isLoading: false,
      });
      throw error;
    }
  },

  // Update a review for a product
  updateReview: async (productId, reviewData) => {
    set({ isLoading: true, error: null, message: null });
    try {
      const response = await axios.put(`${REVIEW_API}/${productId}`, reviewData);
      set({
        reviews: response.data.review
          ? [
              ...useReviewStore.getState().reviews.filter((r) => r._id !== response.data.review._id),
              response.data.review,
            ]
          : useReviewStore.getState().reviews,
        message: response.data.message,
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Error updating review',
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
        error: error.response?.data?.message || 'Error fetching product reviews',
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
        reviews: useReviewStore.getState().reviews.filter((r) => r.product !== productId),
        userReviews: useReviewStore.getState().userReviews.filter((r) => r.product !== productId),
        message: response.data.message,
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Error deleting review',
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
        error: error.response?.data?.message || 'Error fetching user reviews',
        isLoading: false,
      });
      throw error;
    }
  },

  // Get all reviews (admin or general use) with optional keyword search
  getAllReviews: async (page = 1, limit = 10, keyword = '') => {
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
        error: error.response?.data?.message || 'Error fetching all reviews',
        isLoading: false,
      });
      throw error;
    }
  },
}));

export default useReviewStore;