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
} from "@heroui/react";
import CustomModal from "../components/CustomModal";

export default function HomePage() {
  const { isOpen, onOpen, onOpenChange } = useDisclosure(); // THÊM onOpen

  const { user, logout, error, isAuthenticated  } = useUserStore();
  const nagative = useNavigate();
  const handleLogout = async () => {
    logout();
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
    <div>
      <Button
        variant="flat"
        onPress={() => {
          addToast({
            title: "Success",
            description: "Welcome back",
            timeout: 5000,
            shouldShowTimeoutProgress: true,
            classNames: {
              closeButton:
                "opacity-100 absolute right-4 top-1/2 -translate-y-1/2",
              icon: "w-6 h-6",
            },
            closeIcon: <X size={16} strokeWidth={0.75} absoluteStrokeWidth />,
            color: "success",
          });
        }}
      >
        Show Toast
      </Button>
      <Button onPress={onOpen} title="Open" />

      <Button onPress={handleLogout}>Logout</Button>
      {!isAuthenticated ? (
        <Button onPress={nagativeLogin}>Login</Button>
      ) : (
        <User
          avatarProps={{
            src: `http://localhost:3000${user.image}`,
          }}
          description={user.role}
          name={user.name}
        />
      )}

      <p>Name: {user?.username}</p>
      <p>Email: {user?.email}</p>
      <CustomModal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        title="Oops!"
        message={error}
      />
    </div>
  );
}
