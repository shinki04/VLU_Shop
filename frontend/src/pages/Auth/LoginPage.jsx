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
import CustomModal from "../../components/CustomModal";
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

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { login, isLoading, error, user, clearError } = useUserStore();
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

  useEffect(() => {
    if (user) {
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
          <div className="flex flex-wrap gap-4 mb-6 justify-center">
            <Tabs aria-label="Tabs colors" color="default" radius="full">
              <Tab key="photos" title="Photos" />
              <Tab key="music" title="Music" />
              <Tab key="videos" title="Videos" />
            </Tabs>
          </div>

          {/* Form */}
          <Form className="flex flex-col gap-4" onSubmit={handleLogin}>
            {/* Email Field */}
            <div className="flex flex-wrap w-full ">
              <Input
                isRequired
                errorMessage="Please enter a valid email"
                label="Email"
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
              <Input
                isRequired
                errorMessage="Please enter valid password"
                label="Password"
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
