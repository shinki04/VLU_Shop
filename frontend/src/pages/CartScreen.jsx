import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaTrash, FaArrowLeft, FaShoppingCart } from 'react-icons/fa';
import useCartStore from '../store/cartStore';
import useAuthStore from '../store/authStore';
import { calculatePrices } from '../utils/priceUtils';
import { toastCustom } from '../hooks/toastCustom';
import { Button, Card, CardBody, CardFooter, CardHeader, Divider, Image, Input } from '@heroui/react';

const CartScreen = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const { 
    cartItems, 
    isLoading, 
    error, 
    getCartItems, 
    updateCartItemQuantity, 
    removeFromCart,
    clearError 
  } = useCartStore();

  useEffect(() => {
    if (isAuthenticated) {
      getCartItems();
    }
  }, [isAuthenticated, getCartItems]);

  useEffect(() => {
    if (error) {
      toastCustom.error(error);
      clearError();
    }
  }, [error, clearError]);

  const handleQuantityChange = async (id, quantity) => {
    if (quantity < 1) return;
    await updateCartItemQuantity(id, quantity);
  };

  const handleRemoveItem = async (id) => {
    await removeFromCart(id);
  };

  const handleCheckout = () => {
    if (!isAuthenticated) {
      toastCustom.info('Vui lòng đăng nhập để tiếp tục thanh toán');
      navigate('/login?redirect=shipping');
    } else {
      navigate('/shipping');
    }
  };

  // Tính toán giá trị đơn hàng
  const { itemsPrice, shippingPrice, taxPrice, totalPrice } = calculatePrices(cartItems);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Giỏ hàng của bạn</h1>
      
      {isLoading ? (
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : cartItems.length === 0 ? (
        <Card className="mb-6">
          <CardBody className="text-center py-10">
            <FaShoppingCart className="mx-auto text-gray-400 text-5xl mb-4" />
            <h2 className="text-xl font-semibold mb-2">Giỏ hàng trống</h2>
            <p className="text-gray-600 mb-4">Bạn chưa có sản phẩm nào trong giỏ hàng</p>
            <Button color="primary" as={Link} to="/products">
              <FaArrowLeft className="mr-2" /> Tiếp tục mua sắm
            </Button>
          </CardBody>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="mb-6">
              <CardHeader className="bg-gray-50 border-b">
                <h2 className="text-lg font-semibold">Sản phẩm</h2>
              </CardHeader>
              <CardBody>
                {cartItems.map((item) => (
                  <div key={item._id} className="flex flex-col md:flex-row items-center py-4 border-b last:border-0">
                    <div className="w-full md:w-24 h-24 mb-4 md:mb-0">
                      <Image
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="flex-1 px-4">
                      <Link to={`/product/${item.product}`} className="text-lg font-medium hover:text-blue-600">
                        {item.name}
                      </Link>
                      <p className="text-gray-600 mt-1">{item.price.toLocaleString('vi-VN')}đ</p>
                    </div>
                    <div className="flex items-center mt-4 md:mt-0">
                      <div className="flex items-center border rounded-md">
                        <button
                          className="px-3 py-1 border-r"
                          onClick={() => handleQuantityChange(item._id, item.qty - 1)}
                          disabled={item.qty <= 1}
                        >
                          -
                        </button>
                        <Input
                          type="number"
                          min="1"
                          value={item.qty}
                          onChange={(e) => handleQuantityChange(item._id, parseInt(e.target.value))}
                          className="w-16 text-center border-0"
                        />
                        <button
                          className="px-3 py-1 border-l"
                          onClick={() => handleQuantityChange(item._id, item.qty + 1)}
                        >
                          +
                        </button>
                      </div>
                      <button
                        onClick={() => handleRemoveItem(item._id)}
                        className="ml-4 text-red-500 hover:text-red-700"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                ))}
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
              </CardBody>
              <CardFooter>
                <Button
                  color="primary"
                  className="w-full"
                  onClick={handleCheckout}
                  disabled={cartItems.length === 0}
                >
                  Tiến hành thanh toán
                </Button>
                <Button
                  as={Link}
                  to="/products"
                  variant="light"
                  className="w-full mt-2"
                >
                  Tiếp tục mua sắm
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartScreen;