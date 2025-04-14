import asyncHandler from "../middlewares/asyncHandler.js";
import Cart from "../models/cartModel.js";
import Product from "../models/productModel.js";
import mongoose from "mongoose";

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
    if (isNaN(qty) || qty < 1) {
      return res
        .status(400)
        .json({ success: false, message: "Quantity must be at least 1" });
    }

    // Tìm sản phẩm
    const product = await Product.findById(productId);
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
      (item) => item._id.toString() === productId
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
    await cart.populate("items.product", "name image price");

    res.status(200).json({
      success: true,
      message: "Added to cart successfully",
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

// Xem giỏ hàng
export const getCart = asyncHandler(async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id }).populate(
      "items.product",
      "name image price countInStock"
    );
    if (!cart) {
      return res.status(200).json({
        success: true,
        message: "Cart is empty",
        cart: { items: [] },
      });
    }

    res.status(200).json({
      success: true,
      message: "Cart retrieved successfully",
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
          message: `Invalid quantity for product ${item.productId}`,
        });
      }

      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product not found: ${item.productId}`,
        });
      }
      if (qty > 0 && product.countInStock < qty) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for product ${item.productId}`,
        });
      }

      if (qty > 0) {
        updatedItems.push({
          product: item.productId,
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
      message: productIds?.length > 0
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
