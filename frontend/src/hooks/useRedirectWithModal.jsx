import { useState } from "react";
import { useNavigate } from "react-router-dom";

export const useRedirectWithModal = () => {
  const [showModal, setShowModal] = useState(false);
  const [targetPath, setTargetPath] = useState(null);
  const navigate = useNavigate();

  const redirect = (path) => {
    setTargetPath(path);
    setShowModal(true);
  };

  const confirm = () => {
    setShowModal(false);
    if (targetPath) navigate(targetPath);
  };

  const cancel = () => {
    setShowModal(false);
    setTargetPath(null);
  };

  return { showModal, redirect, confirm, cancel };
};
