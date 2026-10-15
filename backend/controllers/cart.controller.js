const mongoose = require("mongoose");
const Product = require("../models/product.model");
const Customer = require("../models/customer.model");

// Helper: returns the cart with product details, skipping deleted products
const getPopulatedCart = async (customerId) => {
  const customer = await Customer.findById(customerId).populate({
    path: "cart.product",
    select: "name price image stock category",
  });
  return customer.cart
    .filter((item) => item.product)
    .map((item) => ({ product: item.product, quantity: item.quantity }));
};

// POST /cart/:productId
const addToCart = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!mongoose.isValidObjectId(productId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid product ID" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    const customer = req.user;
    const item = customer.cart.find((i) => i.product.toString() === productId);
    const newQuantity = item ? item.quantity + 1 : 1;

    if (newQuantity > product.stock) {
      return res.status(400).json({
        success: false,
        message:
          product.stock === 0
            ? "This product is out of stock"
            : `Only ${product.stock} unit(s) available`,
      });
    }

    if (item) {
      item.quantity = newQuantity;
    } else {
      customer.cart.push({ product: product._id, quantity: 1 });
    }

    await customer.save();

    res.json({
      success: true,
      message: "Cart updated",
      cart: await getPopulatedCart(customer._id),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /cart
const getCart = async (req, res) => {
  try {
    res.json({ success: true, cart: await getPopulatedCart(req.user._id) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PATCH /cart/:productId
const updateCartQuantity = async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;

    if (!mongoose.isValidObjectId(productId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid product ID" });
    }

    if (typeof quantity !== "number" || !Number.isInteger(quantity) || quantity < 1) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be a whole number of at least 1",
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    const customer = req.user;
    const item = customer.cart.find((i) => i.product.toString() === productId);
    if (!item) {
      return res
        .status(404)
        .json({ success: false, message: "Product not in cart" });
    }

    if (quantity > product.stock) {
      return res.status(400).json({
        success: false,
        message: `Only ${product.stock} unit(s) available`,
      });
    }

    item.quantity = quantity;
    await customer.save();

    res.json({
      success: true,
      message: "Quantity updated",
      cart: await getPopulatedCart(customer._id),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /cart/:productId
const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!mongoose.isValidObjectId(productId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid product ID" });
    }

    const customer = req.user;
    customer.cart = customer.cart.filter((i) => i.product.toString() !== productId);
    await customer.save();

    res.json({
      success: true,
      message: "Item removed",
      cart: await getPopulatedCart(customer._id),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { addToCart, getCart, updateCartQuantity, removeFromCart };