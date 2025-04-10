// import {
// 	PASSWORD_RESET_REQUEST_TEMPLATE,
// 	PASSWORD_RESET_SUCCESS_TEMPLATE,
// 	VERIFICATION_EMAIL_TEMPLATE,
// } from "./emailTemplates.js";
// import { mailtrapClient, sender } from "./mailtrap.config.js";

// export const sendVerificationEmail = async (email, verificationToken) => {
// 	const recipient = [{ email }];

// 	try {
// 		const response = await mailtrapClient.send({
// 			from: sender,
// 			to: recipient,
// 			subject: "Verify your email",
// 			html: VERIFICATION_EMAIL_TEMPLATE.replace("{verificationCode}", verificationToken),
// 			category: "Email Verification",
// 		});

// 		console.log("Email sent successfully", response);
// 	} catch (error) {
// 		console.error(`Error sending verification`, error);

// 		throw new Error(`Error sending verification email: ${error}`);
// 	}
// };

// export const sendWelcomeEmail = async (email, name) => {
// 	const recipient = [{ email }];

// 	try {
// 		const response = await mailtrapClient.send({
// 			from: sender,
// 			to: recipient,
// 			template_uuid: "e65925d1-a9d1-4a40-ae7c-d92b37d593df",
// 			template_variables: {
// 				company_info_name: "Auth Company",
// 				name: name,
// 			},
// 		});

// 		console.log("Welcome email sent successfully", response);
// 	} catch (error) {
// 		console.error(`Error sending welcome email`, error);

// 		throw new Error(`Error sending welcome email: ${error}`);
// 	}
// };

// export const sendPasswordResetEmail = async (email, resetURL) => {
// 	const recipient = [{ email }];

// 	try {
// 		const response = await mailtrapClient.send({
// 			from: sender,
// 			to: recipient,
// 			subject: "Reset your password",
// 			html: PASSWORD_RESET_REQUEST_TEMPLATE.replace("{resetURL}", resetURL),
// 			category: "Password Reset",
// 		});
// 	} catch (error) {
// 		console.error(`Error sending password reset email`, error);

// 		throw new Error(`Error sending password reset email: ${error}`);
// 	}
// };

// export const sendResetSuccessEmail = async (email) => {
// 	const recipient = [{ email }];

// 	try {
// 		const response = await mailtrapClient.send({
// 			from: sender,
// 			to: recipient,
// 			subject: "Password Reset Successful",
// 			html: PASSWORD_RESET_SUCCESS_TEMPLATE,
// 			category: "Password Reset",
// 		});

// 		console.log("Password reset email sent successfully", response);
// 	} catch (error) {
// 		console.error(`Error sending password reset success email`, error);

// 		throw new Error(`Error sending password reset success email: ${error}`);
// 	}
// };

import {
	PASSWORD_RESET_REQUEST_TEMPLATE,
	PASSWORD_RESET_SUCCESS_TEMPLATE,
	VERIFICATION_EMAIL_TEMPLATE,
  } from "./emailTemplates.js";
  import { transporter, sender } from "./nodemailer.config.js";
  
  export const sendVerificationEmail = async (email, verificationToken) => {
	const mailOptions = {
	  from: `"${sender.name}" <${sender.email}>`, // Định dạng "Tên <email>"
	  to: email, // Gửi trực tiếp tới email, không cần mảng
	  subject: "Verify your email",
	  html: VERIFICATION_EMAIL_TEMPLATE.replace("{verificationCode}", verificationToken),
	};
  
	try {
	  const info = await transporter.sendMail(mailOptions);
	  console.log("Email sent successfully", info.messageId);
	} catch (error) {
	  console.error("Error sending verification email", error);
	  throw new Error(`Error sending verification email: ${error.message}`);
	}
  };
  
  export const sendWelcomeEmail = async (email, name) => {
	const mailOptions = {
	  from: `"${sender.name}" <${sender.email}>`,
	  to: email,
	  subject: "Welcome to Auth Company",
	  html: `
		<h1>Welcome, ${name}!</h1>
		<p>Thank you for joining Auth Company. We're excited to have you!</p>
	  `, // Tùy chỉnh HTML thay vì dùng template_uuid
	};
  
	try {
	  const info = await transporter.sendMail(mailOptions);
	  console.log("Welcome email sent successfully", info.messageId);
	} catch (error) {
	  console.error("Error sending welcome email", error);
	  throw new Error(`Error sending welcome email: ${error.message}`);
	}
  };
  
  export const sendPasswordResetEmail = async (email, resetURL) => {
	const mailOptions = {
	  from: `"${sender.name}" <${sender.email}>`,
	  to: email,
	  subject: "Reset your password",
	  html: PASSWORD_RESET_REQUEST_TEMPLATE.replace("{resetURL}", resetURL),
	};
  
	try {
	  const info = await transporter.sendMail(mailOptions);
	  console.log("Password reset email sent successfully", info.messageId);
	} catch (error) {
	  console.error("Error sending password reset email", error);
	  throw new Error(`Error sending password reset email: ${error.message}`);
	}
  };
  
  export const sendResetSuccessEmail = async (email) => {
	const mailOptions = {
	  from: `"${sender.name}" <${sender.email}>`,
	  to: email,
	  subject: "Password Reset Successful",
	  html: PASSWORD_RESET_SUCCESS_TEMPLATE,
	};
  
	try {
	  const info = await transporter.sendMail(mailOptions);
	  console.log("Password reset success email sent successfully", info.messageId);
	} catch (error) {
	  console.error("Error sending password reset success email", error);
	  throw new Error(`Error sending password reset success email: ${error.message}`);
	}
  };