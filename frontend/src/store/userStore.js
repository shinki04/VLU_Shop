import { create } from "zustand";
import { persist } from "zustand/middleware";
import axios from "axios";

const USERS_URL =
  import.meta.env.MODE === "development"
    ? "http://localhost:3000/api/users"
    : "/api/users";
const API_URL =
  import.meta.env.MODE === "development"
    ? "http://localhost:3000/api/auth"
    : "/api/auth";

const UPLOAD_URL =
  import.meta.env.MODE === "development"
    ? "http://localhost:3000/api/upload"
    : "/api/upload";
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
      defaultImage: "/uploads/user/default.png",
      isCheckingAuth: true,
      message: null,

      clearError: () => set({ error: null }),

      register: async (email, password, username) => {
        set({ isLoading: true, error: null });
        try {
          const response = await axios.post(`${API_URL}/register`, {
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
          const response = await axios.post(`${API_URL}/login`, {
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
          await axios.post(`${API_URL}/logout`);
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
          const response = await axios.post(`${API_URL}/verify-email`, {
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
          const response = await axios.get(`${API_URL}/check-auth`);
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
          const response = await axios.post(`${API_URL}/forgot-password`, {
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
            `${API_URL}/reset-password/${token}`,
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
          const res = await axios.put(`${USERS_URL}/profile`, data);
          set({ currentUser: res.data, isLoading: false });
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
          const res = await axios.get(USERS_URL, {
            params: { page, limit },
          });

          set({
            users: res.data.users,
            total: res.data.total,
            page: res.data.page,
            limit: res.data.limit,
            isLoading: false,
          });
        } catch (err) {
          set({
            error: err.response?.data?.message || "Fetch users failed",
            isLoading: false,
          });
          throw err;
        }
      },

      deleteUser: async (userId) => {
        set({ isLoading: true, error: null });
        try {
          await axios.delete(`${USERS_URL}/${userId}`);
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
          const res = await axios.get(`${USERS_URL}/${userId}`);
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
          const res = await axios.post(USERS_URL, newUser);
          set((state) => ({
            newUser: [...state.newUser, res.data],
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
          const res = await axios.put(`${USERS_URL}/${updatedUser._id}`, {
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
          const res = await axios.get(`${USERS_URL}/search`, {
            params: { q, page, limit },
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
          const res = await axios.post(`${UPLOAD_URL}/?type=single`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
            withCredentials: true,
          });
          set({ isLoading: false });
          return res.data.images[0]; // Trả về URL ảnh
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
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        users: state.users,
      }),
    }
  )
);

export default useUserStore;
