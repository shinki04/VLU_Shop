import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import morgan from "morgan";
import connectDB from "./config/connectDB.js";
import cookieParser from "cookie-parser";
import authRoute from "./routes/authRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js"; // Import routes for reviews
import cartRoutes from "./routes/cartRoutes.js"; // Import routes for giỏ hàng
import orderRoutes from "./routes/orderRoutes.js"; // Import routes for đơn hàng
dotenv.config();
const app = express();
connectDB();

const __dirname = path.resolve();

// Middleware
app.use(morgan("dev"));
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL 
    : 'http://localhost:5173',
  credentials: true
};
app.use(cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Cấu hình đường dẫn static cho uploads
app.use('/public/uploads', express.static(path.join(__dirname, 'public/uploads')));

// Static files for production
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "/frontend/dist")));
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"));
  });
}

// Routes
app.use("/api/auth", authRoute);
app.use("/api/category", categoryRoutes);
app.use("/api/users", userRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/products", productRoutes); 
app.use("/api/reviews", reviewRoutes); // Đường dẫn cho reviews
app.use("/api/cart", cartRoutes); // Đường dẫn cho giỏ hàng
app.use("/api/orders", orderRoutes); // Đường dẫn cho đơn hàng

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
