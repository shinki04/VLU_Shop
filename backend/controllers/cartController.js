import asyncHandler from "../middlewares/asyncHandler.js";
import Cart from "../models/cartModel.js";
import Product from "../models/productModel.js";
import Category from "../models/categoryModel.js";
// Thêm sản phẩm vào giỏ hàng
export const addToCart = asyncHandler(async (req, res) => {
  const { productId, quantity } = req.body;

  try {
    // // Kiểm tra productId hợp lệ
    // if (!mongoose.Types.ObjectId.isValid(productId)) {
    //   return res.status(400).json({ success: false, message: "Invalid product ID" });
    // }

    // Kiểm tra số lượng
    const qty = parseInt(quantity, 10);
    if (qty < 1 || isNaN(qty)) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Quantity must be at least 1 and is number",
        });
    }

    // Tìm sản phẩm
    const product = await Product.findById(productId);
    const populatedProduct = {
      _id: product._id,
      name: product.name,
      image: product.image,
      price: product.price,
    };
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    // Kiểm tra tồn kho
    if (product.countInStock < qty) {
      return res.status(400).json({
        success: false,
        message: "Product out of stock or insufficient quantity",
      });
    }

    // Tìm hoặc tạo giỏ hàng
    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = new Cart({
        user: req.user._id,
        items: [],
      });
    }

    // Kiểm tra sản phẩm đã có trong giỏ
    const itemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId
    );
    if (itemIndex > -1) {
      cart.items[itemIndex].quantity += qty;
      cart.items[itemIndex].price = product.price;
    } else {
      cart.items.push({
        product: productId,
        quantity: qty,
        price: product.price,
      });
    }

    await cart.save();
    // await cart.populate("items.productId", "name image price");

    res.status(200).json({
      success: true,
      message: "Added to cart successfully",
      cart: {
        ...cart.toObject(),
        items: cart.items.map((item) => ({
          ...item.toObject(),
          product: populatedProduct,
        })),
      },
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

// Xem giỏ hàng
export const getCart = asyncHandler(async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; // Nếu không có thì mặc định là trang 1
    const limit = parseInt(req.query.limit) || 5; // Mặc định mỗi trang 5 danh mục
    const skip = (page - 1) * limit;
    const total = await Cart.countDocuments();

    const cart = await Cart.findOne({ user: req.user._id })
      .populate("items.product", "name image price countInStock")
      .lean();

    if (!cart || cart.items.length === 0) {
      return res.status(200).json({
        success: true,
        message: "Cart is empty",
        page,
        limit,
        totalItems: 0,
        totalPages: 0,
        items: [],
      });
    }
    const totalItems = cart.items.length;
    const paginatedItems = cart.items.slice(skip, skip + limit);

    res.status(200).json({
      success: true,
      message: "Cart retrieved successfully",
      page,
      limit,
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
      items: paginatedItems,
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

// Cập nhật giỏ hàng
export const updateCart = asyncHandler(async (req, res) => {
  const { items } = req.body; // items: [{ productId, quantity }]

  try {
    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res
        .status(404)
        .json({ success: false, message: "Cart not found" });
    }

    // Kiểm tra và cập nhật items
    const updatedItems = [];
    for (const item of items) {
      // if (!mongoose.Types.ObjectId.isValid(item.productId)) {
      //   return res
      //     .status(400)
      //     .json({
      //       success: false,
      //       message: `Invalid product ID: ${item.productId}`,
      //     });
      // }
      const qty = parseInt(item.quantity, 10);
      if (isNaN(qty) || qty < 0) {
        return res.status(400).json({
          success: false,
          message: `Invalid quantity for product ${item.product}`,
        });
      }

      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product not found: ${item.product}`,
        });
      }
      if (qty > 0 && product.countInStock < qty) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for product ${item.product}`,
        });
      }

      if (qty > 0) {
        updatedItems.push({
          product: item.product,
          quantity: qty,
          price: product.price,
        });
      }
    }

    cart.items = updatedItems;
    await cart.save();
    await cart.populate("items.product", "name image price countInStock");

    res.status(200).json({
      success: true,
      message: "Cart updated successfully",
      cart,
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

// Xóa giỏ hàng hoặc nhiều sản phẩm
export const deleteCart = asyncHandler(async (req, res) => {
  const { productIds } = req.body; // Mảng các productId cần xoá

  try {
    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res
        .status(404)
        .json({ success: false, message: "Cart not found" });
    }

    if (Array.isArray(productIds) && productIds.length > 0) {
      // Xóa các sản phẩm có trong mảng productIds
      cart.items = cart.items.filter(
        (item) => !productIds.includes(item.product.toString())
      );
    } else {
      // Nếu không truyền productIds, xóa toàn bộ giỏ hàng
      cart.items = [];
    }

    await cart.save();
    await cart.populate("items.product", "name image price");

    res.status(200).json({
      success: true,
      message:
        productIds?.length > 0
          ? "Selected products removed from cart"
          : "Cart cleared",
      cart,
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

export const filterCartItems = asyncHandler(async (req, res) => {
  const { search, category, brand, sortBy, sortOrder = "asc", userId } = req.query;

  const filter = { user: userId }; // Nếu cart theo user

  if (search) {
    filter.$or = [
      { "items.name": { $regex: search, $options: "i" } },
      { "items.brand": { $regex: search, $options: "i" } },
    ];
  }

  if (category) {
    filter["items.category"] = category;
  }

  if (brand) {
    filter["items.brand"] = brand;
  }

  let sortOptions = {};
  if (sortBy) {
    sortOptions[`items.${sortBy}`] = sortOrder === "desc" ? -1 : 1;
  }

  const cart = await Cart.findOne(filter).sort(sortOptions);

  if (!cart) {
    return res.status(404).json({
      success: false,
      message: "Cart not found",
    });
  }

  res.status(200).json({
    success: true,
    message: "Cart items filtered successfully",
    cart,
  });
});
