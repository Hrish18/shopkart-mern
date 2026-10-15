const crypto = require("crypto");
const mongoose = require("mongoose");
const Customer = require("../models/customer.model");
const Product = require("../models/product.model");
const Order = require("../models/order.model");
const getRazorpay = require("../config/razorpay");

const validateShipping = (a) => {
  if (!a) return "Shipping address is required";
  const fields = ["fullName", "phone", "addressLine1", "city", "state", "pincode"];
  for (const f of fields) {
    if (!a[f] || !String(a[f]).trim()) return `${f} is required`;
  }
  if (!/^\d{10}$/.test(String(a.phone).trim())) return "Phone must be 10 digits";
  if (!/^\d{6}$/.test(String(a.pincode).trim())) return "Pincode must contain 6 digits";
  return null;
};

// POST /orders/create-payment-order
const createPaymentOrder = async (req, res) => {
  try {
    const { shippingAddress } = req.body; // totalAmount from client is ignored

    const shippingError = validateShipping(shippingAddress);
    if (shippingError) {
      return res.status(400).json({ success: false, message: shippingError });
    }

    const customer = await Customer.findById(req.user._id).populate("cart.product");

    if (!customer.cart.length) {
      return res.status(400).json({ success: false, message: "Your cart is empty" });
    }

    const items = [];
    let totalAmount = 0;

    for (const cartItem of customer.cart) {
      const product = cartItem.product;

      if (!product) {
        return res.status(400).json({
          success: false,
          message: "A product in your cart is no longer available. Please update your cart.",
        });
      }

      if (cartItem.quantity > product.stock) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}.`,
        });
      }

      items.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: cartItem.quantity,
        image: product.image,
      });

      totalAmount += product.price * cartItem.quantity;
    }

    const cleanAddress = {};
    for (const key of Object.keys(shippingAddress)) {
      cleanAddress[key] = String(shippingAddress[key]).trim();
    }

    const order = await Order.create({
      user: customer._id,
      items,
      shippingAddress: cleanAddress,
      totalAmount,
    });

    let razorpayOrder;
    try {
      razorpayOrder = await getRazorpay().orders.create({
        amount: Math.round(totalAmount * 100), // rupees -> paise
        currency: "INR",
        receipt: order._id.toString(),
      });
    } catch (err) {
      console.log("Razorpay error:", err);
      await Order.findByIdAndDelete(order._id);
      return res.status(500).json({
        success: false,
        message: "Unable to start payment. Please check the Razorpay keys in .env.",
      });
    }

    order.razorpayOrderId = razorpayOrder.id;
    await order.save();

    res.status(201).json({
      success: true,
      shopKartOrderId: order._id,
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /orders/verify-payment
const verifyPayment = async (req, res) => {
  try {
    const {
      shopKartOrderId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    if (
      !mongoose.isValidObjectId(shopKartOrderId) ||
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Missing payment details" });
    }

    const order = await Order.findOne({
      _id: shopKartOrderId,
      user: req.user._id,
    });

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    if (order.paymentStatus === "PAID") {
      return res.json({ success: true, order });
    }

    if (order.razorpayOrderId !== razorpay_order_id) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid payment signature" });
    }

    // Trusted order id comes from our database
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(order.razorpayOrderId + "|" + razorpay_payment_id)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid payment signature" });
    }

    order.paymentStatus = "PAID";
    order.status = "PLACED";
    order.razorpayPaymentId = razorpay_payment_id;
    await order.save();

    // Reduce stock for purchased items
    for (const item of order.items) {
      await Product.updateOne({ _id: item.product }, { $inc: { stock: -item.quantity } });
    }

    // Clear cart only after verified payment
    const customer = await Customer.findById(req.user._id);
    customer.cart = [];
    await customer.save();

    res.json({ success: true, message: "Payment verified", order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /orders
const getOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id, paymentStatus: "PAID" }).sort({
      createdAt: -1,
    });
    res.json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /orders/:id
const getOrderById = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid order ID" });
    }

    const order = await Order.findById(req.params.id);

    if (!order || order.user.toString() !== req.user._id.toString()) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { createPaymentOrder, verifyPayment, getOrders, getOrderById };