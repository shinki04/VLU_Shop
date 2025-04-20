import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useCartStore from "../../store/cartStore";
import useOrderStore from "../../store/orderStore";
import {
  Card,
  CardBody,
  Input,
  Button,
  Select,
  SelectItem,
  Divider,
  Spinner,
} from "@heroui/react";
import { formatPrice } from "../../utils/formatters";
import { toastCustom } from "../../hooks/toastCustom";

const Payment = () => {
  const navigate = useNavigate();
  const { items, getCart } = useCartStore();
  const { createOrder, isLoading } = useOrderStore();
  const [formData, setFormData] = useState({
    address: "",
    city: "",
    postalCode: "",
    country: "",
    paymentMethod: "",
  });

  // Lấy giỏ hàng khi component mount
  useEffect(() => {
    getCart();
  }, [getCart]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    if (!formData.address || !formData.city || !formData.postalCode || !formData.country) {
      toastCustom({
        title: "error",
        description: "Vui lòng điền đầy đủ thông tin địa chỉ",
      });
      return;
    }

    if (!formData.paymentMethod) {
      toastCustom({
        title: "error",
        description: "Vui lòng chọn phương thức thanh toán",
      });
      return;
    }

    try {
      // Tính toán lại các số tiền trước khi tạo đơn hàng
      const calculatedSubtotal = items.reduce((total, item) => {
        return total + (item.product.price * item.quantity);
      }, 0);

      const calculatedShippingPrice = calculatedSubtotal > 1000000 ? 0 : 30000;
      const calculatedTaxPrice = Math.round(calculatedSubtotal * 0.1);
      const calculatedTotalPrice = calculatedSubtotal + calculatedShippingPrice + calculatedTaxPrice;

      const orderData = {
        orderItems: items.map((item) => ({
          product: item.product._id,
          name: item.product.name,
          quantity: item.quantity,
          image: item.product.images[0],
          price: item.product.price,
        })),
        shippingAddress: {
          address: formData.address,
          city: formData.city,
          postalCode: formData.postalCode,
          country: formData.country,
        },
        paymentMethod: formData.paymentMethod,
        itemsPrice: calculatedSubtotal,
        shippingPrice: calculatedShippingPrice,
        taxPrice: calculatedTaxPrice,
        totalPrice: calculatedTotalPrice,
      };

      const response = await createOrder(orderData);
      
      // Hiển thị thông báo thành công
      toastCustom({
        title: "Success",
        description: "Đặt hàng thành công! Đơn hàng của bạn đã được lưu.",
      });

      // Reset form
      setFormData({
        address: "",
        city: "",
        postalCode: "",
        country: "",
        paymentMethod: "",
      });

    } catch (error) {
      toastCustom({
        title: "Error",
        description: error.message || "Có lỗi xảy ra khi tạo đơn hàng",
      });
    }
  };

  // Tính toán các số tiền để hiển thị
  const subtotal = items.reduce((total, item) => {
    return total + (item.product.price * item.quantity);
  }, 0);

  const shippingPrice = subtotal > 1000000 ? 0 : 30000;
  const taxPrice = Math.round(subtotal * 0.1);
  const totalPrice = subtotal + shippingPrice + taxPrice;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Thanh toán</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Thông tin đơn hàng</h2>
          <div className="space-y-4">
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
            <div className="flex justify-between font-bold text-lg">
              <span>Tổng cộng:</span>
              <span>{formatPrice(totalPrice)}</span>
            </div>
          </div>
        </div>
        <Card>
          <CardBody>
            <h2 className="text-xl font-bold mb-4">Thông tin giao hàng</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Địa chỉ"
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
              />
              <Input
                label="Thành phố"
                name="city"
                value={formData.city}
                onChange={handleChange}
                required
              />
              <Input
                label="Mã bưu điện"
                name="postalCode"
                value={formData.postalCode}
                onChange={handleChange}
                required
              />
              <Input
                label="Quốc gia"
                name="country"
                value={formData.country}
                onChange={handleChange}
                required
              />

              <Select
                label="Phương thức thanh toán"
                name="paymentMethod"
                selectedKeys={[formData.paymentMethod]}
                onSelectionChange={(keys) => {
                  const value = Array.from(keys)[0] || "";
                  setFormData((prev) => ({ ...prev, paymentMethod: value }));
                }}
                required
              >
                <SelectItem key="PayPal" value="PayPal">
                  PayPal
                </SelectItem>
                <SelectItem key="COD" value="COD">
                  Thanh toán khi nhận hàng (COD)
                </SelectItem>
              </Select>

              <Button
                type="submit"
                color="primary"
                className="w-full"
                isLoading={isLoading}
              >
                Đặt hàng
              </Button>
            </form>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default Payment; 