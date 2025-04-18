import React from "react";
import useUserStore from "../../store/userStore";
import { useState, useEffect } from "react";
import {
  Mail,
  Lock,
  Loader,
  EyeClosed,
  Eye,
  CircleCheck,
  X,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import CustomModal from "../../components/Modal/CustomModal";
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
  addToast,
  ToastProvider,
} from "@heroui/react";
import { toastCustom } from "../../hooks/toastCustom";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { login, isLoading, error, user, clearError, forgotPassword } =
    useUserStore();
  const [isVisible, setIsVisible] = useState(false);
  const { isOpen, onOpen, onOpenChange } = useDisclosure(); // THÊM onOpen

  const toggleVisibility = () => setIsVisible(!isVisible);
  const navigate = useNavigate();
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate("/");
    } catch (error) {
      console.log(error);
    }
  };
  const handleForgetPassword = async () => {
    navigate("/forgot-password");
  };

  useEffect(() => {
    if (user?.username) {
      addToast({
        title: "Success",
        description: "Welcome back " + user.username,
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
  }, [user]);

  useEffect(() => {
    if (error) {
      onOpen();
      setTimeout(() => {
        onOpenChange(false);
        clearError();
      }, 9000);
    }
  }, [error, onOpen, clearError]);

  return (
    <div className="flex min-h-screen bg-gray-100 items-center justify-center">
      {/* Container to align form and image */}
      <div className="flex w-full max-w-4xl rounded-lg overflow-hidden shadow-lg">
        {/* Left Side: Form Content */}
        <div className="w-1/2 bg-white p-6">
          {/* Header */}
          <h2 className="text-3xl font-bold text-center mb-6">LOGIN</h2>

          {/* Tabs Section */}
          {/* <div className="flex flex-wrap gap-4 mb-6 justify-center">
            <Tabs aria-label="Tabs colors" color="default" radius="full">
              <Tab key="photos" title="Photos" />
              <Tab key="music" title="Music" />
              <Tab key="videos" title="Videos" />
            </Tabs>
          </div> */}

          {/* Form */}
          <Form className="flex flex-col gap-4" onSubmit={handleLogin}>
            {/* Email Field */}
            <div className="flex flex-wrap w-full ">
              <div className="flex items-center gap-2 mb-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="size-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
                  />
                </svg>
                <label className="text-gray-700 font-medium">Email</label>
              </div>
              <Input
                isRequired
                errorMessage="Please enter a valid email"
                // label="Email"
                labelPlacement="outside"
                name="email"
                placeholder="Enter your email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>

            {/* Password Field */}
            <div className="flex flex-wrap w-full">
              <div className="flex items-center gap-2 mb-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="size-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"
                  />
                </svg>
                <label className="text-gray-700 font-medium">Password</label>
              </div>
              <Input
                isRequired
                errorMessage="Please enter valid password"
                // label="Password"
                labelPlacement="outside"
                name="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-black"
                endContent={
                  <button
                    aria-label="toggle password visibility"
                    className="focus:outline-none"
                    type="button"
                    onClick={toggleVisibility}
                  >
                    {isVisible ? (
                      <EyeClosed className="text-2xl text-default-400 pointer-events-none" />
                    ) : (
                      <Eye className="text-2xl text-default-400 pointer-events-none" />
                    )}
                  </button>
                }
                type={isVisible ? "text" : "password"}
              />

              {/* Password Requirements */}
              {/* <ul className="mt-2 text-xs text-gray-500 list-disc list-inside">
                <li>Minimum 8 characters</li>
                <li>Must contain at least 1 number</li>
                <li>Must contain at least 1 uppercase and 1 lowercase</li>
                <li>Must contain at least 1 symbol</li>
              </ul> */}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full bg-black text-white rounded-md py-2 flex items-center justify-center gap-2 hover:bg-gray-800 transition"
            >
              {isLoading ? (
                <Loader className="animate-spin mx-auto" size={24} />
              ) : (
                <>
                  LOGIN
                  <span>→</span>
                </>
              )}
            </Button>

            <p className="text-center text-sm text-gray-600 mt-4">
              Forrget Password?{" "}
              <a
                href="/forgot-password"
                className="text-blue-500 hover:underline"
              >
                Reset Password
              </a>
            </p>
            {/* Register Link */}
            <p className="text-center text-sm text-gray-600 mt-4">
              Don’t have an account?{" "}
              <Link to="/register" className="text-blue-500 hover:underline">
                Register here
              </Link>
            </p>
          </Form>
        </div>

        {/* Right Side: Image */}
        <div className="w-1/2 hidden md:block">
          <img
            src="https://hstatic.net/969/1000003969/10/2016/6-23/cach-xep-do-gon-trong-tui-be-xiu__6_.jpg"
            alt="Login Illustration"
            className="w-full h-full object-cover"
          />
        </div>
      </div>

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

export default LoginPage;
