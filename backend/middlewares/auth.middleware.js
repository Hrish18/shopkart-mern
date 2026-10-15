const jwt = require("jsonwebtoken");
const Customer = require("../models/customer.model");

const protect = async (req, res, next) => {
  try {
    let token = req.cookies.token;

    if (!token && req.headers.authorization?.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: "Not logged in. Please login first." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const customer = await Customer.findById(decoded.id);

    if (!customer) {
      return res
        .status(401)
        .json({ success: false, message: "Customer no longer exists." });
    }

    req.user = customer;
    next();
  } catch (error) {
    return res
      .status(401)
      .json({ success: false, message: "Invalid or expired token." });
  }
};

module.exports = { protect };