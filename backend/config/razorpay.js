const Razorpay = require("razorpay");

// Created only when needed, so the server still starts without keys
const getRazorpay = () =>
  new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });

module.exports = getRazorpay;