import Product from "../models/productModel.js";
import asyncHandler from "../middlewares/asyncHandler.js";
import Category from "../models/categoryModel.js"; // Kiểm tra category

// Thêm sản phẩm mới
export const addProduct = asyncHandler(async (req, res) => {
  const { name, description, price, category, countInStock, brand, images } =
    req.body;

  // Kiểm tra thông tin
  switch (true) {
    case !name:
      return res
        .status(400)
        .json({ success: false, message: "Name is required" });
    case !brand:
      return res
        .status(400)
        .json({ success: false, message: "Brand is required" });
    case !description:
      return res
        .status(400)
        .json({ success: false, message: "Description is required" });
    case !price:
      return res
        .status(400)
        .json({ success: false, message: "Price is required" });
    case price < 0:
      return res.status(400).json({
        success: false,
        message: "Price must than 0",
      });
    case !category:
      return res
        .status(400)
        .json({ success: false, message: "Category is required" });
    case !countInStock:
      return res
        .status(400)
        .json({ success: false, message: "Count In Stock is required" });
    case !images || images.length === 0:
      return res
        .status(400)
        .json({ success: false, message: "Images are required" });
  }

  // Kiểm tra xem category có tồn tại không
  const categoryExists = await Category.findById(category);
  if (!categoryExists) {
    return res
      .status(400)
      .json({ success: false, message: "Category does not exist" });
  }
  const existingProduct = await Product.findOne({ name });
  if (existingProduct) {
    return res.status(409).json({
      success: false,
      message: "Product already exists",
    });
  }

  try {
    const product = new Product({
      ...req.body,
      reviews: [], // Khởi tạo mảng reviews rỗng
      rating: 0, // Khởi tạo rating mặc định là 0
      numReviews: 0, // Khởi tạo số lượng review mặc định là 0
      success: true,
      message: "Product created successfully",
    });
    await product.save();
    res.status(201).json({
      product,
      success: true,
      message: "Product created successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
});

// Cập nhật sản phẩm
export const updateProductDetails = asyncHandler(async (req, res) => {
  const { name, description, price, category, countInStock, brand, images } =
    req.body;
  const { productId } = req.params;

  try {
    // Kiểm tra category nếu được cung cấp
    if (category) {
      const categoryExists = await Category.findById(category);
      if (!categoryExists) {
        return res.status(400).json({
          success: false,
          message: "Category does not exist",
        });
      }
    }

    // Kiểm tra các trường khác nếu cần
    if (price && price < 0) {
      return res
        .status(400)
        .json({ success: false, message: "Price must than 0" });
    }

    const product = await Product.findByIdAndUpdate(
      productId,
      {
        name,
        description,
        price,
        category,
        countInStock,
        brand,
        images,
      },
      { new: true, runValidators: true }
    ).populate("category");

    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    res.json({
      success: true,
      message: "Product updated successfully",
      product,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
});

// Xóa sản phẩm
export const removeProduct = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  try {
    const product = await Product.findByIdAndDelete(productId);

    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }
    res.status(200).json({
      success: true,
      message: "Product removed successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
});

// Lấy sản phẩm theo ID
export const fetchProductById = asyncHandler(async (req, res) => {
  try {
    const { productId } = req.params;
    const product = await Product.findById(productId).populate("category");
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }
    res.status(200).json({
      success: true,
      message: "Product fetched successfully",
      product: product,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
});
// Lấy tất cả sản phẩm với phân trang
export const fetchAllProducts = asyncHandler(async (req, res) => {
  try {
    // Lấy page và limit từ query parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    // Tính toán số lượng sản phẩm cần bỏ qua (skip)
    const skip = (page - 1) * limit;

    // Truy vấn sản phẩm với phân trang
    const products = await Product.find({})
      .populate("category")
      .populate("reviews") 
      .skip(skip) // Bỏ qua các sản phẩm đã truy vấn trước đó
      .limit(limit); // Giới hạn số lượng sản phẩm trả về
    //.sort({ createdAt: -1 }); // Sắp xếp theo ngày tạo sản phẩm giảm dần

    // Lấy tổng số sản phẩm để tính tổng số trang
    const totalProducts = await Product.countDocuments({});
    const totalPages = Math.ceil(totalProducts / limit);

    res.status(200).json({
      success: true,
      message: "Get successfully",
      page,
      limit,
      totalPages,
      totalProducts,
      products,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
});
export const filterProducts = asyncHandler(async (req, res) => {
  // Lấy các tham số từ req.query (hoặc req.body nếu bạn dùng POST)
  const { checked, priceRange, search, page = 1, limit = 10 } = req.query;

  let args = {};

  // Xử lý checked (category IDs, dạng chuỗi cách nhau bởi dấu phẩy)
  if (checked) {
    const checkedArray = checked
      .split(",")
      .filter((id) => id.match(/^[0-9a-fA-F]{24}$/)); // Chỉ lấy ObjectId hợp lệ
    if (checkedArray.length > 0) {
      args.category = { $in: checkedArray };
    }
  }

  // Xử lý priceRange (khoảng giá từ thanh kéo, dạng "min,max")
  if (priceRange) {
    const rangeArray = priceRange.split(",").map(Number); // Chuyển thành mảng số
    if (
      Array.isArray(rangeArray) &&
      rangeArray.length === 2 &&
      !isNaN(rangeArray[0]) &&
      !isNaN(rangeArray[1]) &&
      rangeArray[0] >= 0 &&
      rangeArray[0] <= rangeArray[1]
    ) {
      args.price = { $gte: rangeArray[0], $lte: rangeArray[1] };
    } else {
      return res.status(400).json({
        success: false,
        message:
          "Invalid price range. Expected format: min,max (e.g., 100,500)",
      });
    }
  }

  // Xử lý search (tìm kiếm theo tên hoặc mô tả)
  if (search) {
    if (search.length > 100) {
      return res.status(400).json({
        success: false,
        message: "Search term too long",
      });
    }
    args.$or = [
      { name: { $regex: search, $options: "i" } }, // Không phân biệt hoa thường
      { description: { $regex: search, $options: "i" } },
    ];
  }

  // Chuyển page và limit thành số
  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.max(1, parseInt(limit));
  const skip = (pageNum - 1) * limitNum;

  try {
    // Truy vấn sản phẩm
    const products = await Product.find(args)
      .populate("category")
      .populate("reviews") 
      .skip(skip)
      .limit(limitNum);

    // Tính tổng số sản phẩm
    const totalProducts = await Product.countDocuments(args);
    const totalPages = Math.ceil(totalProducts / limitNum);

    res.status(200).json({
      success: true,
      message: "Get products successfully",
      page: pageNum,
      limit: limitNum,
      totalPages,
      totalProducts,
      products,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
});

// Lấy sản phẩm mới nhất
export const fetchNewProducts = asyncHandler(async (req, res) => {
  try {
    const products = await Product.find()
      .sort({ updatedAt: -1 })
      .limit(10)
      .populate("reviews") 
      .populate("category");
    res.status(200).json({
      success: true,
      message: "New products fetched successfully",
      products,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
});
