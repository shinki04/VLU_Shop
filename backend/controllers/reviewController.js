import Product from "../models/productModel.js";
import Review from "../models/reviewModel.js";
import asyncHandler from "../middlewares/asyncHandler.js";
// Thêm review cho sản phẩm
export const addProductReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;
  const productId = req.params.id;

  // Kiểm tra dữ liệu đầu vào
  switch (true) {
    case !rating:
      return res
        .status(400)
        .json({ success: false, message: "Rating is required" });
    case rating <= 0:
      return res
        .status(400)
        .json({ success: false, message: "Rating must be at least 1" });
    case rating > 5:
      return res
        .status(400)
        .json({ success: false, message: "Rating must be at most 5" });
    case !comment || comment.length < 10:
      return res.status(400).json({
        success: false,
        message: "Comment must be at least 10 characters",
      });
  }

  // Tìm sản phẩm
  const product = await Product.findById(productId);
  if (!product) {
    return res
      .status(404)
      .json({ success: false, message: "Product not found" });
  }

  // Kiểm tra xem người dùng đã review chưa
  const existingReview = await Review.findOne({
    product: productId,
    user: req.user._id,
  });
  if (existingReview) {
    return res
      .status(400)
      .json({ success: false, message: "Product already reviewed" });
  }

  // Tạo review mới
  const review = new Review({
    name: req.user.username,
    rating: Number(rating),
    comment,
    user: req.user._id,
    product: productId,
  });
  await review.save();

  // Thêm ObjectId của review vào product.reviews
  product.reviews.push(review._id);
  product.numReviews = product.reviews.length;
  product.rating =
    (
      await Review.aggregate([
        { $match: { product: product._id } },
        { $group: { _id: null, avgRating: { $avg: "$rating" } } },
      ])
    )[0]?.avgRating || 0;

  await product.save();

  res.status(201).json({ success: true, message: "Review added successfully" });
});

// Cập nhật review cho sản phẩm
export const updateProductReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;
  const productId = req.params.id;

  // Kiểm tra productId hợp lệ
  // if (!mongoose.Types.ObjectId.isValid(productId)) {
  //   return res
  //     .status(400)
  //     .json({ success: false, message: "Invalid product ID" });
  // }

  // Tìm sản phẩm
  const product = await Product.findById(productId);
  if (!product) {
    return res
      .status(404)
      .json({ success: false, message: "Product not found" });
  }

  // Tìm review của người dùng
  const review = await Review.findOne({
    product: productId,
    user: req.user._id,
  });
  if (!review) {
    return res.status(404).json({
      success: false,
      message: "You have not reviewed this product",
    });
  }

  // Kiểm tra dữ liệu đầu vào (chỉ khi được gửi)
  if (rating !== undefined) {
    const numericRating = Number(rating);
    if (isNaN(numericRating)) {
      return res
        .status(400)
        .json({ success: false, message: "Rating must be a valid number" });
    }
    if (numericRating <= 0) {
      return res
        .status(400)
        .json({ success: false, message: "Rating must be at least 1" });
    }
    if (numericRating > 5) {
      return res
        .status(400)
        .json({ success: false, message: "Rating must be at most 5" });
    }
    review.rating = numericRating;
  }

  if (comment !== undefined) {
    if (comment.length < 10) {
      return res.status(400).json({
        success: false,
        message: "Comment must be at least 10 characters",
      });
    }
    // if (comment.length > 1000) {
    //   return res.status(400).json({
    //     success: false,
    //     message: "Comment must be at most 1000 characters",
    //   });
    // }
    review.comment = comment;
  }

  // Nếu không có thay đổi, trả về sớm
  // if (rating === undefined && comment === undefined) {
  //   return res.status(400).json({
  //     success: false,
  //     message: "No changes provided for update",
  //   });
  // }

  // Lưu review
  await review.save();

  // Cập nhật rating và numReviews của sản phẩm
  const stats = await Review.aggregate([
    { $match: { product: product._id } },
    {
      $group: {
        _id: null,
        avgRating: { $avg: "$rating" },
        count: { $sum: 1 },
      },
    },
  ]);

  product.numReviews = stats[0]?.count || 0;
  product.rating = stats[0]?.avgRating || 0;

  await product.save();
  res.status(200).json({
    success: true,
    message: "Review updated successfully",
    review,
  });
});
export const getProductReviews = asyncHandler(async (req, res) => {
  const productId = req.params.id;

  // Tìm sản phẩm
  const product = await Product.findById(productId);
  if (!product) {
    return res
      .status(404)
      .json({ success: false, message: "Product not found" });
  }

  // Lấy tất cả review của sản phẩm
  const reviews = await Review.find({ product: productId }).populate(
    "user",
    "username"
  );
  res.status(200).json({
    success: true,
    reviews,
    numReviews: product.numReviews,
    rating: product.rating,
  });
});
// Xóa review cho sản phẩm
export const deleteProductReview = asyncHandler(async (req, res) => {
  const productId = req.params.id;

  // Tìm sản phẩm
  const product = await Product.findById(productId);
  if (!product) {
    return res
      .status(404)
      .json({ success: false, message: "Product not found" });
  }

  // Tìm và xóa review
  const review = await Review.findOneAndDelete({
    product: productId,
    user: req.user._id,
  });
  if (!review) {
    return res
      .status(400)
      .json({ success: false, message: "Review not found" });
  }

  // Cập nhật product.reviews
  product.reviews = product.reviews.filter(
    (r) => r.toString() !== review._id.toString()
  );
  product.numReviews = await Review.countDocuments({ product: productId });
  product.rating =
    (
      await Review.aggregate([
        { $match: { product: product._id } },
        { $group: { _id: null, avgRating: { $avg: "$rating" } } },
      ])
    )[0]?.avgRating || 0;

  await product.save();
  res
    .status(200)
    .json({ success: true, message: "Review deleted successfully" });
});
// Lấy tất cả review của một người dùng
export const getUserReviews = asyncHandler(async (req, res) => {
  const userId = req.user._id; // Lấy userId từ token đã xác thực
  const { page = 1, limit = 10 } = req.query; // Phân trang

  try {
    // Kiểm tra userId hợp lệ
    // if (!mongoose.Types.ObjectId.isValid(userId)) {
    //   return res
    //     .status(400)
    //     .json({ success: false, message: "Invalid user ID" });
    // }

    // Chuyển đổi page và limit thành số
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);

    if (isNaN(pageNum) || pageNum < 1) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid page number" });
    }
    if (isNaN(limitNum) || limitNum < 1) {
      return res.status(400).json({ success: false, message: "Invalid limit" });
    }

    // Lấy review với phân trang
    const reviews = await Review.find({ user: userId })
      .populate("product", "name image") // Lấy tên và ảnh sản phẩm
      .populate("user", "username") // Lấy username
      .sort({ createdAt: -1 }) // Sắp xếp mới nhất trước
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);

    // Đếm tổng số review
    const totalReviews = await Review.countDocuments({ user: userId });

    if (!reviews.length) {
      return res.status(200).json({
        success: true,
        message: "No reviews found for this user",
        reviews: [],
        totalReviews: 0,
        totalPages: 0,
        currentPage: pageNum,
      });
    }

    res.status(200).json({
      success: true,
      message: "Reviews retrieved successfully",
      reviews,
      totalReviews,
      totalPages: Math.ceil(totalReviews / limitNum),
      currentPage: pageNum,
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
