import { useState, useEffect } from "react";
import { useAuthStore } from "../../store/authStore";
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
  addToast,
  ToastProvider,
} from "@heroui/react";
import CustomModal from "../../components/CustomModal";

export const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [countdown, setCountdown] = useState(20);
  const [canResend, setCanResend] = useState(false);
  const { isLoading, forgotPassword, error } = useAuthStore();
  const { isOpen, onOpen, onOpenChange } = useDisclosure(); // THÊM onOpen

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
  }, [isSubmitted, countdown, canResend , isLoading]);

  return (
    <div>
      {!isSubmitted ? (
        <Form
          className="w-full max-w-xs flex flex-col gap-4"
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
          />
          <Button color="primary" type="submit">
            {isLoading ? (
              <Loader className="size-6 animate-spin mx-auto" />
            ) : (
              "Send Reset Link"
            )}
          </Button>
        </Form>
      ) : (
        <div className="text-center">
          <p className="">
            <Mail className="" />
            If an account exists for {email}, you will receive a password reset
            link shortly.
          </p>
          {!canResend ? (
            <p className="text-sm text-gray-400">
              You can resend the email in{" "}
              <span className="font-bold text-green-400">{countdown}</span>{" "}
              seconds
            </p>
          ) : (
            <Button
              onPress={() => submitLogic(new Event("submit"))}
              className="mt-4 text-green-400 hover:underline text-sm font-semibold"
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
      <CustomModal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        title="Oops!"
        message={"Some Wrong ??? " + error}
      />
    </div>
  );
};
