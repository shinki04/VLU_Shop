// import { MailtrapClient } from "mailtrap";
// import dotenv from 'dotenv'
// dotenv.config();



// export const mailtrapClient = new MailtrapClient({
//   token: process.env.MAILTRAP_TOKEN,
// });

// export const sender= {
//   email: "hello@demomailtrap.co",
//   name: "Shin Akira",
// };

import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

// Cấu hình transporter cho Nodemailer
export const transporter = nodemailer.createTransport({
  service: "gmail", // Dùng Gmail, hoặc thay bằng SMTP server khác
  auth: {
    user: process.env.EMAIL_USER, // Email của bạn (ví dụ: your.email@gmail.com)
    pass: process.env.EMAIL_PASS, // Mật khẩu ứng dụng (App Password nếu dùng Gmail)
  },
});

export const sender = {
  email: process.env.EMAIL_USER, // Email gửi đi
  name: "Shin Akira",
};