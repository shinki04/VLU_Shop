import React from "react";
import useUserStore from "../store/userStore";
import { useState, useEffect } from "react";
import {
  Mail,
  Lock,
  Loader,
  EyeClosed,
  Eye,
  CircleCheck,
  X,
  Check,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Form,
  Input,
  Button,
  Tabs,
  Tab,
  Card,
  CardBody,
  addToast,
  ToastProvider,
  User,
  Avatar,
} from "@heroui/react";
import CustomModal from "../components/CustomModal";

export default function HomePage() {
  const { isOpen, onOpen, onOpenChange } = useDisclosure(); // THÊM onOpen

  const { user, logout, error, isAuthenticated  } = useUserStore();
  const nagative = useNavigate();
  const handleLogout = async () => {
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
    nagative("/login");
  };

  const nagativeLogin = async () => {
    if (!user) {
      nagative("/login");
    } else {
      //  addToast({
      //   title: "Login r",
      //   description: "Burh",
      //   color:"primary"
      //  })
    }
  };

  useEffect(() => {
    if (error) {
      onOpen();
      
    }
  }, [error, onOpen]);
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white shadow-lg rounded-lg">
        <CardBody className="p-6">
          {/* Header */}
          <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">
            Welcome to Your Dashboard
          </h1>

      <Button onPress={handleLogout}>Logout</Button>
      {!isAuthenticated ? (
        <Button onPress={nagativeLogin}>Login</Button>
      ) : (
        <User
          avatarProps={{
            src: `http://localhost:3000${user.image}`,
          }}
          description={user.role}
          name={user.username}
        />
      )}

          {/* Action Buttons */}
          {isAuthenticated && (
            <div className="flex flex-col gap-4">
              <Button
                onPress={handleLogout}
                className="w-full bg-red-600 text-white rounded-md px-4 py-2 hover:bg-red-700 transition"
              >
                Logout
              </Button>
              <Button
                onPress={() =>
                  addToast({
                    title: "Test Notification",
                    description: "This is a sample toast message.",
                    timeout: 5000,
                    shouldShowTimeoutProgress: true,
                    classNames: {
                      closeButton:
                        "opacity-100 absolute right-4 top-1/2 -translate-y-1/2",
                      icon: "w-6 h-6",
                    },
                    closeIcon: (
                      <X size={16} strokeWidth={0.75} absoluteStrokeWidth />
                    ),
                    color: "primary",
                  })
                }
                className="w-full bg-gray-600 text-white rounded-md px-4 py-2 hover:bg-gray-700 transition"
              >
                Show Sample Toast
              </Button>
            </div>
          )}

          {/* Navigation Links */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              {isAuthenticated ? (
                <Link
                  to="/profile"
                  className="text-blue-500 hover:underline"
                >
                  View Profile
                </Link>
              ) : (
                <Link
                  to="/register"
                  className="text-blue-500 hover:underline"
                >
                  Don’t have an account? Register here
                </Link>
              )}
            </p>
          </div>
        </CardBody>
      </Card>

      {/* Error Modal */}
      <CustomModal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        title="Oops!"
        message={error}
      />
    </div>
  );
}