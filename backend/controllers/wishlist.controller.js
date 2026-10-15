const mongoose = require("mongoose");
const Product = require("../models/product.model");
const Customer = require("../models/customer.model");

// POST /wishlist/:productId
const addToWishlist = async (req, res) => {
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
    const exists = customer.wishlist.some((id) => id.toString() === productId);
    if (exists) {
      return res
        .status(409)
        .json({ success: false, message: "Product already in wishlist" });
    }

    customer.wishlist.push(product._id);
    await customer.save();

    res.status(201).json({ success: true, message: "Product added to wishlist" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /wishlist
const getWishlist = async (req, res) => {
  try {
    const customer = await Customer.findById(req.user._id).populate({
      path: "wishlist",
      select: "name price category image stock",
    });

    // Remove entries whose product was deleted
    const wishlist = customer.wishlist.filter(Boolean);

    res.json({ success: true, count: wishlist.length, wishlist });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /wishlist/:productId
const removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!mongoose.isValidObjectId(productId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid product ID" });
    }

    const customer = req.user;
    const index = customer.wishlist.findIndex((id) => id.toString() === productId);

    if (index === -1) {
      return res
        .status(404)
        .json({ success: false, message: "Product not in wishlist" });
    }

    customer.wishlist.splice(index, 1);
    await customer.save();

    res.json({ success: true, message: "Product removed from wishlist" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { addToWishlist, getWishlist, removeFromWishlist };