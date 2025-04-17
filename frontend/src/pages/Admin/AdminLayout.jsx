// Description: This file contains the AdminLayout component which serves as the main layout for the admin dashboard.
/// FIX GET AVATAR

import React, { useState } from "react";
import { href, Outlet, useNavigate } from "react-router-dom";
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

const AcmeLogo = () => {
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

export default function AdminLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logout, defaultImage } = useUserStore(); // Added defaultImage
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
    { name: "Dashboard", href: "/admin/dashboard" },
    { name: "Category", href: "/admin/category" },
    { name: "Users", href: "/admin/users" },
    { name: "Product", href: "/admin/products" },
    { name: "Reviews", href: "/admin/reviews" },
    { name: "Order", href: "/admin/orders" },
  ];

  // Construct the avatar image URL
  const avatarSrc = user?.image
    ? `http://localhost:3000${user.image}`
    : `http://localhost:3000${defaultImage}`;

  return (
    <div className="min-h-screen">
      {/* Navbar */}
      <Navbar position="sticky" className="bg-white shadow-lg w-full">
        <NavbarBrand>
          <AcmeLogo />
          <p className="font-bold text-indigo-600 text-2xl">Hello Admin</p>
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
          <Dropdown placement="bottom-end">
            <DropdownTrigger>
              <Avatar
                isBordered
                as="button"
                className="transition-transform"
                color="secondary"
                name={user?.username ?? "Admin User"} // Simplified with nullish coalescing
                size="sm"
                src={avatarSrc} // Use constructed avatar URL
              />
            </DropdownTrigger>
            <DropdownMenu aria-label="Profile Actions" variant="flat">
              <DropdownItem key="profile" className="h-14 gap-2">
                <p className="font-semibold">Signed in as</p>
                <p className="font-semibold">
                  {user?.email ?? "admin@example.com"}
                </p>
              </DropdownItem>
              <DropdownItem key="settings" href="/admin/profile">
                Profile
              </DropdownItem>
              <DropdownItem key="logout" color="danger" onPress={handleLogout}>
                Log Out
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </NavbarContent>

        <NavbarContent className="sm:hidden" justify="end">
          <Button
            isIconOnly
            onPress={() => setMobileMenuOpen(!mobileMenuOpen)}
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
              <NavbarItem>
                <Link
                  color="foreground"
                  href="/admin/profile"
                  className="w-full"
                >
                  Profile
                </Link>
              </NavbarItem>
              <NavbarItem>
                <Link
                  color="danger"
                  href="/logout"
                  className="w-full"
                  onPress={handleLogout}
                >
                  Logout
                </Link>
              </NavbarItem>
            </NavbarContent>
          </div>
        )}
      </Navbar>

      <div className="flex">
        {/* Main content */}
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
