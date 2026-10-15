const express = require("express");
const router = express.Router();
const {
  addToWishlist,
  getWishlist,
  removeFromWishlist,
} = require("../controllers/wishlist.controller");
const { protect } = require("../middlewares/auth.middleware");

router.use(protect);

router.get("/", getWishlist);
router.post("/:productId", addToWishlist);
router.delete("/:productId", removeFromWishlist);

module.exports = router;