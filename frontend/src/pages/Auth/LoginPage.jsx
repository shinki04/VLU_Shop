import React from "react";
import { useAuthStore } from "../../store/authStore";
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
  Card,
  CardBody,
  addToast,
  ToastProvider,
} from "@heroui/react";
function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { login, isLoading, error, user } = useAuthStore();
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
  // THÊM useEffect để mở Modal khi có lỗi
  useEffect(() => {
    if (error) {
      onOpen();
    }
  }, [error, onOpen]);

  return (
    <>
      <div className="column-6"></div>
      <div className="column-6">
        <div className="flex flex-wrap gap-4">
          <Tabs aria-label="Tabs colors" color="default" radius="full">
            <Tab key="photos" title="Photos" />
            <Tab key="music" title="Music" />
            <Tab key="videos" title="Videos" />
          </Tabs>
        </div>

        <Form
          className="w-full max-w-xs flex flex-col gap-4"
          onSubmit={handleLogin}
        >
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
          />
          <Input
            isRequired
            errorMessage="Please enter valid password"
            label="Password"
            labelPlacement="outside"
            name="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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
          <div className="flex gap-2">
            <Button color="primary" type="submit">
              {isLoading ? (
                <Loader className=" animate-spin mx-auto" size={24} />
              ) : (
                "Login"
              )}
            </Button>
          </div>
          <Card>
            <CardBody>
              <p>
                Don't have an account?{" "}
                <Link
                  to="/register"
                  className="text-green-400 hover:underline px-1"
                >
                  Register
                </Link>
              </p>
            </CardBody>
            <CardBody>
              <p>
                <Link
                  to="/forgot-password"
                  className="text-green-400 hover:underline px-1"
                >
                  Forgot Password
                </Link>
              </p>
            </CardBody>
          </Card>
        </Form>

        <CustomModal
          isOpen={isOpen}
          onOpenChange={onOpenChange}
          title="Oops!"
          message= {error}
        />
      </div>
    </>
  );
}

export default LoginPage;
