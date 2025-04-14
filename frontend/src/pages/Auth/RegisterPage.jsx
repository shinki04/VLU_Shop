import { Loader, Lock, Mail, User, EyeClosed, Eye } from "lucide-react";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  PasswordCriteria,
  PasswordStrengthMeter,
} from "../../components/PasswordStrengthMeter";
import { validatePassword, validateUsername } from "../../utils/validation.js";

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

  // THÊM useEffect để mở Modal khi có lỗi
  useEffect(() => {
    if (error) {
      onOpen();
      clearError();
    }
  }, [error, onOpen, clearError]);

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
          onSubmit={handleSignUp}
        >
          <Input
            isRequired
            label="Username"
            labelPlacement="outside"
            name="name"
            placeholder="Enter your username"
            type="text"
            value={name}
            onChange={handleUsernameChange}
            isInvalid={!!usernameError}
            errorMessage={usernameError}
          />
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
                  <EyeClosed
                    size={16}
                    strokeWidth={1.5}
                    className="text-2xl text-default-400 pointer-events-none"
                  />
                ) : (
                  //   <EyeSlashFilledIcon className="text-2xl text-default-400 pointer-events-none" />
                  //   <EyeFilledIcon className="text-2xl text-default-400 pointer-events-none" />
                  <Eye
                    size={16}
                    strokeWidth={1.5}
                    className="text-2xl text-default-400 pointer-events-none"
                  />
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
                "Sign Up"
              )}
            </Button>
          </div>
          <PasswordCriteria password={password} />

          <Card>
            <CardBody>
              <p>
                Have an account?{" "}
                <Link
                  to="/login"
                  className="text-green-400 hover:underline px-1"
                >
                  Login
                </Link>
              </p>
            </CardBody>
          </Card>
        </Form>

        {/* <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader className="flex flex-col gap-1">
                  Opps !!!
                </ModalHeader>
                <ModalBody>
                  <div>
                    <h3 className="p-2">
                      Something Wrong :
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
        </Modal> */}
        <CustomModal
          isOpen={isOpen}
          onOpenChange={onOpenChange}
          title="Oops!"
          message={error}
        />
      </div>
    </>
  );
};
export default RegisterPage;
