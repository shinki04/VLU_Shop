import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import useCartStore from '../store/cartStore';
import useOrderStore from '../store/orderStore';
import useAuthStore from '../store/authStore';
import { calculatePrices } from '../utils/priceUtils';
import { toastCustom } from '../hooks/toastCustom';
import { Button, Card, CardBody, CardHeader, Divider, Image } from '@heroui/react';
import CheckoutSteps from '../components/CheckoutSteps';

const PlaceOrderScreen = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { cartItems, clearCart } = useCartStore();
  const { createOrder, isLoading, error, clearError } = useOrderStore();
  const [orderPlaced, setOrderPlaced] = useState(false);

  // Lấy thông tin địa chỉ giao hàng và phương thức thanh toán từ localStorage
  const shippingAddress = JSON.parse(localStorage.getItem('shippingAddress')) || {};
  const paymentMethod = localStorage.getItem('paymentMethod') || '';

  useEffect(() => {
    if (!shippingAddress.address) {
      navigate('/shipping');
    } else if (!paymentMethod) {
      navigate('/payment');
    }
  }, [shippingAddress, paymentMethod, navigate]);

  useEffect(() => {
    if (error) {
      toastCustom.error(error);
      clearError();
    }
  }, [error, clearError]);

  // Tính toán giá trị đơn hàng
  const { itemsPrice, shippingPrice, taxPrice, totalPrice } = calculatePrices(cartItems);

  const placeOrderHandler = async () => {
    try {
      const res = await createOrder({
        orderItems: cartItems,
        shippingAddress,
        paymentMethod,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
      });
      
      setOrderPlaced(true);
      clearCart();
      navigate(`/order/${res.order._id}`);
      toastCustom.success('Đặt hàng thành công!');
    } catch (err) {
      toastCustom.error(err.message || 'Đặt hàng thất bại. Vui lòng thử lại.');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <CheckoutSteps step3 step4 />
      
      <h1 className="text-2xl font-bold mb-6">Xác nhận đơn hàng</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="mb-6">
            <CardHeader className="bg-gray-50 border-b">
              <h2 className="text-lg font-semibold">Thông tin giao hàng</h2>
            </CardHeader>
            <CardBody>
              <p><strong>Họ tên:</strong> {user.name}</p>
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Địa chỉ:</strong> {shippingAddress.address}</p>
              <p><strong>Thành phố:</strong> {shippingAddress.city}</p>
              <p><strong>Mã bưu điện:</strong> {shippingAddress.postalCode}</p>
              <p><strong>Quốc gia:</strong> {shippingAddress.country}</p>
              <Button 
                as={Link} 
                to="/shipping" 
                variant="light" 
                size="sm" 
                className="mt-2"
              >
                Chỉnh sửa
              </Button>
            </CardBody>
          </Card>
          
          <Card className="mb-6">
            <CardHeader className="bg-gray-50 border-b">
              <h2 className="text-lg font-semibold">Phương thức thanh toán</h2>
            </CardHeader>
            <CardBody>
              <p><strong>Phương thức:</strong> {paymentMethod}</p>
              <Button 
                as={Link} 
                to="/payment" 
                variant="light" 
                size="sm" 
                className="mt-2"
              >
                Chỉnh sửa
              </Button>
            </CardBody>
          </Card>
          
          <Card className="mb-6">
            <CardHeader className="bg-gray-50 border-b">
              <h2 className="text-lg font-semibold">Sản phẩm đặt hàng</h2>
            </CardHeader>
            <CardBody>
              {cartItems.length === 0 ? (
                <p>Giỏ hàng trống</p>
              ) : (
                <div className="space-y-4">
                  {cartItems.map((item) => (
                    <div key={item._id} className="flex items-center py-2 border-b last:border-0">
                      <div className="w-16 h-16">
                        <Image
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="flex-1 px-4">
                        <Link to={`/product/${item.product}`} className="text-md font-medium hover:text-blue-600">
                          {item.name}
                        </Link>
                      </div>
                      <div className="text-right">
                        <p>{item.qty} x {item.price.toLocaleString('vi-VN')}đ = {(item.qty * item.price).toLocaleString('vi-VN')}đ</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <Button 
                as={Link} 
                to="/cart" 
                variant="light" 
                size="sm" 
                className="mt-4"
              >
                Chỉnh sửa
              </Button>
            </CardBody>
          </Card>
        </div>
        
        <div className="lg:col-span-1">
          <Card className="sticky top-4">
            <CardHeader className="bg-gray-50 border-b">
              <h2 className="text-lg font-semibold">Tổng đơn hàng</h2>
            </CardHeader>
            <CardBody>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Tạm tính:</span>
                  <span>{itemsPrice.toLocaleString('vi-VN')}đ</span>
                </div>
                <div className="flex justify-between">
                  <span>Phí vận chuyển:</span>
                  <span>{shippingPrice.toLocaleString('vi-VN')}đ</span>
                </div>
                <div className="flex justify-between">
                  <span>Thuế (15%):</span>
                  <span>{taxPrice.toLocaleString('vi-VN')}đ</span>
                </div>
                <Divider />
                <div className="flex justify-between font-bold text-lg">
                  <span>Tổng cộng:</span>
                  <span>{totalPrice.toLocaleString('vi-VN')}đ</span>
                </div>
              </div>
              
              <Button
                color="primary"
                className="w-full mt-4"
                onClick={placeOrderHandler}
                disabled={cartItems.length === 0 || isLoading || orderPlaced}
                isLoading={isLoading}
              >
                {isLoading ? 'Đang xử lý...' : 'Đặt hàng'}
              </Button>
              
              <Button
                as={Link}
                to="/cart"
                variant="light"
                className="w-full mt-2"
                startContent={<FaArrowLeft />}
              >
                Quay lại giỏ hàng
              </Button>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PlaceOrderScreen;