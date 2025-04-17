import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import useUserStore from "../store/userStore";
import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenuToggle,
  NavbarMenu,
  NavbarMenuItem,
  Button,
  Avatar,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Badge,
} from "@heroui/react";
import { ShoppingCart, User, LogOut, Menu } from "lucide-react";
import useCartStore from "../store/cartStore";

const CustomerLayout = ({ children }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { currentUser, logout } = useUserStore();
  const { cartItems } = useCartStore();
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    { name: "Trang chủ", path: "/" },
    { name: "Sản phẩm", path: "/products" },
    { name: "Giỏ hàng", path: "/cart" },
    { name: "Đơn hàng", path: "/orders" },
  ];

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar
        isBordered
        isMenuOpen={isMenuOpen}
        onMenuOpenChange={setIsMenuOpen}
        className="bg-white shadow-sm"
      >
        <NavbarContent className="sm:hidden" justify="start">
          <NavbarMenuToggle
            icon={<Menu className="w-6 h-6" />}
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          />
        </NavbarContent>

        <NavbarContent className="sm:hidden pr-3" justify="center">
          <NavbarBrand>
            <Link to="/" className="font-bold text-xl text-primary">
              Shop
            </Link>
          </NavbarBrand>
        </NavbarContent>

        <NavbarContent className="hidden sm:flex gap-4" justify="center">
          <NavbarBrand>
            <Link to="/" className="font-bold text-xl text-primary">
              Shop
            </Link>
          </NavbarBrand>
          {menuItems.map((item) => (
            <NavbarItem key={item.path}>
              <Link
                to={item.path}
                className={`${
                  location.pathname === item.path
                    ? "text-primary font-semibold"
                    : "text-gray-600 hover:text-primary"
                }`}
              >
                {item.name}
              </Link>
            </NavbarItem>
          ))}
        </NavbarContent>

        <NavbarContent justify="end">
          <NavbarItem>
            <Link to="/cart" className="relative">
              <Badge
                content={cartItems.length}
                color="primary"
                size="sm"
                shape="circle"
              >
                <ShoppingCart className="w-6 h-6 text-gray-600 hover:text-primary" />
              </Badge>
            </Link>
          </NavbarItem>
          <NavbarItem>
            <Dropdown placement="bottom-end">
              <DropdownTrigger>
                <Avatar
                  isBordered
                  as="button"
                  className="transition-transform"
                  color="primary"
                  size="sm"
                  icon={<User className="w-4 h-4" />}
                />
              </DropdownTrigger>
              <DropdownMenu aria-label="Profile Actions" variant="flat">
                <DropdownItem key="profile" className="h-14 gap-2">
                  <p className="font-semibold">Đăng nhập với</p>
                  <p className="font-semibold">{currentUser?.email}</p>
                </DropdownItem>
                <DropdownItem key="settings">
                  <Link to="/profile" className="w-full">
                    Thông tin cá nhân
                  </Link>
                </DropdownItem>
                <DropdownItem key="orders">
                  <Link to="/orders" className="w-full">
                    Đơn hàng của tôi
                  </Link>
                </DropdownItem>
                <DropdownItem
                  key="logout"
                  color="danger"
                  className="text-danger"
                  onClick={handleLogout}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Đăng xuất
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </NavbarItem>
        </NavbarContent>

        <NavbarMenu>
          {menuItems.map((item) => (
            <NavbarMenuItem key={item.path}>
              <Link
                to={item.path}
                className={`w-full ${
                  location.pathname === item.path
                    ? "text-primary font-semibold"
                    : "text-gray-600"
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                {item.name}
              </Link>
            </NavbarMenuItem>
          ))}
        </NavbarMenu>
      </Navbar>

      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  );
};

export default CustomerLayout; 