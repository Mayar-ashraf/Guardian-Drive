import express from "express";
import crypto from "crypto";
import { prisma } from "../lib/prisma"
import sgMail from "@sendgrid/mail";
import bcrypt from "bcrypt";
import { Role } from "../../generated/prisma/enums";

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

export const forgetPass = async (req: express.Request, res: express.Response) => {

  const { email } = req.body;

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    return res.status(404).json({ message: "This email is not registered. Please enter a valid email." });
  }
  const role = user.role;
  if (role != Role.DRIVER){
    return res.status(403).json({ message: "Only drivers can reset their password through this portal." });
  }

  const resettoken = crypto.randomBytes(32).toString("hex");
  const expiry = new Date(Date.now() + 15 * 60 * 1000);

  await prisma.user.update({
    where: { email },
    data: {
      resetToken: resettoken,
      resetTokenExpiry: expiry,
    },
  });

const resetLink = `http://10.0.2.2:3000/api/password/reset-password?token=${resettoken}`;
  await sgMail.send({
    to: email,
    from: process.env.EMAIL_FROM!,
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
export const validateToken =async(req:any,res:any)=>{
  const { token } = req.query;

  const user = await prisma.user.findFirst({
    where: {
      resetToken: token,
      resetTokenExpiry: {
        gt: new Date(),
      },
    },
  }); 
  if (!user) {
    return res.status(400).json({ message: "Invalid or expired token!" });
  } else {
    return res.json({ message: "Token is valid." });
  }
}
export const resetPass = async (req: any, res: any) => {
  const { token, newPassword } = req.body;

  try {
    console.log("RESET REQUEST RECEIVED:", req.body);

    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: {
          gt: new Date(),
        },
      },
    });

    console.log("USER FOUND:", user);

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token!" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });

    console.log("USER UPDATED:", updatedUser);

    return res.json({ message: "Password reset successful!" });

  } catch (err) {
    console.error("RESET ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
};