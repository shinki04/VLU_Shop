import { create } from "zustand";
import { persist } from "zustand/middleware";
import axios from "axios";

const USERS_URL =
  import.meta.env.MODE === "development"
    ? "http://localhost:3000/api/users"
    : "/api/users";

const useUserStore = create(
  persist(
    (set) => ({
      user: null,
      users: [],
      isAuthenticated: false,
      isLoading: false,
      error: null,
      total: 0,
      page: 1,
      limit: 5,

      //   login: async (data) => {
      //     set({ isLoading: true, error: null });
      //     try {
      //       const res = await axios.post(`${USERS_URL}/auth`, data);
      //       set({ user: res.data, isAuthenticated: true, isLoading: false });
      //     } catch (err) {
      //       set({
      //         error: err.response?.data?.message || "Login failed",
      //         isLoading: false,
      //       });
      //       throw err;
      //     }
      //   },

      //   logout: async () => {
      //     set({ isLoading: true, error: null });
      //     try {
      //       await axios.post(`${USERS_URL}/logout`);
      //       set({ user: null, isAuthenticated: false, isLoading: false });
      //     } catch (err) {
      //       set({
      //         error: err.response?.data?.message || "Logout failed",
      //         isLoading: false,
      //       });
      //     }
      //   },

      //   register: async (data) => {
      //     set({ isLoading: true, error: null });
      //     try {
      //       const res = await axios.post(USERS_URL, data);
      //       set({ user: res.data, isAuthenticated: true, isLoading: false });
      //     } catch (err) {
      //       set({
      //         error: err.response?.data?.message || "Register failed",
      //         isLoading: false,
      //       });
      //       throw err;
      //     }
      //   },

      updateProfile: async (data) => {
        set({ isLoading: true, error: null });
        try {
          const res = await axios.put(`${USERS_URL}/profile`, data);
          set({ user: res.data, isLoading: false });
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

      updateUser: async (updatedUser) => {
        set({ isLoading: true, error: null });
        try {
          const res = await axios.put(
            `${USERS_URL}/${updatedUser.userId}`,
            updatedUser
          );
          set((state) => ({
            users: state.users.map((user) =>
              user._id === updatedUser.userId ? res.data : user
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
          const res = await axios.post(
            `${USERS_URL}/upload?type=single`,
            formData,
            {
              headers: { "Content-Type": "multipart/form-data" },
              withCredentials: true,
            }
          );
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
      }),
    }
  )
);

export default useUserStore;
