/**
 * Tính toán giá đơn hàng
 * @param {Array} cartItems - Mảng các sản phẩm trong giỏ hàng
 * @returns {Object} Các giá trị đã tính toán
 */
export const calculatePrices = (cartItems) => {
  // Tính tổng giá trị sản phẩm
  const itemsPrice = cartItems.reduce(
    (sum, item) => sum + item.price * (item.qty || item.quantity),
    0
  );

  // Tính phí vận chuyển
  const shippingPrice = itemsPrice > 100 ? 0 : 10;
  
  // Tính thuế
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
};

/**
 * Format giá tiền
 * @param {Number} price - Giá cần format
 * @returns {String} Giá đã được format
 */
export const formatPrice = (price) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(price);
};