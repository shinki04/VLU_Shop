import asyncHandler from "../middlewares/asyncHandler.js";
import Order from "../models/orderModel.js";
import mongoose from "mongoose";


// Utility Function
function calcPrices(orderItems) {
  // Tính tổng giá trị sản phẩm
  const itemsPrice = orderItems.reduce(
    (acc, item) => acc + item.price * (item.qty || item.quantity),
    0
  );

  // Tính phí vận chuyển (miễn phí nếu đơn hàng > 100)
  const shippingPrice = itemsPrice > 100 ? 0 : 10;
  
  // Tính thuế (15%)
  const taxRate = 0.15;
  const taxPrice = Number((itemsPrice * taxRate).toFixed(2));

  // Tính tổng tiền
  const totalPrice = Number(
    (itemsPrice + shippingPrice + taxPrice).toFixed(2)
  );

  return {
    itemsPrice: Number(itemsPrice.toFixed(2)),
    shippingPrice,
    taxPrice,
    totalPrice,
  };
}

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const createOrder = asyncHandler(async (req, res) => {
  const {
    orderItems,
    shippingAddress,
    paymentMethod,
    itemsPrice: clientItemsPrice,
    taxPrice: clientTaxPrice,
    shippingPrice: clientShippingPrice,
    totalPrice: clientTotalPrice,
  } = req.body;
  
  if (!orderItems) {
    try{
      if (orderItems.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Không có sản phẩm nào",
        });
      }
    }catch(err){
      return res.status(400).json({
        success: false,
        message: "Không có sản phẩm nào",
        error: err.message,
      });
    }
   
  }
  if (!shippingAddress) {
    return res.status(400).json({
      success: false,
      message: "Địa chỉ giao hàng không được để trống",
    });
  }
  if (!paymentMethod) {
    return res.status(400).json({
      success: false,
      message: "Phương thức thanh toán không được để trống",  
    });
  }
  
  // Tính toán lại giá trị ở server
  const serverPrices = calcPrices(orderItems);
  
  // So sánh giá trị từ client và server (tùy chọn)
  const priceDifference = Math.abs(serverPrices.totalPrice - clientTotalPrice);
  if (priceDifference > 0.1) {
    console.log(`Phát hiện sự khác biệt giá: Client: ${clientTotalPrice}, Server: ${serverPrices.totalPrice}`);
  }
  
  const order = new Order({
    orderItems: orderItems.map((item) => ({
      ...item,
      product: item.product,
    })),
    user: req.user._id,
    shippingAddress,
    paymentMethod,
    itemsPrice: serverPrices.itemsPrice,
    taxPrice: serverPrices.taxPrice,
    shippingPrice: serverPrices.shippingPrice,
    totalPrice: serverPrices.totalPrice,
  });

  const createdOrder = await order.save();

  res.status(201).json({
    success: true,
    message: "Đơn hàng đã được tạo thành công",
    order: createdOrder,
  });
});

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = asyncHandler(async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const count = await Order.countDocuments({ user: req.user._id });
  const orders = await Order.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  res.status(200).json({
    success: true,
    message: "Lấy danh sách đơn hàng thành công",
    orders,
    page,
    limit,
    totalOrders: count,
    totalPages: Math.ceil(count / limit),
  });
});

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate(
    "user",
    "name email"
  );

  if (order) {
    // Kiểm tra nếu người dùng là admin hoặc chủ sở hữu đơn hàng
    if (req.user.role == "admin" || order.user._id.toString() === req.user._id.toString()) {
      res.status(200).json({
        success: true,
        message: "Lấy thông tin đơn hàng thành công",
        order,
      });
    } else {
      res.status(403);
      throw new Error("Không có quyền truy cập đơn hàng này");
    }
  } else {
    res.status(404);
    throw new Error("Không tìm thấy đơn hàng");
  }
});

// @desc    Update order to paid
// @route   PUT /api/orders/:id/pay
// @access  Private
const updateOrderToPaid = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (order) {
    // Kiểm tra nếu người dùng là admin hoặc chủ sở hữu đơn hàng
    if (req.user.isAdmin || order.user.toString() === req.user._id.toString()) {
      order.isPaid = true;
      order.paidAt = Date.now();
      order.paymentResult = {
        id: req.body.id,
        status: req.body.status,
        update_time: req.body.update_time,
        email_address: req.body.email_address,
      };

      const updatedOrder = await order.save();
      res.status(200).json({
        success: true,
        message: "Đơn hàng đã được cập nhật thành đã thanh toán",
        order: updatedOrder,
      });
    } else {
      res.status(403);
      throw new Error("Không có quyền cập nhật đơn hàng này");
    }
  } else {
    res.status(404);
    throw new Error("Không tìm thấy đơn hàng");
  }
});

