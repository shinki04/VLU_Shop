import React, { useEffect, useState } from "react";
import useOrderStore from "../../store/orderStore";
import useUserStore from "../../store/userStore";
import useProductStore from "../../store/productStore";
import {
  Spinner,
  Input,
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Select,
  SelectItem,
  Chip,
  Divider,
  Card,
  CardHeader,
  CardBody,
  Image,
  useDisclosure,
} from "@heroui/react";
import { toastCustom } from "../../hooks/toastCustom";
import { TableComponent } from "../../components/Table/Table";
import { TopContent } from "../../components/Table/TopContent";
import DeleteModal from "../../components/Modal/DeleteModal";
import { formatDate, formatPrice } from "../../utils/formatters";
import CustomModal from "../../components/Modal/CustomModal";

const columns = [
  { name: "STT", uid: "index" },
  { name: "Mã đơn hàng", uid: "orderId", sortable: true },
  { name: "Khách hàng", uid: "user", sortable: true },
  { name: "Ngày đặt", uid: "createdAt", sortable: true },
  { name: "Tổng tiền", uid: "totalPrice", sortable: true },
  { name: "Thanh toán", uid: "isPaid", sortable: true },
  { name: "Giao hàng", uid: "isDelivered", sortable: true },
  { name: "Hành động", uid: "actions" },
];

const INITIAL_VISIBLE_COLUMNS = new Set([
  "index",
  "orderId",
  "user",
  "createdAt",
  "totalPrice",
  "isPaid",
  "isDelivered",
  "actions",
]);

// Thêm hàm getImageUrl
const getImageUrl = (image) => {
  if (!image) return "/default-product.png";
  if (image.startsWith("http")) return image;
  return `http://localhost:3000${image}`;
};

