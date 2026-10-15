const mongoose = require("mongoose");
const Product = require("../models/product.model");

const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// POST /products
const createProduct = async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json({ success: true, product });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// GET /products?search=&category=&sort=
const getProducts = async (req, res) => {
  try {
    const { search, category, sort } = req.query;
    const filter = {};

    if (search && search.trim()) {
      filter.name = { $regex: escapeRegex(search.trim()), $options: "i" };
    }

    if (category && category !== "All Categories") {
      filter.category = category;
    }

    let sortOption = { createdAt: -1 };
    if (sort === "price_asc") sortOption = { price: 1 };
    if (sort === "price_desc") sortOption = { price: -1 };

    const products = await Product.find(filter)
      .select("name description price category image stock createdAt")
      .sort(sortOption);

    res.json({ success: true, count: products.length, products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /products/:id
const getProductById = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid product ID" });
    }

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    res.json({ success: true, product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { createProduct, getProducts, getProductById };