// @desc    Update order to delivered
// @route   PUT /api/orders/:id/deliver
// @access  Private/Admin
const updateOrderToDelivered = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (order) {
    order.isDelivered = true;
    order.deliveredAt = Date.now();

    const updatedOrder = await order.save();
    res.status(200).json({
      success: true,
      message: "Đơn hàng đã được cập nhật thành đã giao hàng",
      order: updatedOrder,
    });
  } else {
    res.status(404);
    throw new Error("Không tìm thấy đơn hàng");
  }
});

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
const getOrders = asyncHandler(async (req, res) => {
  // Phân trang
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  // Tìm kiếm
  const keyword = req.query.q
    ? {
        $or: [
          { "orderItems.name": { $regex: req.query.q, $options: "i" } },
          {
            _id:
              req.query.q.length === 24
                ? new mongoose.Types.ObjectId(req.query.q)
                : null,
          },
        ],
      }
    : {};

  // Lọc theo trạng thái
  let statusFilter = {};
  if (req.query.status) {
    if (req.query.status === "paid") {
      statusFilter = { isPaid: true };
    } else if (req.query.status === "unpaid") {
      statusFilter = { isPaid: false };
    } else if (req.query.status === "delivered") {
      statusFilter = { isDelivered: true };
    } else if (req.query.status === "undelivered") {
      statusFilter = { isDelivered: false };
    }
  }

  // Lọc theo sản phẩm
  const productFilter = req.query.productId
    ? { "orderItems.product": new mongoose.Types.ObjectId(req.query.productId) }
    : {};

  // Kết hợp các điều kiện lọc
  const filter = {
    ...keyword,
    ...statusFilter,
    ...productFilter,
  };

  // Sắp xếp
  const sortBy = req.query.sortBy || "createdAt";
  const sortOrder = req.query.sortOrder || "desc";
  const sortOptions = {};
  sortOptions[sortBy] = sortOrder === "desc" ? -1 : 1;

  // Đếm tổng số đơn hàng
  const count = await Order.countDocuments(filter);

  // Lấy danh sách đơn hàng
  const orders = await Order.find(filter)
    .populate("user", "id name email")
    .sort(sortOptions)
    .skip(skip)
    .limit(limit);

  res.status(200).json({
    success: true,
    message: "Lấy danh sách đơn hàng thành công",
    orders,
    page,
    limit,
    totalOrders: count,
    totalPages: Math.ceil(count / limit),
    sortBy,
    sortOrder,
  });
});

// @desc    Delete order
// @route   DELETE /api/orders/:id
// @access  Private/Admin or Owner
const deleteOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (order) {
    // Kiểm tra nếu người dùng là admin hoặc chủ sở hữu đơn hàng
    if (req.user.isAdmin || order.user.toString() === req.user._id.toString()) {
      await Order.deleteOne({ _id: order._id });
      res.status(200).json({
        success: true,
        message: "Đơn hàng đã được xóa thành công",
      });
    } else {
      res.status(403).json({
        success: false,
        message: "Không có quyền xóa đơn hàng này",
      });
    }
  } else {
    res.status(404).json({
      success: false,
      message: "Không tìm thấy đơn hàng",
    });
  }
});

// @desc    Update order
// @route   PUT /api/orders/:id
// @access  Private/Admin
const updateOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (order) {
    // Kiểm tra nếu người dùng là admin
    if (req.user.role === "admin") {
      // Cập nhật trạng thái thanh toán nếu có
      if (req.body.isPaid !== undefined) {
        order.isPaid = req.body.isPaid;
        if (req.body.isPaid) {
          order.paidAt = Date.now();
        } else {
          order.paidAt = undefined;
        }
      }

      // Cập nhật trạng thái giao hàng nếu có
      if (req.body.isDelivered !== undefined) {
        order.isDelivered = req.body.isDelivered;
        if (req.body.isDelivered) {
          order.deliveredAt = Date.now();
        } else {
          order.deliveredAt = undefined;
        }
      }

      const updatedOrder = await order.save();
      res.status(200).json({
        success: true,
        message: "Đơn hàng đã được cập nhật thành công",
        order: updatedOrder,
      });
    } else {
      res.status(403);
      throw new Error("Không có quyền cập nhật đơn hàng này");
    }
  } else {
    res.status(404);
    throw new Error("Không tìm thấy đơn hàng");
  }
});

