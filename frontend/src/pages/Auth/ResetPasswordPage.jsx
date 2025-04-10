import { useAuthStore } from "../../store/authStore";
import { useNavigate, useParams } from "react-router-dom";
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
import {
    PasswordCriteria,
    PasswordStrengthMeter,
  } from "../../components/PasswordStrengthMeter";
import React from "react";
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
export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const { resetPassword, error, isLoading, message } = useAuthStore();
  const [isVisible, setIsVisible] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [confirmError, setConfirmError] = useState("");
  const { token } = useParams();
  const navigate = useNavigate();
  const toggleVisibility = () => setIsVisible(!isVisible);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }
    try {
      await resetPassword(token, password);

      // toast.success("Password reset successfully, redirecting to login page...");
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error) {
      console.error(error);
      // toast.error(error.message || "Error resetting password");
    }
  };

  const validatePassword = (value) =>
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/.test(value);

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);

    if (!validatePassword(value)) {
      setPasswordError(
        "Password must be at least 8 characters, include upper/lowercase, number, and special character"
      );
    } else {
      setPasswordError("");
    }

    if (confirmPassword && value !== confirmPassword) {
      setConfirmError("Passwords do not match");
    } else {
      setConfirmError("");
    }
  };

  const handleConfirmPasswordChange = (e) => {
    const value = e.target.value;
    setConfirmPassword(value);

    if (password !== value) {
      setConfirmError("Passwords do not match");
    } else {
      setConfirmError("");
    }
  };
  return (
    <div>
      <h2>Reset Password</h2>
      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
      {message && <p className="text-green-500 text-sm mb-4">{message}</p>}

      <Form
        className="w-full max-w-xs flex flex-col gap-4"
        onSubmit={handleSubmit}
      >
        <Input
          isRequired
          label="Password"
          labelPlacement="outside"
          placeholder="Enter new password"
          value={password}
          onChange={handlePasswordChange}
          type={isVisible ? "text" : "password"}
          endContent={
            <button
              type="button"
              aria-label="toggle password visibility"
              onClick={toggleVisibility}
              className="focus:outline-none"
            >
              {isVisible ? <EyeClosed /> : <Eye />}
            </button>
          }
          errorMessage={passwordError}
          isInvalid={!!passwordError}
        />

        <Input
          isRequired
          label="Confirm Password"
          labelPlacement="outside"
          placeholder="Confirm new password"
          value={confirmPassword}
          onChange={handleConfirmPasswordChange}
          type={isVisible ? "text" : "password"}
          endContent={
            <button
              type="button"
              aria-label="toggle confirm password visibility"
              onClick={toggleVisibility}
              className="focus:outline-none"
            >
              {isVisible ? <EyeClosed /> : <Eye />}
            </button>
          }
          errorMessage={confirmError}
          isInvalid={!!confirmError}
        />
<PasswordCriteria password={password} />
        <div className="flex gap-2">
          <Button
            color="primary"
            type="submit"
            isDisabled={!!passwordError || !!confirmError}
          >
            {isLoading ? (
              <>
                <Loader className="animate-spin mx-auto" size={24} />
                <p>Resetting...</p>
              </>
            ) : (
              "Set New Password"
            )}
          </Button>
        </div>
      </Form>
    </div>
  );
}
