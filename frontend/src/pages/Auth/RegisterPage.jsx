import { Loader, Lock, Mail, User, EyeClosed, Eye } from "lucide-react";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  PasswordCriteria,
  PasswordStrengthMeter,
} from "../../components/PasswordStrengthMeter";
import CustomInputPass from "../../components/CustomInputPass";

import useUserStore from "../../store/userStore";
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
          <div className="flex flex-wrap gap-4 mb-6 justify-center">
            <Tabs aria-label="Tabs colors" color="default" radius="full">
              <Tab key="photos" title="Photos" />
              <Tab key="music" title="Music" />
              <Tab key="videos" title="Videos" />
            </Tabs>
          </div>

          {/* Form */}
          <Form className="flex flex-col gap-4" onSubmit={handleSignUp}>
            {/* Username Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                USERNAME
              </label>
              <Input
                isRequired
                name="name"
                placeholder="Enter your username"
                type="text"
                value={name}
                onChange={handleUsernameChange}
                isInvalid={!!usernameError}
                errorMessage={usernameError}
                className="w-full border border-gray-300 rounded-md p-2 h-10 focus:outline-none focus:ring-2 focus:ring-black overflow-hidden text-ellipsis whitespace-nowrap"
              />
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                EMAIL
              </label>
              <Input
                isRequired
                errorMessage="Please enter a valid email"
                name="email"
                placeholder="example@mail.com"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-gray-300 rounded-md p-2 h-10 focus:outline-none focus:ring-2 focus:ring-black overflow-hidden text-ellipsis whitespace-nowrap"
              />
            </div>
            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                PASSWORD
              </label>
              <div className="relative">
                <CustomInputPass
                  isRequired
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border border-gray-300 rounded-md p-2 h-10 focus:outline-none focus:ring-2 focus:ring-black overflow-hidden text-ellipsis whitespace-nowrap"
                />
              </div>
              {/* Password Requirements */}
              <PasswordCriteria password={password} />
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
