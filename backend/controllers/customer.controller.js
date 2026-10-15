const bcrypt = require("bcryptjs");
const Customer = require("../models/customer.model");
const generateToken = require("../utils/generateToken");

// POST /customers/register
const registerCustomer = async (req, res) => {
  try {
    const { fullName, email, password, phone } = req.body;

    if (!fullName?.trim() || !email?.trim() || !password || !phone?.trim()) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    const existing = await Customer.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res
        .status(409)
        .json({ success: false, message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const customer = await Customer.create({
      fullName,
      email,
      password: hashedPassword,
      phone,
    });

    res.status(201).json({
      success: true,
      message: "Customer registered successfully",
      customer: {
        _id: customer._id,
        fullName: customer.fullName,
        email: customer.email,
        phone: customer.phone,
      },
    });
  } catch (error) {
    if (error.code === 11000) {
      return res
        .status(409)
        .json({ success: false, message: "Email already exists" });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /customers/login
const loginCustomer = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Email and password are required" });
    }

    const customer = await Customer.findOne({
      email: email.toLowerCase().trim(),
    }).select("+password");

    const isMatch = customer && (await bcrypt.compare(password, customer.password));

    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    generateToken(res, customer._id);

    res.json({
      success: true,
      message: "Login successful",
      customer: {
        _id: customer._id,
        fullName: customer.fullName,
        email: customer.email,
        phone: customer.phone,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /customers/me
const getMe = async (req, res) => {
  const { _id, fullName, email, phone } = req.user;
  res.json({ _id, fullName, email, phone });
};

// POST /customers/logout
const logoutCustomer = (req, res) => {
  res.cookie("token", "", {
    httpOnly: true,
    sameSite: "lax",
    expires: new Date(0),
  });
  res.json({ success: true, message: "Logged out successfully" });
};

// PATCH /customers/change-password  (bonus)
const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword || newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Old password and a new password (min 6 chars) are required",
      });
    }

    const customer = await Customer.findById(req.user._id).select("+password");
    const isMatch = await bcrypt.compare(oldPassword, customer.password);

    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Old password is incorrect" });
    }

    customer.password = await bcrypt.hash(newPassword, 10);
    await customer.save();

    res.json({ success: true, message: "Password changed successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  registerCustomer,
  loginCustomer,
  getMe,
  logoutCustomer,
  changePassword,
};