import Category from "../models/categoryModel.js";

const createCategory = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Name is required",
      });
    }

    const existingCategory = await Category.findOne({ name });

    if (existingCategory) {
      return res.status(409).json({
        success: false,
        message: "Already exists",
      });
    }

    const category = await new Category({ name }).save();
    return res.status(201).json({
      success: true,
      message: "Create new successfully",
      category: category,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const updateCategory = async (req, res) => {
  try {
    const { name } = req.body;
    const { categoryId } = req.params;

    const category = await Category.findOne({ _id: categoryId });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    category.name = name;

    const updatedCategory = await category.save();
    return res.status(200).json({
      success: true,
      message: "Update successfully",
      category: updatedCategory,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};

const removeCategory = async (req, res) => {
  try {
    const removed = await Category.findByIdAndDelete(req.params.categoryId);
    if (!removed) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Delete successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const listCategory = async (req, res) => {
  try {
    // Lấy tham số từ query string
    const page = parseInt(req.query.page) || 1; // Nếu không có thì mặc định là trang 1
    const limit = parseInt(req.query.limit) || 5; // Mặc định mỗi trang 5 danh mục
    // Tính số mục cần bỏ qua (skip)
    const skip = (page - 1) * limit;

    // Lấy tổng số danh mục
    const total = await Category.countDocuments();

    // Lấy danh mục theo trang
    const categories = await Category.find().skip(skip).limit(limit);
    // .sort({ name: 1 }); // Sắp xếp theo tên tăng dần (tuỳ chọn)

    // const all = await Category.find({});

    if (!categories) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Get successfully",
      total: total, // Tổng số danh mục
      page: page, // Trang hiện tại
      limit: limit, // Số danh mục trên mỗi trang
      category: categories, // Mảng danh mục
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const findCategoryById = async (req, res) => {
  try {
    const category = await Category.findOne({ _id: req.params.id });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Get successfully",
      category: category,
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export {
  createCategory,
  updateCategory,
  removeCategory,
  listCategory,
  findCategoryById,
};
