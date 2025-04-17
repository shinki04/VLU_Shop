import Category from "../models/categoryModel.js";
import Product from "../models/productModel.js";
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
      message: "Internal server error",
      error: error.message,
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
      message: "Internal server error",
      error: error.message,
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
    // Cập nhật các sản phẩm liên kết với category bị xóa, gán chúng về category mặc định
    const defaultCategory = await Category.findOne({ name: "Uncategorized" });
    if (!defaultCategory) {
      // Nếu không có category mặc định, có thể tạo mới category "Uncategorized"
      const newCategory = new Category({ name: "Uncategorized" });
      await newCategory.save();
    }

    // Cập nhật các sản phẩm
    await Product.updateMany(
      { category: removed._id },
      { category: defaultCategory._id }
    );

    return res.status(200).json({
      success: true,
      message: "Delete successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
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
    // Tạo object sortOptions

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
      categories: categories, // Mảng danh mục
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// const findCategoryByName = async (req, res) => {
//   try {
//     const category = await Category.findOne({ name: req.params.name });

//     if (!category) {
//       return res.status(404).json({
//         success: false,
//         message: "Category not found",
//       });
//     }

//     return res.status(200).json({
//       success: true,
//       message: "Get successfully",
//       category: category,
//     });
//   } catch (error) {
//     console.log(error);
//     return res.status(400).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };
const searchCategoryByKeyword = async (req, res) => {
  try {
    const keyword = req.query.q || "";
    const page = parseInt(req.query.page) || 1; // Mặc định là trang 1
    const limit = parseInt(req.query.limit) || 10; // Mặc định 10 mục mỗi trang
    const sortBy = req.query.sortBy;
    const sortOrder = req.query.sortOrder === "desc" ? -1 : 1;
    const sortOptions = sortBy ? { [sortBy]: sortOrder } : { createdAt: -1 };

    // Tính số mục cần bỏ qua (skip) dựa trên trang
    const skip = (page - 1) * limit;

    // Tìm kiếm danh mục với từ khóa, hỗ trợ phân trang
    const query = {
      name: { $regex: keyword, $options: "i" }, // Không phân biệt hoa thường
    };

    // Đếm tổng số danh mục khớp với từ khóa
    const total = await Category.countDocuments(query);

    // Lấy danh mục cho trang hiện tại
    const categories = await Category.find(query)
      .skip(skip)
      .limit(limit)
      .sort(sortOptions);

    // Kiểm tra nếu không có kết quả
    if (categories.length === 0 && keyword) {
      return res.status(200).json({
        success: true,
        message: "No categories found",
        categories: [],
        total: 0,
        page,
        limit,
      });
    }

    res.status(200).json({
      success: true,
      message: "Search successful",
      categories,
      total,
      page,
      limit,
    });
  } catch (error) {
    res.status(500).json({
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
  searchCategoryByKeyword,
};
