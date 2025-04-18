import { Loader, Lock, Mail, User, EyeClosed, Eye } from "lucide-react";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  PasswordCriteria,
  PasswordStrengthMeter,
} from "../../components/PasswordStrengthMeter";
import CustomInputPass from "../../components/CustomInputPass";

import useUserStore from "../../store/userStore";
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
  Card,
  CardBody,
} from "@heroui/react";
const RegisterPage = () => {
  const [name, setName] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const { isOpen, onOpen, onOpenChange } = useDisclosure(); // THÊM onOpen
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isVisible, setIsVisible] = useState(false);

  const navigate = useNavigate();
  const { register, error, isLoading, clearError } = useUserStore();

  const handleSignUp = async (e) => {
    e.preventDefault();
    try {
      await register(email, password, name);
      navigate("/verify-email");
    } catch (error) {
      console.log(error);
    }
  };

  const handleUsernameChange = (e) => {
    const value = e.target.value;
    setName(value);

    if (value === "") {
      setUsernameError("");
    } else if (value.length < 3) {
      setUsernameError("Username must be at least 3 characters long");
    } else if (!/^[a-zA-Z0-9_]+$/.test(value)) {
      setUsernameError(
        "Username can only contain letters, numbers, and underscores"
      );
    } else {
      setUsernameError("");
    }
  };

  // THÊM useEffect để mở Modal khi có lỗi
  useEffect(() => {
    if (error) {
      onOpen();
      clearError();
    }
  }, [error, onOpen, clearError]);

  return (
    <div className="flex min-h-screen bg-gray-100 items-center justify-center">
      {/* Container to align form and image */}
      <div className="flex w-full max-w-4xl rounded-lg overflow-hidden shadow-lg">
        {/* Left Side: Form Content */}
        <div className="w-1/2 bg-white p-6">
          {/* Header */}
          <h2 className="text-3xl font-bold text-center mb-6">REGISTER</h2>

          {/* Tabs Section */}
          {/* <div className="flex flex-wrap gap-4 mb-6 justify-center">
            <Tabs aria-label="Tabs colors" color="default" radius="full">
              <Tab key="photos" title="Photos" />
              <Tab key="music" title="Music" />
              <Tab key="videos" title="Videos" />
            </Tabs>
          </div> */}

          {/* Form */}
          <Form className="flex flex-col gap-4" onSubmit={handleSignUp}>
            {/* Username Field */}
            <div className="flex flex-wrap w-full">
              <div className="flex items-center gap-2 mb-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="size-5  "
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
                  />
                </svg>
                <label className="text-gray-700 font-medium">User Name</label>
              </div>
              <Input
                isRequired
                // label="User Name"
                labelPlacement="outside"
                name="name"
                placeholder="Enter your username"
                type="text"
                value={name}
                onChange={handleUsernameChange}
                isInvalid={!!usernameError}
                errorMessage={usernameError}
                className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>

            {/* Email Field */}
            <div className="flex flex-wrap w-full">
              <div className="flex items-center gap-2 mb-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="size-5 "
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16.5 12a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0Zm0 0c0 1.657 1.007 3 2.25 3S21 13.657 21 12a9 9 0 1 0-2.636 6.364M16.5 12V8.25"
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
              {/* <div className="flex items-center gap-2 mb-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="size-5 "
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"
                  />
                </svg>
                <label className="text-gray-700 font-medium">Password</label>
              </div> */}
              <CustomInputPass
                isRequired
                name="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-black"
                // className="w-full border border-gray-300 rounded-md p-2 h-10 focus:outline-none focus:ring-2 focus:ring-black overflow-hidden text-ellipsis whitespace-nowrap"
              />
            </div>

            {/* Password Requirements */}
            <PasswordCriteria password={password} />
            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full bg-black text-white rounded-md py-2 flex items-center justify-center gap-2 hover:bg-gray-800 transition"
            >
              {isLoading ? (
                <Loader className="animate-spin mx-auto" size={24} />
              ) : (
                <>
                  REGISTER
                  <span>→</span>
                </>
              )}
            </Button>

            {/* Login Link */}
            <p className="text-center text-sm text-gray-600 mt-4">
              Have an account?{" "}
              <Link to="/login" className="text-blue-500 hover:underline">
                Login here
              </Link>
            </p>
          </Form>
        </div>

        {/* Right Side: Image */}
        <div className="w-1/2 hidden md:block">
          <img
            src="https://hstatic.net/969/1000003969/10/2016/6-23/cach-xep-do-gon-trong-tui-be-xiu__2_.jpg"
            alt="Register Illustration"
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Error Modal */}
      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">Oops!</ModalHeader>
              <ModalBody>
                <div>
                  <h3 className="p-2">
                    Something went wrong:
                    {error && <p className="text-red-500">{error}</p>}
                  </h3>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Close
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};

export default RegisterPage;
