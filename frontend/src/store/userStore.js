import { create } from "zustand";
import { persist } from "zustand/middleware";
import axios from "axios";

// const BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:3000";
// const BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:3000";

// const UPLOAD_URL = import.meta.env.VITE_BASE_URL || "http://localhost:3000";

const BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:3000";

axios.defaults.withCredentials = true;

const useUserStore = create(
  persist(
    (set) => ({
      currentUser: null,
      users: [],
      isAuthenticated: false,
      isLoading: false,
      error: null,
      total: 0,
      page: 1,
      limit: 5,
      defaultImage: "/public/uploads/user/avatardefault.webp",
      isCheckingAuth: true,
      message: null,

      clearError: () => set({ error: null }),

      register: async (email, password, username) => {
        set({ isLoading: true, error: null });
        try {
          const response = await axios.post(`${BASE_URL}/api/auth/register`, {
            email,
            password,
            username,
          });
          set({
            user: response.data.user,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          set({
            error: error.response?.data?.message || "Error signing up",
            isLoading: false,
          });
          throw error;
        }
      },

      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const response = await axios.post(`${BASE_URL}/api/auth/login`, {
            email,
            password,
          });
          set({
            user: response.data.user,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          set({
            error: error.response?.data?.message || "Error logging in",
            isLoading: false,
          });
          throw error;
        }
      },

      logout: async () => {
        set({ isLoading: true, error: null });
        try {
          await axios.post(`${BASE_URL}/api/auth/logout`);
          set({ user: null, isAuthenticated: false, isLoading: false });
        } catch (error) {
          set({
            error: error.response?.data?.message || "Error logging out",
            isLoading: false,
          });
          throw error;
        }
      },

      verifyEmail: async (code) => {
        set({ isLoading: true, error: null });
        try {
          const response = await axios.post(`${BASE_URL}/api/auth/verify-email`, {
            code,
          });
          set({
            user: response.data.user,
            isAuthenticated: true,
            isLoading: false,
          });
          return response.data;
        } catch (error) {
          set({
            error: error.response?.data?.message || "Error verifying email",
            isLoading: false,
          });
          throw error;
        }
      },

      checkAuth: async () => {
        set({ isCheckingAuth: true, error: null });
        try {
          const response = await axios.get(`${BASE_URL}/api/auth/check-auth`);
          set({
            user: response.data.user,
            isAuthenticated: true,
            isCheckingAuth: false,
          });
        } catch (error) {
          set({
            error: error.response?.data?.message || "Error checking auth",
            isCheckingAuth: false,
            isAuthenticated: false,
            user: null,
          });
        }
      },

      forgotPassword: async (email) => {
        set({ isLoading: true, error: null });
        try {
          const response = await axios.post(`${BASE_URL}/api/auth/forgot-password`, {
            email,
          });
          set({ message: response.data.message, isLoading: false });
        } catch (error) {
          set({
            isLoading: false,
            error:
              error.response?.data?.message ||
              "Error sending reset password email",
          });
          throw error;
        }
      },

      resetPassword: async (token, password) => {
        set({ isLoading: true, error: null });
        try {
          const response = await axios.post(
            `${BASE_URL}/api/auth/reset-password/${token}`,
            { password }
          );
          set({ message: response.data.message, isLoading: false });
        } catch (error) {
          set({
            isLoading: false,
            error: error.response?.data?.message || "Error resetting password",
          });
          throw error;
        }
      },

      updateProfile: async (data) => {
        set({ isLoading: true, error: null });
        try {
          const res = await axios.put(`${BASE_URL}/api/users/profile`, data);
          set({ currentUser: res.data, user: res.data.user, isLoading: false });
        } catch (err) {
          set({
            error: err.response?.data?.message || "Update profile failed",
            isLoading: false,
          });
          throw err;
        }
      },

      fetchUsers: async (page = 1, limit = 5) => {
        set({ isLoading: true, error: null });
        try {
          const response = await axios.get(
            `${BASE_URL}/api/users?page=${page}&limit=${limit}`
          );
          set({
            users: response.data.users,
            total: response.data.total,
            page: response.data.page,
            limit: response.data.limit,
          });
        } catch (err) {
          set({
            error: err.response?.data?.message || "Fetch users failed",
            isLoading: false,
          });
          throw err;
        } finally {
          set({ isLoading: false });
        }
      },
      getCurrentUser: async () => {
        set({ isLoading: true, error: null });
        try {
          const res = await axios.get(`${BASE_URL}/api/users/profile`);
          set({ currentUser: res.data, user: res.data.user, isLoading: false });
        } catch (err) {
          set({
            error: err.response?.data?.message || "Update profile failed",
            isLoading: false,
          });
          throw err;
        }
      },

      deleteUser: async (userId) => {
        set({ isLoading: true, error: null });
        try {
          await axios.delete(`${BASE_URL}/api/users/${userId}`);
          set((state) => ({
            users: state.users.filter((user) => user._id !== userId),
            isLoading: false,
          }));
        } catch (err) {
          set({
            error: err.response?.data?.message || "Delete user failed",
            isLoading: false,
          });
          throw err;
        }
      },

      getUserDetails: async (userId) => {
        set({ isLoading: true, error: null });
        try {
          const res = await axios.get(`${BASE_URL}/api/users/${userId}`);
          set({ isLoading: false });
          return res.data;
        } catch (err) {
          set({
            error: err.response?.data?.message || "Get user failed",
            isLoading: false,
          });
          return null;
        }
      },

      createUserByAdmin: async (newUser) => {
        set({ isLoading: true, error: null });
        try {
          const res = await axios.post(`${BASE_URL}/api/users`, newUser);
          set((state) => ({
            newUser: [...state.users, res.data],
            isLoading: false,
          }));
        } catch (err) {
          set({
            error: err.response?.data?.message || "Error add data",
            isLoading: false,
          });
          throw err;
        }
      },

      updateUser: async (updatedUser) => {
        set({ isLoading: true, error: null });
        try {
          const res = await axios.put(`${BASE_URL}/api/users/${updatedUser._id}`, {
            username: updatedUser.username,
            role: updatedUser.role,
            isVerified: updatedUser.isVerified,
            image: updatedUser.image,
          });
          set((state) => ({
            users: state.users.map((user) =>
              user._id === updatedUser._id ? res.data : user
            ),
            isLoading: false,
          }));
        } catch (err) {
          set({
            error: err.response?.data?.message || "Update user failed",
            isLoading: false,
          });
          throw err;
        }
      },
      searchUsersByKeyword: async (q, page = 1, limit = 5) => {
        set({ isLoading: true, error: null });
        try {
          const res = await axios.get(`${BASE_URL}/api/users/search`, {
            params: { q, page, limit },
            headers: { "Cache-Control": "no-cache" },
          });
          set({
            users: res.data.users,
            total: res.data.total,
            page: res.data.page,
            limit: res.data.limit,
            isLoading: false,
          });
          return res.data.users;
        } catch (err) {
          set({
            error: err.response?.data?.message || "Search users failed",
            isLoading: false,
          });
          throw err;
        }
      },
        // Upload ảnh
        uploadImage: async (image) => {
          set({ isLoading: true, error: null });
          try {
            const formData = new FormData();
            formData.append("image", image);
            const res = await axios.post(`${BASE_URL}/api/upload/?type=single`, formData, {
              headers: { "Content-Type": "multipart/form-data" },
              withCredentials: true,
            });
            set({ isLoading: false });
            return res.data.images[0].url; // Trả về URL ảnh
          } catch (err) {
            set({
              error: err.response?.data?.message || "Image upload failed",
              isLoading: false,
            });
            throw err;
          }
        },
      }),
    {
      name: "user-storage",
      partialize: (state) => ({
        user: { ...state.user, resetPasswordToken: undefined }, // Exclude resetPasswordToken from persisted state

        isAuthenticated: state.isAuthenticated,
        // users: state.users,
      }),
    }
  )
);

export default useUserStore;
