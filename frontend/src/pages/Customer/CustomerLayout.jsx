
import React, { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  Link,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Avatar,
  Button,
  addToast,
} from "@heroui/react";
import { X } from "lucide-react";
import useUserStore from "../../store/userStore";

const ShopLogo = () => {
  return (
    <svg fill="none" height="36" viewBox="0 0 32 32" width="36">
      <path
        clipRule="evenodd"
        d="M17.6482 10.1305L15.8785 7.02583L7.02979 22.5499H10.5278L17.6482 10.1305ZM19.8798 14.0457L18.11 17.1983L19.394 19.4511H16.8453L15.1056 22.5499H24.7272L19.8798 14.0457Z"
        fill="currentColor"
        fillRule="evenodd"
      />
    </svg>
  );
};

export default function CustomerLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { currentUser: user, logout, defaultImage } = useUserStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      addToast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
        timeout: 5000,
        shouldShowTimeoutProgress: true,
        classNames: {
          closeButton: "opacity-100 absolute right-4 top-1/2 -translate-y-1/2",
          icon: "w-6 h-6",
        },
        closeIcon: <X size={16} strokeWidth={0.75} absoluteStrokeWidth />,
        color: "success",
      });
      navigate("/login");
    } catch (error) {
      addToast({
        title: "Logout Failed",
        description: error.message || "An error occurred while logging out.",
        timeout: 5000,
        color: "danger",
      });
    }
  };

  const menuItems = [
    { name: "Home", href: "/" },
    { name: "Products", href: "/products" },
    { name: "Categories", href: "/categories" },
    { name: "Cart", href: "/cart" },
    { name: "Contact", href: "/contact" },
  ];

  const avatarSrc = user?.image
    ? `http://localhost:3000${user.image}`
    : `http://localhost:3000${defaultImage}`;

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar className="bg-white shadow-lg">
        <NavbarBrand>
          <ShopLogo />
          <p className="font-bold text-indigo-600 text-2xl">VLU Shop</p>
        </NavbarBrand>

        <NavbarContent className="hidden sm:flex gap-4" justify="center">
          {menuItems.map((item) => (
            <NavbarItem key={item.name}>
              <Link color="foreground" href={item.href}>
                {item.name}
              </Link>
            </NavbarItem>
          ))}
        </NavbarContent>

        <NavbarContent as="div" justify="end">
          {user ? (
            <Dropdown placement="bottom-end">
              <DropdownTrigger>
                <Avatar
                  isBordered
                  as="button"
                  className="transition-transform"
                  color="secondary"
                  name={user.username}
                  size="sm"
                  src={avatarSrc}
                />
              </DropdownTrigger>
              <DropdownMenu aria-label="Profile Actions" variant="flat">
                <DropdownItem key="profile" className="h-14 gap-2">
                  <p className="font-semibold">Signed in as</p>
                  <p className="font-semibold">{user.email}</p>
                </DropdownItem>
                <DropdownItem key="settings" href="/profile">
                  Profile
                </DropdownItem>
                <DropdownItem key="orders" href="/orders">
                  My Orders
                </DropdownItem>
                <DropdownItem key="logout" color="danger" onClick={handleLogout}>
                  Log Out
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          ) : (
            <NavbarItem>
              <Button as={Link} color="primary" href="/login" variant="flat">
                Login
              </Button>
            </NavbarItem>
          )}
        </NavbarContent>

        <NavbarContent className="sm:hidden" justify="end">
          <Button
            isIconOnly
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-gray-400 hover:text-gray-500"
          >
            <span className="text-2xl">☰</span>
          </Button>
        </NavbarContent>

        {mobileMenuOpen && (
          <div className="sm:hidden w-full bg-white">
            <NavbarContent className="flex flex-col p-4 gap-2">
              {menuItems.map((item) => (
                <NavbarItem key={item.name}>
                  <Link color="foreground" href={item.href} className="w-full">
                    {item.name}
                  </Link>
                </NavbarItem>
              ))}
              {user ? (
                <>
                  <NavbarItem>
                    <Link color="foreground" href="/profile" className="w-full">
                      Profile
                    </Link>
                  </NavbarItem>
                  <NavbarItem>
                    <Link color="foreground" href="/orders" className="w-full">
                      My Orders
                    </Link>
                  </NavbarItem>
                  <NavbarItem>
                    <Link
                      color="danger"
                      href="/logout"
                      className="w-full"
                      onClick={handleLogout}
                    >
                      Logout
                    </Link>
                  </NavbarItem>
                </>
              ) : (
                <NavbarItem>
                  <Link color="primary" href="/login" className="w-full">
                    Login
                  </Link>
                </NavbarItem>
              )}
            </NavbarContent>
          </div>
        )}
      </Navbar>

      <div className="flex">
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}