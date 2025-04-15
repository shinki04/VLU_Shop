import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  useDisclosure,
  InputOtp,
  Form,
} from "@heroui/react";
import { Loader, Lock, Mail, User } from "lucide-react";

import React from "react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useUserStore from "../../store/userStore";

export const EmailVerificationPage = () => {
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const navigate = useNavigate();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const { error, isLoading, verifyEmail, clearError } = useUserStore();

  const handleOtpComplete = async (value) => {
    const verificationCode = value.join ? value.join("") : value;
    try {
      await verifyEmail(verificationCode);
      navigate("/");
    } catch (error) {
      console.log(error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const verificationCode = code.join("");
    try {
      await verifyEmail(verificationCode);
      navigate("/");
    } catch (error) {
      console.log(error);
    }
  };

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
          Verify Your Email
        </h1>

        {/* Body */}
        <div className="mt-4 text-gray-700">
          <p className="text-lg">Hello,</p>
          <p className="mt-2">
            Thank you for signing up! Your verification code has been sent to your email.
          </p>

          {/* OTP Input Form (giữ nguyên) */}
          <Form
            className="flex w-full flex-col items-start gap-4 mt-6"
            onSubmit={handleSubmit}
          >
            <InputOtp
              isRequired
              aria-label="OTP input field"
              length={6}
              name="code"
              placeholder="Enter code"
              onComplete={handleOtpComplete}
              onChange={setCode}
            />
            <Button size="sm" type="submit" variant="bordered" className="w-full border-green-600 text-green-600 hover:bg-green-600 hover:text-white focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-opacity-50 transition-colors duration-200">
              {isLoading ? (
                <Loader className="animate-spin mx-auto" size={24} />
              ) : (
                "Submit"
              )}
            </Button>
          </Form>

          {/* Instructions */}
          <p className="mt-4 text-sm text-gray-600">
            The code will expire in 15 minutes for security reasons.
          </p>
          {/* Signature */}
          <p className="mt-6 text-gray-700">Best regards,</p>
          <p className="text-gray-700">Your App Team</p>

          {/* Footer Note (đã thay đổi) */}
          <p className="mt-4 text-xs text-gray-500 text-center">
            Thank you for verifying and using our application.
          </p>
        </div>
      </div>

      {/* Error Modal (giữ nguyên) */}
      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Opps !!!
              </ModalHeader>
              <ModalBody>
                <div>
                  <h3 className="p-2">
                    Something Wrong:
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