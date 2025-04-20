import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useCartStore from "../../store/cartStore";
import {
  Card,
  CardBody,
  Image,
  Button,
  Input,
  Chip,
  Divider,
  Spinner,
} from "@heroui/react";
import { formatPrice } from "../../utils/formatters";
import { toastCustom } from "../../hooks/toastCustom";

// const API_URL = import.meta.env.MODE === "development"
//   ? "http://localhost:3000"
//   : "";
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const Cart = () => {
  const navigate = useNavigate();
  const {
    items = [],
    updateCart,
    deleteFromCart,
    fetchCart,
    isLoading,
  } = useCartStore();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // Hàm xử lý URL ảnh
  const getImageUrl = (image) => {
    if (!image) return "/default-product.png";
    return image.startsWith("http") ? image : `${API_URL}${image}`;
  };

  const handleUpdateQuantity = async (item, newQty) => {
    if (newQty > item.product.countInStock) {
      toastCustom({
        title: "error",
        description: "Số lượng không đủ",
      });
      return;
    }

    try {
      // Tạo một bản sao của items và cập nhật số lượng cho item được chọn
      const updatedItems = items.map((cartItem) => {
        if (cartItem._id === item._id) {
          return { ...cartItem, quantity: newQty };
        }
        return cartItem;
      });

      await updateCart(updatedItems);
      toastCustom({
        title: "success",
        description: "Đã cập nhật số lượng sản phẩm",
      });
    } catch (error) {
      toastCustom({
        title: "error",
        description: error.message || "Có lỗi xảy ra khi cập nhật số lượng",
      });
    }
  };

  const handleRemoveFromCart = async (itemId) => {
    try {
      await deleteFromCart([itemId]);
    } catch (error) {
      toastCustom({
        title: "error",
        description: error.message || "Không thể xóa sản phẩm",
      });
    }
  };

  const handleCheckout = () => {
    if (!items || items.length === 0) {
      toastCustom({ title: "error", description: "Giỏ hàng trống" });
      return;
    }
    navigate("/payment");
  };

  const subtotal = (items || []).reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );
  const shippingPrice = subtotal > 1000000 ? 0 : 30000;
  const taxPrice = subtotal * 0.1;
  const totalPrice = subtotal + shippingPrice + taxPrice;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!items || items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Giỏ hàng trống</h2>
        <Button color="primary" onPress={() => navigate("/products")}>
          Tiếp tục mua sắm
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Giỏ hàng</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <Card key={item._id}>
              <CardBody>
                <div className="flex gap-4">
                  <Image
                    src={getImageUrl(item.product?.images?.[0])}
                    alt={item.product?.name || "Sản phẩm"}
                    className="w-24 h-24 object-contain"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold">
                      {item.product?.name || "Sản phẩm"}
                    </h3>
                    <p className="text-primary font-bold">
                      {formatPrice(item.price)}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <Chip
                        color={
                          item.product?.countInStock > 0 ? "success" : "danger"
                        }
                        size="sm"
                        variant="flat"
                      >
                        {item.product?.countInStock > 0
                          ? "Còn hàng"
                          : "Hết hàng"}
                      </Chip>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className="flex items-center gap-2">
                      <Button
                        isIconOnly
                        variant="flat"
                        onPress={() =>
                          handleUpdateQuantity(item, item.quantity - 1)
                        }
                        isDisabled={item.quantity <= 1}
                      >
                        -
                      </Button>
                      <Input
                        type="number"
                        min={1}
                        max={item.product?.countInStock}
                        value={item.quantity}
                        onChange={(e) =>
                          handleUpdateQuantity(item, Number(e.target.value))
                        }
                        className="w-20 text-center"
                      />
                      <Button
                        isIconOnly
                        size="sm"
                        onPress={() =>
                          handleUpdateQuantity(item, item.quantity + 1)
                        }
                        isDisabled={item.quantity >= item.product?.countInStock}
                      >
                        +
                      </Button>
                    </div>
                    <Button
                      color="danger"
                      size="sm"
                      onPress={() => handleRemoveFromCart(item._id)}
                    >
                      Xóa
                    </Button>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>

        <div>
          <Card>
            <CardBody>
              <h2 className="text-xl font-bold mb-4">Tổng đơn hàng</h2>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Tạm tính:</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Phí vận chuyển:</span>
                  <span>{formatPrice(shippingPrice)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Thuế (10%):</span>
                  <span>{formatPrice(taxPrice)}</span>
                </div>
                <Divider />
                <div className="flex justify-between font-bold text-lg">
                  <span>Tổng cộng:</span>
                  <span className="text-primary">
                    {formatPrice(totalPrice)}
                  </span>
                </div>
              </div>
              <Button
                color="primary"
                className="w-full mt-4"
                onPress={handleCheckout}
                isLoading={loading}
              >
                Thanh toán
              </Button>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Cart;
