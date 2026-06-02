const Admin = require("../models/Admin");
const jwt = require("jsonwebtoken");
const env = require("../config/env");
const sendEmail = require("../utils/emailUtil");

const generateToken = (id) => {
  return jwt.sign({ id }, env.jwtSecret, { expiresIn: "1d" });
};

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const admin = await Admin.findOne({ email });

    if (admin && (await admin.matchPassword(password))) {
      res.json({
        _id: admin._id,
        email: admin.email,
        role: admin.role,
        token: generateToken(admin._id),
      });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(404).json({ message: "Admin with this email does not exist" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    admin.otp = otp;
    admin.otpExpiry = Date.now() + 10 * 60 * 1000; // 10 mins
    await admin.save();

    const message = `Your OTP for password reset is: ${otp}. It is valid for 10 minutes.`;
    const html = `
      <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #333;">Password Reset OTP</h2>
        <p>You requested a password reset. Use the following OTP to proceed:</p>
        <div style="font-size: 24px; font-weight: bold; color: #007bff; margin: 20px 0;">${otp}</div>
        <p style="color: #666; font-size: 14px;">This OTP is valid for 10 minutes.</p>
      </div>
    `;

    await sendEmail({
      email: admin.email,
      subject: "Password Reset OTP",
      message,
      html,
    });

    res.json({ success: true, message: "OTP sent to your email" });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ message: "Error sending OTP" });
  }
};

exports.verifyOTP = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const admin = await Admin.findOne({
      email,
      otp,
      otpExpiry: { $gt: Date.now() },
    });

    if (!admin) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    res.json({ success: true, message: "OTP verified successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error verifying OTP" });
  }
};

exports.resetPassword = async (req, res) => {
  const { email, otp, password, confirmPassword } = req.body;

  if (password !== confirmPassword) {
    return res.status(400).json({ message: "Passwords do not match" });
  }

  if (!passwordRegex.test(password)) {
    return res.status(400).json({
      message: "Password must be at least 8 characters long, include one uppercase letter, one lowercase letter, one number, and one special character",
    });
  }

  try {
    const admin = await Admin.findOne({
      email,
      otp,
      otpExpiry: { $gt: Date.now() },
    });

    if (!admin) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    admin.password = password;
    admin.otp = null;
    admin.otpExpiry = null;
    await admin.save();

    res.json({ success: true, message: "Password updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error resetting password" });
  }
};

