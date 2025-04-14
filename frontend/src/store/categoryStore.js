import { create } from "zustand";
import { persist } from "zustand/middleware";
import axios from "axios";

const CATEGORY_URL =
  import.meta.env.MODE === "development"
    ? "http://localhost:3000/api/category"
    : "/api/category";

const useCategoryStore = create(
  persist(
    (set) => ({
      categories: [],
      isLoading: false,
      error: null,
      total: 0,
      page: 1,
      limit: 5,
      fetchCategories: async (page = 1, limit = 5) => {
        set({ isLoading: true, error: null });
        try {
          const res = await axios.get(`${CATEGORY_URL}/categories`, {
            params: { page, limit },
          });

          set({
            categories: res.data.categories,
            total: res.data.total,
            page: res.data.page,
            limit: res.data.limit,
            isLoading: false,
          });
        } catch (err) {
          set({
            error: err.response?.data?.message || "Error fetch data",
            isLoading: false,
          });
          throw err;
        }
      },
      addCategory: async (newCategory) => {
        set({ isLoading: true, error: null });
        try {
          const res = await axios.post(CATEGORY_URL, newCategory);
          set((state) => ({
            categories: [...state.categories, res.data],
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
      updateCategory: async (updatedCategory) => {
        set({ isLoading: true, error: null });
        try {
          await axios.put(
            `${CATEGORY_URL}/${updatedCategory._id}`,
            updatedCategory
          );
          set((state) => ({
            categories: state.categories.map((cat) =>
              cat._id === updatedCategory._id ? updatedCategory : cat
            ),
            isLoading: false,
          }));
        } catch (err) {
          set({
            error: err.response?.data?.message || "Error update data",
            isLoading: false,
          });
          throw err;
        }
      },
      deleteCategory: async (categoryId) => {
        set({ isLoading: true, error: null });
        try {
          await axios.delete(`${CATEGORY_URL}/${categoryId}`);
          set((state) => ({
            categories: state.categories.filter((cat) => cat._id !== categoryId),
            isLoading: false,
          }));
        } catch (err) {
          set({
            error: err.response?.data?.message || "Error delete data",
            isLoading: false,
          });
          throw err;
        }
      },
      searchCategoryByKeyword: async (q, page, limit) => {
        set({ isLoading: true, error: null });
        try {
          const res = await axios.get(`${CATEGORY_URL}/search`, {
            params: { q, page, limit },
          });
          set({
            categories: res.data.categories,
            total: res.data.total,
            page: res.data.page,
            limit: res.data.limit,
            isLoading: false,
          });
          return res.data.categories;
        } catch (err) {
          set({
            error: err.response?.data?.message || "Error search data",
            isLoading: false,
          });
          throw err;
        }
      },
    }),
    {
      name: "category-storage",
      partialize: (state) => ({ categories: state.categories }),
    }
  )
);

export default useCategoryStore;