// Kiểm tra email
export const isValidEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email.trim());
};

/**
 * Kiểm tra mật khẩu có đủ mạnh không
 * - ít nhất 8 ký tự
 * - có chữ thường, chữ hoa, số và ký tự đặc biệt
 */
export const validatePassword = (password) => {
  if (password.length < 8) {
    return "At least 8 characters";
  }

  if (!/[A-Z]/.test(password)) {
    return "Contains uppercase letter";
  }

  if (!/[a-z]/.test(password)) {
    return "Contains lowercase letter";
  }

  if (!/\d/.test(password)) {
    return "Contains a number";
  }

  if (!/[^A-Za-z0-9]/.test(password)) {
    return "Contains special character";
  }
};

/**
 * Kiểm tra username hợp lệ:
 * - ít nhất 3 ký tự
 * - chỉ gồm chữ, số, dấu gạch dưới
 * Trả về message lỗi hoặc chuỗi rỗng nếu hợp lệ
 */
export const validateUsername = (username) => {
  if (username === "") {
    return "";
  } else if (username.length < 3) {
    return "Username must be at least 3 characters long";
  } else if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return "Username can only contain letters, numbers, and underscores";
  } else {
    return "";
  }
};

// Không để trống
export const isRequired = (value) => {
  return (
    value !== null && value !== undefined && value.toString().trim() !== ""
  );
};

// Số điện thoại Việt Nam
export const isValidPhoneNumber = (phone) => {
  const regex = /^(0|\+84)[3|5|7|8|9][0-9]{8}$/;
  return regex.test(phone.trim());
};

// Kiểm tra độ dài tối thiểu
export const minLength = (value, length) => {
  return value.length >= length;
};

// Kiểm tra độ dài tối đa
export const maxLength = (value, length) => {
  return value.length <= length;
};
