<<<<<<< HEAD
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
=======
// import React from "react";
// import { useAuthStore } from "../store/authStore";
// import { useState, useEffect } from "react";
// import {
//   Mail,
//   Lock,
//   Loader,
//   EyeClosed,
//   Eye,
//   CircleCheck,
//   X,
//   Check,
// } from "lucide-react";
// import { Link, useNavigate } from "react-router-dom";
// import {
//   Modal,
//   ModalContent,
//   ModalHeader,
//   ModalBody,
//   ModalFooter,
//   useDisclosure,
//   Form,
//   Input,
//   Button,
//   Tabs,
//   Tab,
//   Card,
//   CardBody,
//   addToast,
//   ToastProvider,
//   User,
// } from "@heroui/react";
// import CustomModal from "../components/CustomModal";

// export default function HomePage() {
//   const { isOpen, onOpen, onOpenChange } = useDisclosure(); // THÊM onOpen

//   const { user, logout, error, isAuthenticated } = useAuthStore();
//   const nagative = useNavigate();
//   const handleLogout = async () => {
//     logout();
//   };

//   const nagativeLogin = async () => {
//     if (!user) {
//       nagative("/login");
//     } else {
//       //  addToast({
//       //   title: "Login r",
//       //   description: "Burh",
//       //   color:"primary"
//       //  })
//       <User
//         avatarProps={{
//           src: "https://i.pravatar.cc/150?u=a04258114e29026702d",
//         }}
//         description={user.role}
//         name={user.name}
//       />;
//     }
//   };

//   useEffect(() => {
//     if (error) {
//       onOpen();
//     }
//   }, [error, onOpen]);

//   return (
//     <div>
//       <Button
//         variant="flat"
//         onPress={() => {
//           addToast({
//             title: "Success",
//             description: "Welcome back",
//             timeout: 5000,
//             shouldShowTimeoutProgress: true,
//             classNames: {
//               closeButton:
//                 "opacity-100 absolute right-4 top-1/2 -translate-y-1/2",
//               icon: "w-6 h-6",
//             },
//             closeIcon: <X size={16} strokeWidth={0.75} absoluteStrokeWidth />,
//             color: "success",
//           });
//         }}
//       >
//         Show Toast
//       </Button>
//       <Button onPress={onOpen} title="Open" />

//       <Button onPress={handleLogout}>Logout</Button>
//       {!isAuthenticated ? (
//         <Button onPress={nagativeLogin}>Login</Button>
//       ) : (
//         <User
//           avatarProps={{
//             src: "https://i.pravatar.cc/150?u=a04258114e29026702d",
//           }}
//           description={user.role}
//           name={user.username}
//         />
//       )}

//       <p>Name: {user?.username}</p>
//       <p>Email: {user?.email}</p>
//       <CustomModal
//         isOpen={isOpen}
//         onOpenChange={onOpenChange}
//         title="Oops!"
//         message={error}
//       />
//     </div>
//   );
// }

import React, { useState, useEffect } from "react";
import { useAuthStore } from "../store/authStore";
import { Mail, Lock, Loader, EyeClosed, Eye, CircleCheck, X, Check } from "lucide-react";
>>>>>>> 30c4b3bd5a1da234c954de310036e8c7903b90bb
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
<<<<<<< HEAD
  const { isOpen, onOpen, onOpenChange } = useDisclosure(); // THÊM onOpen

  const { user, logout, error, isAuthenticated  } = useUserStore();
  const nagative = useNavigate();
=======
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const { user, logout, error, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

>>>>>>> 30c4b3bd5a1da234c954de310036e8c7903b90bb
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
    navigate("/login");
  };

<<<<<<< HEAD
  const nagativeLogin = async () => {
    if (!user) {
      nagative("/login");
    } else {
      //  addToast({
      //   title: "Login r",
      //   description: "Burh",
      //   color:"primary"
      //  })
=======
  const handleLoginNavigation = () => {
    if (!isAuthenticated) {
      navigate("/login");
>>>>>>> 30c4b3bd5a1da234c954de310036e8c7903b90bb
    }
  };

  useEffect(() => {
    if (error) {
      onOpen();
      
    }
  }, [error, onOpen]);
<<<<<<< HEAD
=======

  useEffect(() => {
    if (isAuthenticated && user) {
      addToast({
        title: "Welcome Back",
        description: `Hello, ${user.username}!`,
        timeout: 5000,
        shouldShowTimeoutProgress: true,
        classNames: {
          closeButton: "opacity-100 absolute right-4 top-1/2 -translate-y-1/2",
          icon: "w-6 h-6",
        },
        closeIcon: <X size={16} strokeWidth={0.75} absoluteStrokeWidth />,
        color: "success",
      });
    }
  }, [isAuthenticated, user]);

>>>>>>> 30c4b3bd5a1da234c954de310036e8c7903b90bb
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white shadow-lg rounded-lg">
        <CardBody className="p-6">
          {/* Header */}
          <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">
            Welcome to Your Dashboard
          </h1>

<<<<<<< HEAD
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
=======
          {/* User Profile or Login Prompt */}
          {isAuthenticated && user ? (
            <div className="flex flex-col items-center mb-6">
              <User
                avatarProps={{
                  src: user.avatar || "https://i.pravatar.cc/150?u=a04258114e29026702d",
                  className: "w-16 h-16",
                }}
                name={user.username}
                description={user.role || "User"}
                className="mb-4"
              />
              <div className="text-center text-gray-600">
                <p className="text-sm">
                  <span className="font-medium">Name:</span> {user.username}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Email:</span> {user.email}
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center mb-6">
              <p className="text-gray-600 mb-4">
                Please log in to access your dashboard.
              </p>
              <Button
                onPress={handleLoginNavigation}
                className="bg-blue-600 text-white rounded-md px-4 py-2 hover:bg-blue-700 transition"
              >
                Go to Login
              </Button>
            </div>
          )}
>>>>>>> 30c4b3bd5a1da234c954de310036e8c7903b90bb

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