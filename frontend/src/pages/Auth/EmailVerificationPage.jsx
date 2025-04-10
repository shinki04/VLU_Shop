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
import { useAuthStore } from "../../store/authStore";

export const EmailVerificationPage = () => {
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const navigate = useNavigate();
  const { isOpen, onOpen, onOpenChange } = useDisclosure(); // THÊM onOpen

  const { error, isLoading, verifyEmail } = useAuthStore();

  // Auto submit when all fields are filled
//   useEffect(() => {
//     if (code.every((digit) => digit !== "")) {
//       handleSubmit(new Event("submit"));
//     }
//   }, [code]);

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
      //   toast.success("Email verified successfully");
    } catch (error) {
      console.log(error);
    }
  };
  // THÊM useEffect để mở Modal khi có lỗi
  useEffect(() => {
    if (error) {
      onOpen();
    }
  }, [error, onOpen]);
  return (
    <>
      <Form
        className="flex w-full flex-col items-start gap-4"
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
        <Button size="sm" type="submit" variant="bordered">
          {isLoading ? (
            <Loader className=" animate-spin mx-auto" size={24} />
          ) : (
            "Submit"
          )}
        </Button>
      </Form>
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
      </Modal>
    </>
  );
};
