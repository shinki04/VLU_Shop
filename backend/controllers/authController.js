import fs from "fs/promises";
import crypto from "crypto";
import User from "../models/userModel.js";
import createToken from "../utils/createToken.js";

import {
  sendPasswordResetEmail,
  sendResetSuccessEmail,
  sendVerificationEmail,
  sendWelcomeEmail,
  sendWelcomeBackEmail,
} from "../mailer/emails.js";
// @desc    Create a category
// @route   POST /api/categories
// @access  Private/Admin
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  const existingUser = await User.findOne({ email });

  if (!existingUser) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  const isPasswordCorrect = await existingUser.comparePassword(password);
  if (!isPasswordCorrect) {
    return res.status(401).json({
      success: false,
      message: "Wrong password",
    });
  }
  createToken(res, existingUser._id);
  await sendWelcomeBackEmail(existingUser.email, existingUser.username);

  res.status(200).json({
    success: true,
    message: "Login successfully",
    user: {
      ...existingUser._doc,
      password: undefined,
    },
  });
};

export const verifyEmail = async (req, res) => {
  const { code } = req.body;
  try {
    const user = await User.findOne({
      verificationToken: code,
      verificationTokenExpiresAt: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired verification code",
      });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpiresAt = undefined;
    await user.save();

    await sendWelcomeEmail(user.email, user.username);

    res.status(200).json({
      success: true,
      message: "Email verified successfully",
      user: {
        ...user._doc,
        password: undefined,
      },
    });
  } catch (error) {
    console.log("error in verifyEmail ", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const registerUser = async (req, res) => {
  const { email, password, username } = req.body;
  if (!email || !password || !username) {
    return res.status(400).json({
      success: false,
      message: "Please provide all required fields",
    });
  }
  let imageUrl = "/public/uploads/user/avatardefault.webp";

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    // const verificationToken = Math.floor(
    //   100000 + Math.random() * 900000
    // ).toString();
    const verificationToken = crypto.randomInt(100000, 999999).toString();

    const user = new User({
      email,
      password,
      username,
      image: imageUrl || "",
      verificationToken,
      verificationTokenExpiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
    });
    try {
      await sendVerificationEmail(user.email, verificationToken);
      await user.save();
      createToken(res, user._id);

      res.status(201).json({
        success: true,
        message: "User created successfully",
        user: {
          ...user._doc,
          password: undefined,
        },
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const createUserByAdmin = async (req, res) => {
  const { email, password, username, image, isVerified, role } = req.body;
  if (!email || !password || !username) {
    return res.status(400).json({
      success: false,
      message: "Please provide all required fields",
    });
  }

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: "Email already exists",
      });
    }

    let imageUrl = "";
    if (req.file) {
      imageUrl = `/${req.file.path.replace(/\\/g, "/")}`;
    }

    const user = new User({
      email,
      password,
      username,
      image: image || "",
      role: role || "customer",
      isVerified: isVerified ?? false,
    });
    try {
      await user.save();
      res.status(201).json({
        success: true,
        message: "User created successfully",
        user: {
          ...user._doc,
          password: undefined,
        },
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
export const logoutUser = async (req, res) => {
  res
    .clearCookie("jwt")
    .json({ success: true, message: "Logged out successfully" });
};

export const getAllUsers = async (req, res) => {
  try {
    // Lấy tham số từ query string
    const page = parseInt(req.query.page) || 1; // Nếu không có thì mặc định là trang 1
    const limit = parseInt(req.query.limit) || 5; // Mặc định mỗi trang 5 danh mục
    // Tính số mục cần bỏ qua (skip)
    const skip = (page - 1) * limit;
    // Lấy tổng số danh mục
    const total = await User.countDocuments();
    // Lấy danh mục theo trang
    const users = await User.find()
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: 1 });

    if (!users) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    res.status(200).json({
      success: true,
      message: "Get successfully",
      total: total, // Tổng số danh mục
      page: page, // Trang hiện tại
      limit: limit, // Số danh mục trên mỗi trang
      users: users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const findUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      res.json({
        _id: user._id,
        username: user.username,
        image: user.image,
        email: user.email,
        isVerified: user.isVerified,
      });
    } else {
      res.status(404);
      throw new Error("User not found.");
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
export const updateUserById = async (req, res) => {
  try {
    const { username, image, role, isVerified } = req.body;

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    // } else {
    //   const existingUser = await User.findOne({ email });
    //   if (existingUser && existingUser._id.toString() !== user._id.toString()) {
    //     return res.status(400).json({
    //       success: false,
    //       message: "Email already exists",
    //     });
    //   }
    // Nếu có ảnh mới và khác ảnh cũ thì xóa ảnh cũ
    if (image && image !== user.image) {
      if (user.image) {
        try {
          await fs.unlink(`.${user.image}`);
        } catch (error) {
          console.error(`Lỗi khi xóa ảnh cũ ${user.image}:`, error);
        }
      }
    }

    // Cập nhật thông tin
    user.username = username || user.username;
    // user.email = email || user.email;
    user.role = role || user.role;
    user.isVerified = isVerified || user.isVerified;
    user.image = image || user.image;

    const updatedUser = await user.save();

    res.status(200).json({
      success: true,
      user: updatedUser,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      const { username, email, password } = req.body;

      // Kiểm tra nếu người dùng không nhập mật khẩu hiện tại
      if (!password) {
        return res
          .status(400)
          .json({ success: false, message: "Current password is required" });
      }

      // Kiểm tra mật khẩu hiện tại
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res
          .status(401)
          .json({ success: false, message: "Incorrect password" });
      }

      user.username = req.body.username || user.username;
      user.email = req.body.email || user.email;
      // Nếu có URL ảnh mới từ /api/upload
      if (req.body.image) {
        // Xóa ảnh cũ nếu tồn tại
        if (user.image) {
          try {
            await fs.unlink(`.${user.image}`);
          } catch (error) {
            console.error(`Error deleting old image: ${error.message}`);
          }
        }
        user.image = req.body.image;
      }
      const updatedUser = await user.save();

      res.status(200).json({
        success: true,
        user: {
          ...updatedUser._doc,
          password: undefined,
        },
      });
    } else {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
export const deleteUserById = async (req, res) => {
  try {
    const existingUser = await User.findByIdAndDelete(req.params.id);
    if (!existingUser) {
      return res
        .status(400)
        .json({ success: false, message: "User not found" });
    }

    if (
      existingUser.image &&
      existingUser.image !== "/public/uploads/user/avatardefault.webp"
    ) {
      console.log("Xóa ảnh:", existingUser.image);
      await fs.unlink(`.${existingUser.image}`);
    }

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "User not found" });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(20).toString("hex");
    const resetTokenExpiresAt = Date.now() + 1 * 60 * 60 * 1000; // 1 hour

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpiresAt = resetTokenExpiresAt;

    await user.save();

    // send email
    await sendPasswordResetEmail(
      user.email,
      `${process.env.CLIENT_URL}/reset-password/${resetToken}`
    );

    res.status(200).json({
      success: true,
      message: "Password reset link sent to your email",
    });
  } catch (error) {
    console.log("Error in forgotPassword ", error);
    res.status(400).json({ success: false, message: error.message });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpiresAt: { $gt: Date.now() },
    });

    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid or expired reset token" });
    }

    // update password
    // const hashedPassword = await bcryptjs.hash(password, 10);

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiresAt = undefined;
    await user.save();

    await sendResetSuccessEmail(user.email);

    res
      .status(200)
      .json({ success: true, message: "Password reset successful" });
  } catch (error) {
    console.log("Error in resetPassword ", error);
    res.status(400).json({ success: false, message: error.message });
  }
};
export const searchUsers = async (req, res) => {
  try {
    const keyword = req.query.q || "";
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;

    // Tìm kiếm theo username hoặc email, không phân biệt hoa thường
    const query = {
      $or: [
        { username: { $regex: keyword, $options: "i" } },
        { email: { $regex: keyword, $options: "i" } },
      ],
    };

    // Đếm tổng số người dùng khớp với từ khóa
    const total = await User.countDocuments(query);

    // Lấy người dùng cho trang hiện tại
    const users = await User.find(query)
      .select("-password") // Không trả về mật khẩu
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      message: users.length ? "Search successful" : "No users found",
      users,
      total,
      page,
      limit,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
