import { useState } from "react";
import { Input } from "@heroui/react";
import { Eye, EyeClosed } from "lucide-react";
import { validatePassword } from "../utils/validation";

export default function CustomInputPass({
  value,
  onChange,
  label = "Password",
  name = "password",
  placeholder = "Enter your password",
  ...props
}) {
  const [isVisible, setIsVisible] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  const toggleVisibility = () => setIsVisible(!isVisible);

  const handleChange = (e) => {
    const val = e.target.value;
    onChange(e); // Gọi callback truyền từ ngoài

    if (val !== "") {
      setPasswordError(validatePassword(val) || "");
    } else {
      setPasswordError("");
    }
  };

  return (
    <Input
      type={isVisible ? "text" : "password"}
      label={label}
      labelPlacement="outside"
      name={name}
      placeholder={placeholder}
      value={value}
      onChange={handleChange}
      isRequired
      isInvalid={value !== "" && !!passwordError}
      errorMessage={value !== "" ? passwordError : ""}
      endContent={
        <button
          type="button"
          onClick={toggleVisibility}
          className="focus:outline-none"
          aria-label="Toggle password visibility"
        >
          {isVisible ? (
            <EyeClosed size={16} strokeWidth={1.5} className="text-default-400 pointer-events-none" />
          ) : (
            <Eye size={16} strokeWidth={1.5} className="text-default-400 pointer-events-none" />
          )}
        </button>
      }
      {...props}
    />
  );
}
