import { addToast } from "@heroui/react";
import { X } from "lucide-react";

export const toastCustom = ({ color, error, title, description, ...props }) => {
  const baseOptions = {
    timeout: 5000,
    shouldShowTimeoutProgress: true,
    classNames: {
      closeButton: "opacity-100 absolute right-4 top-1/2 -translate-y-1/2",
      icon: "w-6 h-6",
    },
    closeIcon: <X size={16} strokeWidth={0.75} absoluteStrokeWidth />,
    // variant:"solid",
    ...props,
  };

  const toastData = error
    ? {
        color: "danger",
        title: title || "Failed",
        description: error,
        ...baseOptions,
      }
    : {
        color: color || "success",
        title: title || "Successfully",
        description,
        ...baseOptions,
      };

  addToast(toastData);
};
