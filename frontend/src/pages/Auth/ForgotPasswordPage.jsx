import { useState, useEffect } from "react";
import useUserStore from "../../store/userStore";
import { ArrowLeft, Loader, Mail } from "lucide-react";
import { Link } from "react-router-dom";

import React from "react";
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
  ToastProvider,
} from "@heroui/react";
import CustomModal from "../../components/Modal/CustomModal";

export const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [countdown, setCountdown] = useState(20);
  const [canResend, setCanResend] = useState(false);
  const { isLoading, forgotPassword, error, clearError } = useUserStore();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const submitLogic = async () => {
    try {
      await forgotPassword(email);
      setIsSubmitted(true);
      setCanResend(false);
      setCountdown(10);
    } catch (error) {
      console.log(error);
      onOpen();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await submitLogic();
  };

  useEffect(() => {
    let timer;

    if (isSubmitted && !canResend && countdown > 0) {
      timer = setTimeout(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }

    if (countdown === 0) {
      setCanResend(true);
    }

    return () => clearTimeout(timer);
  }, [isSubmitted, countdown, canResend, isLoading]);

  useEffect(() => {
    if (error) {
      onOpen();
      clearError();
    }
  }, [error, onOpen, clearError]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        {/* Header */}
        <h1 className="text-2xl font-bold text-center text-white bg-green-600 py-4 rounded-t-lg">
          Forgot Password
        </h1>

        {/* Body */}
        <div className="mt-4 text-gray-700">
          {!isSubmitted ? (
            <Form
              className="w-full flex flex-col gap-4"
              onSubmit={handleSubmit}
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
                className="w-full"
                startContent={<Mail className="text-gray-400" size={20} />}
              />
              <Button
                color="primary"
                type="submit"
                className="w-full bg-green-600 text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-opacity-50 transition-colors duration-200"
              >
                {isLoading ? (
                  <Loader className="size-6 animate-spin mx-auto" />
                ) : (
                  "Send Reset Link"
                )}
              </Button>
            </Form>
          ) : (
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <Mail className="text-green-600" size={40} />
              </div>
              <p className="text-gray-700">
                If an account exists for{" "}
                <span className="font-semibold">{email}</span>, you will receive a password reset link shortly.
              </p>
              {!canResend ? (
                <p className="text-sm text-gray-600 mt-4">
                  You can resend the email in{" "}
                  <span className="font-bold text-green-600">{countdown}</span>{" "}
                  seconds
                </p>
              ) : (
                <Button
                  onPress={() => submitLogic(new Event("submit"))}
                  className="mt-4 bg-transparent text-green-600 hover:bg-green-600 hover:text-white border border-green-600 rounded-md px-4 py-2 transition-colors duration-200"
                >
                  {isLoading ? (
                    <Loader className="size-6 animate-spin mx-auto" />
                  ) : (
                    "Resend Email"
                  )}
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Back to Login Link */}
        <div className="mt-6 text-center">
          <Link
            to="/login"
            className="flex items-center justify-center text-sm text-green-600 hover:underline"
          >
            <ArrowLeft className="mr-2" size={16} />
            Back to Login
          </Link>
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