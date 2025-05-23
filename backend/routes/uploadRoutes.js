import path from "path";
import express from "express";
import multer from "multer";
import { authMiddleware, isAdmin } from "../middlewares/authMiddleware.js";
import fs from "fs/promises";
import slugify from "slugify";

const router = express.Router();

// Đảm bảo thư mục uploads tồn tại
const ensureDir = async (dir) => {
  try {
    await fs.mkdir(dir, { recursive: true });
    console.log(`Directory ${dir} created or already exists`);
  } catch (error) {
    console.error(`Lỗi khi tạo thư mục ${dir}:`, error);
    throw new Error(`Không thể tạo thư mục ${dir}: ${error.message}`);
  }
};

// Cấu hình lưu trữ cục bộ
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadType = req.query.type || "single";
    let dest;

    if (uploadType === "multiple") {
      dest = `./public/uploads/products/`;
    } else {
      dest = "./public/uploads/user/";
    }

    await ensureDir(dest);
    cb(null, dest);
  },
  filename: (req, file, cb) => {
    // Tạo tên file mới dựa trên loại upload
    const uploadType = req.query.type || "single";
    const prefix = uploadType === "multiple" ? "product" : "user";
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname).toLowerCase();
    const fileName = `${prefix}-${uniqueSuffix}${ext}`;
    cb(null, fileName);
  },
});

const fileFilter = (req, file, cb) => {
  const filetypes = /jpe?g|png/;
  const mimetypes = /image\/jpe?g|image\/png/;

  const extname = path.extname(file.originalname).toLowerCase();
  const mimetype = file.mimetype;

  if (filetypes.test(extname) && mimetypes.test(mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Chỉ chấp nhận ảnh (jpg, png)"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // Giới hạn 5MB mỗi ảnh
});

// Tuyến đường upload
router.post("/", authMiddleware, isAdmin, (req, res) => {
  const uploadType = req.query.type || "single";
  const uploadHandler =
    uploadType === "multiple"
      ? upload.array("images", 5)
      : upload.single("image");

  uploadHandler(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }

    if (!req.file && !req.files) {
      return res
        .status(400)
        .json({ success: false, message: "Vui lòng cung cấp ít nhất một ảnh" });
    }

    try {
      const imageUrls = [];

      if (uploadType === "multiple") {
        // Xử lý nhiều ảnh cho sản phẩm
        imageUrls.push(
          ...req.files.map((file) => `/${file.path.replace(/\\/g, "/")}`)
        );
      } else {
        // Xử lý một ảnh cho người dùng
        imageUrls.push(`/${req.file.path.replace(/\\/g, "/")}`);
      }

      res.status(200).json({
        success: true,
        message: `Đã upload ${imageUrls.length} ảnh thành công`,
        images: imageUrls.map((url) => {
          return { url, name: path.basename(url) };
        }),
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Lỗi khi upload ảnh: " + error.message,
      });
    }
  });
});

export default router;