// @desc    Get order statistics
// @route   GET /api/orders/stats
// @access  Private/Admin
const getOrderStats = asyncHandler(async (req, res) => {
  // Thống kê tổng quan
  const totalOrders = await Order.countDocuments();
  const totalPaidOrders = await Order.countDocuments({ isPaid: true });
  const totalDeliveredOrders = await Order.countDocuments({
    isDelivered: true,
  });
  const totalPendingOrders = await Order.countDocuments({
    $or: [{ isPaid: false }, { isDelivered: false }],
  });

  // Tổng doanh thu
  const revenueStats = await Order.aggregate([
    { $match: { isPaid: true } },
    { $group: { _id: null, totalRevenue: { $sum: "$totalPrice" } } },
  ]);
  const totalRevenue =
    revenueStats.length > 0 ? revenueStats[0].totalRevenue : 0;

  // Thống kê theo thời gian (7 ngày gần nhất)
  const last7Days = new Date();
  last7Days.setDate(last7Days.getDate() - 7);

  const dailyOrders = await Order.aggregate([
    { $match: { createdAt: { $gte: last7Days } } },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        count: { $sum: 1 },
        revenue: {
          $sum: { $cond: [{ $eq: ["$isPaid", true] }, "$totalPrice", 0] },
        },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  res.status(200).json({
    success: true,
    message: "Lấy thống kê đơn hàng thành công",
    stats: {
      totalOrders,
      totalPaidOrders,
      totalDeliveredOrders,
      totalPendingOrders,
      totalRevenue,
      dailyOrders,
    },
  });
});

// @desc    Create new order by admin
// @route   POST /api/orders/admin
// @access  Private/Admin
const createOrderByAdmin = asyncHandler(async (req, res) => {
  const {
    orderItems,
    shippingAddress,
    paymentMethod,
    userId,
    itemsPrice: clientItemsPrice,
    taxPrice: clientTaxPrice,
    shippingPrice: clientShippingPrice,
    totalPrice: clientTotalPrice,
  } = req.body;
  
  if (!orderItems || orderItems.length === 0) {
    return res.status(400).json({
      success: false,
      message: "Không có sản phẩm nào",
    });
  }
  
  if (!shippingAddress) {
    return res.status(400).json({
      success: false,
      message: "Địa chỉ giao hàng không được để trống",
    });
  }
  
  if (!paymentMethod) {
    return res.status(400).json({
      success: false,
      message: "Phương thức thanh toán không được để trống",  
    });
  }
  
  if (!userId) {
    return res.status(400).json({
      success: false,
      message: "ID người dùng không được để trống",
    });
  }
  
  // Tính toán lại giá trị ở server
  const serverPrices = calcPrices(orderItems);
  
  // So sánh giá trị từ client và server (tùy chọn)
  const priceDifference = Math.abs(serverPrices.totalPrice - clientTotalPrice);
  if (priceDifference > 0.1) {
    console.log(`Phát hiện sự khác biệt giá: Client: ${clientTotalPrice}, Server: ${serverPrices.totalPrice}`);
  }
  
  const order = new Order({
    orderItems: orderItems.map((item) => ({
      ...item,
      product: item.product,
    })),
    user: userId,
    shippingAddress,
    paymentMethod,
    itemsPrice: serverPrices.itemsPrice,
    taxPrice: serverPrices.taxPrice,
    shippingPrice: serverPrices.shippingPrice,
    totalPrice: serverPrices.totalPrice,
    isPaid: false, // Admin có thể đánh dấu đã thanh toán ngay
    paidAt: Date.now(),
  });

  const createdOrder = await order.save();

  res.status(201).json({
    success: true,
    message: "Đơn hàng đã được tạo thành công bởi admin",
    order: createdOrder,
  });
});

export {
  createOrder,
  getMyOrders,
  getOrderById,
  updateOrderToPaid,
  updateOrderToDelivered,
  getOrders,
  deleteOrder,
  updateOrder,
  getOrderStats,
  createOrderByAdmin,
};