export default function OrderManagement() {
  const {
    orders,
    getAllOrders,
    getOrderDetails,
    updateOrder,
    deleteOrder,
    payOrder,
    deliverOrder,
    createOrderByAdmin,
    isLoading,
    error,
    totalOrders,
    totalPages,
    page: currentPage,
    limit: currentLimit,
    clearError,
  } = useOrderStore();

  const { user, searchUsersByKeyword } = useUserStore();
  const { products, fetchAllProducts } = useProductStore();

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [filterValue, setFilterValue] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [visibleColumns, setVisibleColumns] = useState(INITIAL_VISIBLE_COLUMNS);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [errorMess, setErrorMess] = useState("");
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  // State cho form thêm đơn hàng mới
  const [newOrder, setNewOrder] = useState({
    shippingAddress: {
      address: "",
      city: "",
      postalCode: "",
      country: "",
    },
    paymentMethod: "",
  });

  // State cho tìm kiếm và chọn sản phẩm
  const [userEmail, setUserEmail] = useState("");
  const [userSearchResult, setUserSearchResult] = useState(null);
  const [userSearchLoading, setUserSearchLoading] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [productQty, setProductQty] = useState({});

  // Thêm state cho trạng thái thanh toán và giao hàng
  const [isPaid, setIsPaid] = useState(false);
  const [isDelivered, setIsDelivered] = useState(false);

  // Lấy danh sách đơn hàng khi component mount hoặc khi các tham số thay đổi
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        await getAllOrders({
          page,
          limit,
          q: filterValue,
          status: statusFilter,
          sortBy,
          sortOrder,
        });
      } catch (error) {
        console.error("Error fetching orders:", error);
        setErrorMess(error.message || "Không thể lấy danh sách đơn hàng");
      }
    };

    fetchOrders();
  }, [page, limit, filterValue, statusFilter, sortBy, sortOrder, getAllOrders]);

  // Lấy danh sách sản phẩm khi mở modal thêm đơn hàng
  useEffect(() => {
    if (isAddModalOpen) {
      fetchAllProducts();
    }
  }, [isAddModalOpen, fetchAllProducts]);

  // Hiển thị modal lỗi nếu có lỗi
  useEffect(() => {
    if (error || errorMess) {
      onOpen();
    }
  }, [error, errorMess, onOpen]);

  // Xử lý khi nhấn nút xem chi tiết đơn hàng
  const handleViewOrder = async (order) => {
    try {
      const response = await getOrderDetails(order._id);
      setSelectedOrder(response.order);
      setIsViewModalOpen(true);
    } catch (error) {
      setErrorMess(error.message || "Không thể lấy thông tin đơn hàng");
    }
  };

  // Xử lý khi nhấn nút xóa đơn hàng
  const handleDeleteClick = (order) => {
    setSelectedOrder(order);
    setIsDeleteModalOpen(true);
  };

  // Xử lý khi xác nhận xóa đơn hàng
  const handleDeleteConfirm = async () => {
    if (!selectedOrder) return;

    try {
      await deleteOrder(selectedOrder._id);
      setIsDeleteModalOpen(false);
      toastCustom({
        title: "Thành công",
        description: "Đã xóa đơn hàng thành công!",
      });

      // Refresh danh sách đơn hàng
      await getAllOrders({
        page,
        limit,
        q: filterValue,
        status: statusFilter,
        sortBy,
        sortOrder,
      });
    } catch (error) {
      setErrorMess(error.message || "Không thể xóa đơn hàng");
    }
  };

  // Xử lý khi cập nhật trạng thái thanh toán
  const handleUpdatePaymentStatus = async (orderId, isPaid) => {
    try {
      await updateOrder(orderId, { isPaid });
      toastCustom({
        title: "Thành công",
        description: `Đã cập nhật trạng thái thanh toán thành ${isPaid ? "đã thanh toán" : "chưa thanh toán"}`,
      });

      // Refresh danh sách đơn hàng
      await getAllOrders({
        page,
        limit,
        q: filterValue,
        status: statusFilter,
        sortBy,
        sortOrder,
      });

      // Nếu đang xem chi tiết đơn hàng, cập nhật thông tin
      if (selectedOrder && selectedOrder._id === orderId) {
        const response = await getOrderDetails(orderId);
        setSelectedOrder(response.order);
      }
    } catch (error) {
      setErrorMess(error.message || "Không thể cập nhật trạng thái thanh toán");
    }
  };

  // Xử lý khi cập nhật trạng thái giao hàng
  const handleUpdateDeliveryStatus = async (orderId, isDelivered) => {
    try {
      await updateOrder(orderId, { isDelivered });
      toastCustom({
        title: "Thành công",
        description: `Đã cập nhật trạng thái giao hàng thành ${isDelivered ? "đã giao hàng" : "chưa giao hàng"}`,
      });

      // Refresh danh sách đơn hàng
      await getAllOrders({
        page,
        limit,
        q: filterValue,
        status: statusFilter,
        sortBy,
        sortOrder,
      });

      // Nếu đang xem chi tiết đơn hàng, cập nhật thông tin
      if (selectedOrder && selectedOrder._id === orderId) {
        const response = await getOrderDetails(orderId);
        setSelectedOrder(response.order);
      }
    } catch (error) {
      setErrorMess(error.message || "Không thể cập nhật trạng thái giao hàng");
    }
  };

  // Xử lý sắp xếp
  const handleSort = (columnUid, order) => {
    setSortBy(columnUid);
    setSortOrder(order);
    setPage(1);
  };

  // Hàm tìm user theo email
  const handleSearchUserByEmail = async () => {
    if (!userEmail) return;
    
    setUserSearchLoading(true);
    setUserSearchResult(null);
    try {
      const data = await searchUsersByKeyword(userEmail);
      if (data && data.length > 0) {
        setUserSearchResult(data[0]);
      } else {
        setUserSearchResult(null);
        setErrorMess("Không tìm thấy người dùng với email này");
      }
    } catch (err) {
      setErrorMess(err.message || "Lỗi khi tìm kiếm người dùng");
    }
    setUserSearchLoading(false);
  };

  // Xử lý mở modal thêm đơn hàng
  const handleOpenAddModal = () => {
    setIsAddModalOpen(true);
  };

  // Xử lý thêm đơn hàng mới
  const handleAddOrderSubmit = async () => {
    try {
      if (!userEmail) {
        setErrorMess("Vui lòng nhập email khách hàng");
        return;
      }

      if (!userSearchResult || !userSearchResult._id) {
        setErrorMess("Vui lòng tìm và chọn khách hàng hợp lệ");
        return;
      }

      if (selectedProducts.length === 0) {
        setErrorMess("Vui lòng chọn ít nhất một sản phẩm");
        return;
      }

      if (!newOrder.shippingAddress.address) {
        setErrorMess("Vui lòng nhập địa chỉ giao hàng");
        return;
      }

      if (!newOrder.paymentMethod) {
        setErrorMess("Vui lòng chọn phương thức thanh toán");
        return;
      }

      // Chuẩn bị orderItems từ selectedProducts và productQty
      const orderItems = selectedProducts.map((product) => ({
        product: product._id,
        name: product.name,
        image: product.image,
        price: product.price,
        quantity: productQty[product._id] || 1,
      }));

      const payload = {
        orderItems,
        shippingAddress: newOrder.shippingAddress,
        paymentMethod: newOrder.paymentMethod,
        userId: userSearchResult._id,
        isPaid: false
      };

      await createOrderByAdmin(payload);
      setIsAddModalOpen(false);
      toastCustom({
        title: "Thành công",
        description: "Đã thêm đơn hàng mới!",
      });

      // Refresh danh sách đơn hàng
      await getAllOrders({
        page,
        limit,
        q: filterValue,
        status: statusFilter,
        sortBy,
        sortOrder,
      });

      // Reset form
      setUserEmail("");
      setUserSearchResult(null);
      setSelectedProducts([]);
      setProductQty({});
      setNewOrder({
        shippingAddress: {
          address: "",
          city: "",
          postalCode: "",
          country: "",
        },
        paymentMethod: "",
      });
    } catch (error) {
      setErrorMess(error.message || "Không thể thêm đơn hàng");
    }
  };

  // Thêm hàm render cell cho bảng
  const renderCell = (item, columnKey) => {
    const cellValue = item[columnKey];

    switch (columnKey) {
      case "index":
        return item.index;
      case "orderId":
        return item._id;
      case "user":
        return item.user ? `${item.user.username || item.user.email}` : "Không xác định";
      case "createdAt":
        return formatDate(item.createdAt);
      case "totalPrice":
        return formatPrice(item.totalPrice);
      case "isPaid":
        return (
          <Chip
            color={item.isPaid ? "success" : "danger"}
            size="sm"
            variant="flat"
          >
            {item.isPaid ? "Đã thanh toán" : "Chưa thanh toán"}
          </Chip>
        );
      case "isDelivered":
        return (
          <Chip
            color={item.isDelivered ? "success" : "warning"}
            size="sm"
            variant="flat"
          >
            {item.isDelivered ? "Đã giao hàng" : "Chưa giao hàng"}
          </Chip>
        );
      case "actions":
        return (
          <div className="flex gap-2">
            <Button
              color="primary"
              size="sm"
              variant="flat"
              onPress={() => handleViewOrder(item)}
            >
              Xem
            </Button>
            <Button
              color="danger"
              size="sm"
              variant="flat"
              onPress={() => handleDeleteClick(item)}
            >
              Xóa
            </Button>
          </div>
        );
      default:
        return cellValue;
    }
  };

  // Hàm toggle trạng thái thanh toán
  const togglePaymentStatus = async (orderId) => {
    try {
      const newStatus = !selectedOrder.isPaid;
      await updateOrder(orderId, { isPaid: newStatus });
      toastCustom({
        title: "Thành công",
        description: `Đã cập nhật trạng thái thanh toán thành ${newStatus ? "đã thanh toán" : "chưa thanh toán"}`,
      });

      // Refresh danh sách đơn hàng
      await getAllOrders({
        page,
        limit,
        q: filterValue,
        status: statusFilter,
        sortBy,
        sortOrder,
      });

      // Nếu đang xem chi tiết đơn hàng, cập nhật thông tin
      if (selectedOrder && selectedOrder._id === orderId) {
        const response = await getOrderDetails(orderId);
        setSelectedOrder(response.order);
      }
    } catch (error) {
      setErrorMess(error.message || "Không thể cập nhật trạng thái thanh toán");
    }
  };

  // Hàm toggle trạng thái giao hàng
  const toggleDeliveryStatus = async (orderId) => {
    try {
      const newStatus = !selectedOrder.isDelivered;
      await updateOrder(orderId, { isDelivered: newStatus });
      toastCustom({
        title: "Thành công",
        description: `Đã cập nhật trạng thái giao hàng thành ${newStatus ? "đã giao hàng" : "chưa giao hàng"}`,
      });

      // Refresh danh sách đơn hàng
      await getAllOrders({
        page,
        limit,
        q: filterValue,
        status: statusFilter,
        sortBy,
        sortOrder,
      });

      // Nếu đang xem chi tiết đơn hàng, cập nhật thông tin
      if (selectedOrder && selectedOrder._id === orderId) {
        const response = await getOrderDetails(orderId);
        setSelectedOrder(response.order);
      }
    } catch (error) {
      setErrorMess(error.message || "Không thể cập nhật trạng thái giao hàng");
    }
  };

  // Cập nhật state khi mở modal xem chi tiết
  useEffect(() => {
    if (selectedOrder) {
      setIsPaid(selectedOrder.isPaid);
      setIsDelivered(selectedOrder.isDelivered);
    }
  }, [selectedOrder]);

  return (
    <div className="container mx-auto py-8">
      <CustomModal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        title="Oops!"
        message={error || errorMess}
      />

      <h1 className="text-2xl font-bold mb-6">Quản lý đơn hàng</h1>

      <TopContent
        filterValue={filterValue}
        setFilterValue={(value) => {
          setFilterValue(value);
          setPage(1);
        }}
        visibleColumns={visibleColumns}
        setVisibleColumns={setVisibleColumns}
        limit={limit}
        setLimit={setLimit}
        setPage={setPage}
        onAddNew={handleOpenAddModal}
        columns={columns}
      />

      {/* Select lọc trạng thái đơn hàng */}
      <div className="mb-4 flex flex-wrap gap-4 items-end">
        <Select
          label="Lọc trạng thái"
          size="sm"
          className="w-56"
          selectedKeys={[statusFilter]}
          onSelectionChange={(keys) => {
            const value = Array.from(keys)[0] || "";
            setStatusFilter(value);
            setPage(1);
          }}
        >
          <SelectItem key="" value="">
            Tất cả
          </SelectItem>
          <SelectItem key="paid" value="paid">
            Đã thanh toán
          </SelectItem>
          <SelectItem key="unpaid" value="unpaid">
            Chưa thanh toán
          </SelectItem>
          <SelectItem key="delivered" value="delivered">
            Đã giao hàng
          </SelectItem>
          <SelectItem key="undelivered" value="undelivered">
            Chưa giao hàng
          </SelectItem>
        </Select>
      </div>

      {isLoading && orders.length === 0 ? (
        <div className="flex justify-center items-center h-64">
          <Spinner size="lg" />
        </div>
      ) : (
        <TableComponent
          items={orders.map((order, index) => ({
            ...order,
            index: index + 1,
          }))}
          columns={columns}
          page={page}
          setPage={setPage}
          limit={limit}
          totalPages={totalPages}
          visibleColumns={visibleColumns}
          onEdit={handleViewOrder}
          onDelete={handleDeleteClick}
          isLoading={isLoading}
          onSort={handleSort}
          isSorting={true}
          renderCell={renderCell}
        />
      )}

      {/* Modal xem chi tiết đơn hàng */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        size="3xl"
      >
        <ModalContent>
          {selectedOrder && (
            <>
              <ModalHeader>Chi tiết đơn hàng #{selectedOrder._id}</ModalHeader>
              <ModalBody>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">
                      Thông tin khách hàng
                    </h3>
                    <div className="space-y-1">
                      <div>
                        <strong>Tên:</strong> {selectedOrder.user?.username}
                      </div>
                      <div>
                        <strong>Email:</strong> {selectedOrder.user?.email}
                      </div>
                    </div>

                    <h3 className="text-lg font-semibold mt-4 mb-2">
                      Địa chỉ giao hàng
                    </h3>
                    <div className="space-y-1">
                      <div>
                        <strong>Địa chỉ:</strong>{" "}
                        {selectedOrder.shippingAddress?.address}
                      </div>
                      <div>
                        <strong>Thành phố:</strong>{" "}
                        {selectedOrder.shippingAddress?.city}
                      </div>
                      <div>
                        <strong>Mã bưu điện:</strong>{" "}
                        {selectedOrder.shippingAddress?.postalCode}
                      </div>
                      <div>
                        <strong>Quốc gia:</strong>{" "}
                        {selectedOrder.shippingAddress?.country}
                      </div>
                    </div>

                    <h3 className="text-lg font-semibold mt-4 mb-2">
                      Thông tin thanh toán
                    </h3>
                    <div className="space-y-1">
                      <div>
                        <strong>Phương thức:</strong>{" "}
                        {selectedOrder.paymentMethod}
                      </div>
                      <div className="flex items-center gap-2">
                        <strong>Trạng thái:</strong>{" "}
                        <Chip
                          color={selectedOrder.isPaid ? "success" : "danger"}
                          size="sm"
                          variant="flat"
                        >
                          {selectedOrder.isPaid
                            ? "Đã thanh toán"
                            : "Chưa thanh toán"}
                        </Chip>
                      </div>
                      {selectedOrder.isPaid && (
                        <div>
                          <strong>Ngày thanh toán:</strong>{" "}
                          {formatDate(selectedOrder.paidAt)}
                        </div>
                      )}
                    </div>

                    <h3 className="text-lg font-semibold mt-4 mb-2">
                      Thông tin giao hàng
                    </h3>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <strong>Trạng thái:</strong>{" "}
                        <Chip
                          color={
                            selectedOrder.isDelivered ? "success" : "warning"
                          }
                          size="sm"
                          variant="flat"
                        >
                          {selectedOrder.isDelivered
                            ? "Đã giao hàng"
                            : "Chưa giao hàng"}
                        </Chip>
                      </div>
                      {selectedOrder.isDelivered && (
                        <div>
                          <strong>Ngày giao hàng:</strong>{" "}
                          {formatDate(selectedOrder.deliveredAt)}
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-2">
                      Sản phẩm đặt hàng
                    </h3>
                    <div className="space-y-4 max-h-60 overflow-y-auto">
                      {selectedOrder.orderItems.map((item) => (
                        <div
                          key={item._id}
                          className="flex items-center border-b pb-2"
                        >
                          <div className="flex-1">
                            <div className="font-medium">{item.name}</div>
                            <div className="text-sm text-gray-600">
                              Số lượng: {item.quantity} | Giá: {formatPrice(item.price)} | Tổng: {formatPrice(item.quantity * item.price)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 border-t pt-4">
                      <div className="flex justify-between mb-1">
                        <span>Tạm tính:</span>
                        <span>{formatPrice(selectedOrder.itemsPrice)}</span>
                      </div>
                      <div className="flex justify-between mb-1">
                        <span>Phí vận chuyển:</span>
                        <span>{formatPrice(selectedOrder.shippingPrice)}</span>
                      </div>
                      <div className="flex justify-between mb-1">
                        <span>Thuế:</span>
                        <span>{formatPrice(selectedOrder.taxPrice)}</span>
                      </div>
                      <div className="flex justify-between font-bold text-lg mt-2 pt-2 border-t">
                        <span>Tổng cộng:</span>
                        <span>{formatPrice(selectedOrder.totalPrice)}</span>
                      </div>
                    </div>

                    <div className="mt-6 flex gap-2">
                      <Button
                        color={isPaid ? "danger" : "success"}
                        onPress={() => togglePaymentStatus(selectedOrder._id)}
                        isLoading={isLoading}
                      >
                        {isPaid
                          ? "Đánh dấu chưa thanh toán"
                          : "Đánh dấu đã thanh toán"}
                      </Button>
                      <Button
                        color={isDelivered ? "danger" : "success"}
                        onPress={() => toggleDeliveryStatus(selectedOrder._id)}
                        isLoading={isLoading}
                      >
                        {isDelivered ? "Đánh dấu chưa giao hàng" : "Đánh dấu đã giao hàng"}
                      </Button>
                    </div>
                  </div>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button
                  color="danger"
                  variant="light"
                  onPress={() => setIsViewModalOpen(false)}
                >
                  Đóng
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Modal thêm đơn hàng mới */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setUserEmail("");
          setUserSearchResult(null);
          setSelectedProducts([]);
          setProductQty({});
          setNewOrder({
            shippingAddress: {
              address: "",
              city: "",
              postalCode: "",
              country: "",
            },
            paymentMethod: "",
          });
        }}
        size="3xl"
      >
        <ModalContent>
          <ModalHeader>Thêm đơn hàng mới</ModalHeader>
          <ModalBody>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Card className="mb-6">
                  <CardHeader className="bg-gray-50 border-b">
                    <h2 className="text-lg font-semibold">
                      Thông tin khách hàng
                    </h2>
                  </CardHeader>
                  <CardBody>
                    <Input
                      label="Email khách hàng"
                      value={userEmail}
                      type="text"
                      onChange={(e) => setUserEmail(e.target.value)}
                      placeholder="Nhập email khách hàng"
                      onBlur={handleSearchUserByEmail}
                    />
                    {userSearchLoading && (
                      <Spinner
                        size="sm"
                        className="inline-block align-middle mr-2"
                      />
                    )}
                    {userSearchResult ? (
                      <div className="mt-2 text-green-600 text-xs">
                        <div>
                          <strong>Họ tên:</strong> {userSearchResult.username}
                        </div>
                        <div>
                          <strong>Email:</strong> {userSearchResult.email}
                        </div>
                        {userSearchResult.phone && (
                          <div>
                            <strong>Số điện thoại:</strong>{" "}
                            {userSearchResult.phone}
                          </div>
                        )}
                      </div>
                    ) : userEmail && !userSearchLoading ? (
                      <div className="mt-2 text-red-500 text-xs">
                        Không tìm thấy người dùng
                      </div>
                    ) : null}
                  </CardBody>
                </Card>

                <Card className="mb-6">
                  <CardHeader className="bg-gray-50 border-b">
                    <h2 className="text-lg font-semibold">
                      Thông tin giao hàng
                    </h2>
                  </CardHeader>
                  <CardBody>
                    <Input
                      label="Địa chỉ"
                      value={newOrder.shippingAddress.address}
                      onChange={(e) =>
                        setNewOrder({
                          ...newOrder,
                          shippingAddress: {
                            ...newOrder.shippingAddress,
                            address: e.target.value,
                          },
                        })
                      }
                      placeholder="Nhập địa chỉ"
                    />
                    <Input
                      label="Thành phố"
                      value={newOrder.shippingAddress.city}
                      onChange={(e) =>
                        setNewOrder({
                          ...newOrder,
                          shippingAddress: {
                            ...newOrder.shippingAddress,
                            city: e.target.value,
                          },
                        })
                      }
                      placeholder="Nhập thành phố"
                    />
                    <Input
                      label="Mã bưu điện"
                      value={newOrder.shippingAddress.postalCode}
                      onChange={(e) =>
                        setNewOrder({
                          ...newOrder,
                          shippingAddress: {
                            ...newOrder.shippingAddress,
                            postalCode: e.target.value,
                          },
                        })
                      }
                      placeholder="Nhập mã bưu điện"
                    />
                    <Input
                      label="Quốc gia"
                      value={newOrder.shippingAddress.country}
                      onChange={(e) =>
                        setNewOrder({
                          ...newOrder,
                          shippingAddress: {
                            ...newOrder.shippingAddress,
                            country: e.target.value,
                          },
                        })
                      }
                      placeholder="Nhập quốc gia"
                    />
                  </CardBody>
                </Card>

                <Card>
                  <CardHeader className="bg-gray-50 border-b">
                    <h2 className="text-lg font-semibold">
                      Phương thức thanh toán
                    </h2>
                  </CardHeader>
                  <CardBody>
                    <Select
                      label="Chọn phương thức thanh toán"
                      selectedKeys={[newOrder.paymentMethod]}
                      onSelectionChange={(keys) =>
                        setNewOrder({
                          ...newOrder,
                          paymentMethod: Array.from(keys)[0] || "",
                        })
                      }
                    >
                      <SelectItem key="PayPal" value="PayPal">
                        PayPal
                      </SelectItem>
                      <SelectItem key="COD" value="COD">
                        COD
                      </SelectItem>
                    </Select>
                  </CardBody>
                </Card>
              </div>

              <div>
                <Card>
                  <CardHeader className="bg-gray-50 border-b">
                    <h2 className="text-lg font-semibold">Sản phẩm</h2>
                  </CardHeader>
                  <CardBody>
                    <div className="space-y-2 max-h-72 overflow-y-auto">
                      {products && products.length > 0 ? (
                        products.map((product) => (
                          <div
                            key={product._id}
                            className="flex items-center gap-2 border-b pb-2"
                          >
                            <input
                              type="checkbox"
                              checked={selectedProducts.some(
                                (p) => p._id === product._id
                              )}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedProducts([
                                    ...selectedProducts,
                                    product,
                                  ]);
                                  setProductQty({
                                    ...productQty,
                                    [product._id]: 1,
                                  });
                                } else {
                                  setSelectedProducts(
                                    selectedProducts.filter(
                                      (p) => p._id !== product._id
                                    )
                                  );
                                  const { [product._id]: _, ...rest } =
                                    productQty;
                                  setProductQty(rest);
                                }
                              }}
                            />
                            <span>{product.name}</span>
                            <Input
                              type="number"
                              min={1}
                              value={productQty[product._id] || 1}
                              disabled={
                                !selectedProducts.some(
                                  (p) => p._id === product._id
                                )
                              }
                              onChange={(e) =>
                                setProductQty({
                                  ...productQty,
                                  [product._id]: Math.max(
                                    1,
                                    Number(e.target.value)
                                  ),
                                })
                              }
                              className="w-20"
                            />
                            <span className="ml-2 text-gray-500">
                              {formatPrice(product.price)}
                            </span>
                          </div>
                        ))
                      ) : (
                        <p>Không có sản phẩm</p>
                      )}
                    </div>
                  </CardBody>
                </Card>
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button
              color="danger"
              variant="light"
              onPress={() => {
                setIsAddModalOpen(false);
                setUserEmail("");
                setUserSearchResult(null);
                setSelectedProducts([]);
                setProductQty({});
                setNewOrder({
                  shippingAddress: {
                    address: "",
                    city: "",
                    postalCode: "",
                    country: "",
                  },
                  paymentMethod: "",
                });
              }}
            >
              Hủy
            </Button>
            <Button
              color="primary"
              onPress={handleAddOrderSubmit}
              disabled={isLoading}
              isLoading={isLoading}
            >
              Thêm đơn hàng
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Modal xác nhận xóa đơn hàng */}
      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onDelete={handleDeleteConfirm}
        title="Xóa đơn hàng"
        content={`Bạn có chắc chắn muốn xóa đơn hàng #${selectedOrder?._id}? Hành động này không thể hoàn tác.`}
      />
    </div>
  );
}
