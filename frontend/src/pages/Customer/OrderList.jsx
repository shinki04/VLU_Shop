import React, { useEffect, useState } from "react";
import useOrderStore from "../../store/orderStore";
import {
  Card,
  CardBody,
  Button,
  Chip,
  Spinner,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Divider,
} from "@heroui/react";
import { formatPrice, formatDate } from "../../utils/formatters";
import { toastCustom } from "../../hooks/toastCustom";

const OrderList = () => {
  const { orders, getMyOrders, cancelOrder, isLoading } = useOrderStore();
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    getMyOrders();
  }, [getMyOrders]);

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const handleCancelOrder = async (orderId) => {
    try {
      // await cancelOrder(orderId);
      toastCustom({
        title: "Oops!",
        description: "Thành thật xin lỗi, chúng tôi chưa phát triển tính năng này",
        color: "warning",
        variant: "solid",
      });
      setIsModalOpen(false);
      getMyOrders();
    } catch (error) {
      toastCustom({
        title: "Error",
        description: error.message || "Đã xảy ra lỗi khi hủy đơn hàng",
        color: "danger",
     
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Bạn chưa có đơn hàng nào</h2>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Đơn hàng của tôi</h1>
      <div className="space-y-4">
        {orders.map((order) => (
          <Card key={order._id}>
            <CardBody>
              <div className="flex flex-col md:flex-row justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">Mã đơn hàng:</span>
                    <span>{order._id}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">Ngày đặt:</span>
                    <span>{formatDate(order.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">Tổng tiền:</span>
                    <span className="text-primary font-bold">
                      {formatPrice(order.totalPrice)}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className="flex items-center gap-2">
                    <Chip
                      color={
                        order.isPaid
                          ? "success"
                          : order.isCancelled
                          ? "danger"
                          : "warning"
                      }
                      size="sm"
                      variant="flat"
                    >
                      {order.isPaid
                        ? "Đã thanh toán"
                        : order.isCancelled
                        ? "Đã hủy"
                        : "Chưa thanh toán"}
                    </Chip>
                    <Chip
                      color={
                        order.isDelivered
                          ? "success"
                          : order.isCancelled
                          ? "danger"
                          : "warning"
                      }
                      size="sm"
                      variant="flat"
                    >
                      {order.isDelivered
                        ? "Đã giao hàng"
                        : order.isCancelled
                        ? "Đã hủy"
                        : "Đang xử lý"}
                    </Chip>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      color="primary"
                      variant="flat"
                      size="sm"
                      onPress={() => handleViewOrder(order)}
                    >
                      Xem chi tiết
                    </Button>
                    {!order.isPaid && !order.isDelivered && !order.isCancelled && (
                      <Button
                        color="danger"
                        variant="flat"
                        size="sm"
                        onPress={() => handleCancelOrder(order._id)}
                      >
                        Hủy đơn
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <ModalContent>
          {selectedOrder && (
            <>
              <ModalHeader>Chi tiết đơn hàng #{selectedOrder._id}</ModalHeader>
              <ModalBody>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Thông tin đơn hàng</h3>
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span>Ngày đặt:</span>
                        <span>{formatDate(selectedOrder.createdAt)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Trạng thái thanh toán:</span>
                        <Chip
                          color={selectedOrder.isPaid ? "success" : "warning"}
                          size="sm"
                          variant="flat"
                        >
                          {selectedOrder.isPaid ? "Đã thanh toán" : "Chưa thanh toán"}
                        </Chip>
                      </div>
                      <div className="flex justify-between">
                        <span>Trạng thái giao hàng:</span>
                        <Chip
                          color={selectedOrder.isDelivered ? "success" : "warning"}
                          size="sm"
                          variant="flat"
                        >
                          {selectedOrder.isDelivered ? "Đã giao hàng" : "Đang xử lý"}
                        </Chip>
                      </div>
                    </div>
                  </div>

                  <Divider />

                  <div>
                    <h3 className="font-semibold mb-2">Sản phẩm</h3>
                    <div className="space-y-2">
                      {selectedOrder.orderItems.map((item) => (
                        <div
                          key={item._id}
                          className="flex justify-between items-center"
                        >
                          <div className="flex items-center gap-2">
                            <span>{item.name}</span>
                          </div>
                          <div className="text-right">
                            <div>
                              Số lượng: {item.quantity} | Giá: {formatPrice(item.price)}
                            </div>
                            <div className="font-bold">
                              Tổng: {formatPrice(item.quantity * item.price)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Divider />

                  <div>
                    <h3 className="font-semibold mb-2">Tổng cộng</h3>
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span>Tạm tính:</span>
                        <span>{formatPrice(selectedOrder.itemsPrice)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Phí vận chuyển:</span>
                        <span>{formatPrice(selectedOrder.shippingPrice)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Thuế:</span>
                        <span>{formatPrice(selectedOrder.taxPrice)}</span>
                      </div>
                      <Divider />
                      <div className="flex justify-between font-bold text-lg">
                        <span>Tổng cộng:</span>
                        <span className="text-primary">
                          {formatPrice(selectedOrder.totalPrice)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button
                  color="danger"
                  variant="light"
                  onPress={() => setIsModalOpen(false)}
                >
                  Đóng
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};

export default OrderList; 