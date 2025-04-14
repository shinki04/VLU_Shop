import { Loader, Lock, Mail, User, EyeClosed, Eye } from "lucide-react";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
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
} from "@heroui/react";

const RegisterPage = () => {
  const [name, setName] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isVisible, setIsVisible] = useState(false);

  const navigate = useNavigate();
  const { register, error, isLoading } = useAuthStore();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const handleSignUp = async (e) => {
    e.preventDefault();
    try {
      await register(email, password, name);
      navigate("/verify-email");
    } catch (error) {
      console.log(error);
    }
  };

  const validatePassword = (value) =>
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/.test(value);

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

  const toggleVisibility = () => setIsVisible(!isVisible);

  useEffect(() => {
    if (error) {
      onOpen();
    }
  }, [error, onOpen]);

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
            <div className="flex flex-wrap w-full">
              <Input
                isRequired
                label="User Name"
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
                color={
                  password === ""
                    ? "default"
                    : validatePassword(password)
                    ? "default"
                    : "danger"
                }
                isInvalid={password !== "" && !validatePassword(password)}
                errorMessage="Please enter valid password"
                label="Password"
                labelPlacement="outside"
                name="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type={isVisible ? "text" : "password"}
                className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-black"
                endContent={
                  <button
                    aria-label="toggle password visibility"
                    className="focus:outline-none absolute right-3 top-1/2 transform -translate-y-1/2"
                    type="button"
                    onClick={toggleVisibility}
                  >
                    {isVisible ? (
                      <EyeClosed
                        size={16}
                        strokeWidth={1.5}
                        className="text-xl text-gray-400 pointer-events-none"
                      />
                    ) : (
                      <Eye
                        size={16}
                        strokeWidth={1.5}
                        className="text-xl text-gray-400 pointer-events-none"
                      />
                    )}
                  </button>
                }
              />
              {/* Password Requirements */}
              <ul className="mt-2 text-xs text-gray-500 list-disc list-inside">
                <li>Minimum 8 characters</li>
                <li>Must contain at least 1 number</li>
                <li>Must contain at least 1 uppercase and 1 lowercase</li>
                <li>Must contain at least 1 symbol</li>
              </ul>
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
      <CustomModal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        title="Oops!"
        message={error}
      />
    </div>
  );
};

export default RegisterPage;
