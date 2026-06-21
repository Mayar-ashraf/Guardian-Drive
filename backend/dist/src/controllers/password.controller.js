"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPass = exports.validateToken = exports.forgetPass = void 0;
const crypto_1 = __importDefault(require("crypto"));
const prisma_1 = require("../lib/prisma");
const mail_1 = __importDefault(require("@sendgrid/mail"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const enums_1 = require("../../generated/prisma/enums");
mail_1.default.setApiKey(process.env.SENDGRID_API_KEY);
const forgetPass = async (req, res) => {
    const { email } = req.body;
    const user = await prisma_1.prisma.user.findUnique({
        where: { email },
    });
    if (!user) {
        return res.status(404).json({ message: "This email is not registered. Please enter a valid email." });
    }
    const role = user.role;
    if (role != enums_1.Role.DRIVER) {
        return res.status(403).json({ message: "Only drivers can reset their password through this portal." });
    }
    const resettoken = crypto_1.default.randomBytes(32).toString("hex");
    const expiry = new Date(Date.now() + 15 * 60 * 1000);
    await prisma_1.prisma.user.update({
        where: { email },
        data: {
            resetToken: resettoken,
            resetTokenExpiry: expiry,
        },
    });
    const resetLink = `http://10.0.2.2:3000/api/password/reset-password?token=${resettoken}`;
    await mail_1.default.send({
        to: email,
        from: process.env.EMAIL_FROM,
        subject: "Password Reset",
        html: `
<!DOCTYPE html>
<html>
<head>
  <title>Reset Password</title>
</head>
<body style="font-family: Arial; background:#f4f4f4; padding:20px;">
  <div style="background:white; padding:20px; border-radius:10px;">
    
    <h2>Reset your password</h2>

    <p>You requested a password reset for your account.</p>

    <p>Click the button below:</p>

    <a href="${resetLink}" 
    window.location.href = "/public/success.html";
       style="display:inline-block;
              padding:12px 20px;
              background:#34D399;
              color:white;
              text-decoration:none;
              border-radius:8px;">
      Reset Password
    </a>

    <p style="margin-top:20px; font-size:12px; color:gray;">
      This link expires in 15 minutes.
    </p>

  </div>
</body>
</html>
    `,
    });
    return res.json({ message: "Password reset link sent to your email" });
};
exports.forgetPass = forgetPass;
const validateToken = async (req, res) => {
    const { token } = req.query;
    const user = await prisma_1.prisma.user.findFirst({
        where: {
            resetToken: token,
            resetTokenExpiry: {
                gt: new Date(),
            },
        },
    });
    if (!user) {
        return res.status(400);
    }
    else {
        return res.json({ message: "Token is valid." });
    }
};
exports.validateToken = validateToken;
const isStrongPassword = (password) => {
    const strongRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&._#^-])[A-Za-z\d@$!%*?&._#^-]{8,}$/;
    return strongRegex.test(password);
};
const resetPass = async (req, res) => {
    const { token, newPassword } = req.body;
    try {
        console.log("RESET REQUEST RECEIVED:", req.body);
        if (!isStrongPassword(newPassword)) {
            return res.status(404).json({
                message: "Weak password. Must be at least 8 characters and include uppercase, lowercase, number, and special character.",
            });
        }
        const user = await prisma_1.prisma.user.findFirst({
            where: {
                resetToken: token,
                resetTokenExpiry: {
                    gt: new Date(),
                },
            },
        });
        console.log("USER FOUND:", user);
        if (!user) {
            return res.status(400);
        }
        const hashedPassword = await bcrypt_1.default.hash(newPassword, 10);
        const updatedUser = await prisma_1.prisma.user.update({
            where: { id: user.id },
            data: {
                password: hashedPassword,
                resetToken: null,
                resetTokenExpiry: null,
            },
        });
        console.log("USER UPDATED:", updatedUser);
        return res.json({ message: "Password reset successful!" });
    }
    catch (err) {
        console.error("RESET ERROR:", err);
        return res.status(500).json({ message: "Server error" });
    }
};
exports.resetPass = resetPass;
