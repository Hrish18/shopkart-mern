import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { addToWishlist, getErrorMessage } from "../services/api";
import { useCart } from "../context/CartContext";
import { formatPrice, getStockInfo } from "../utils/format";

const FALLBACK_IMAGE = "https://placehold.co/800x600/eef2ff/4f46e5?text=ShopKart";

function ProductCard({ product, wishlisted = false }) {
  const { addToCart } = useCart();
  const [wishState, setWishState] = useState(wishlisted ? "saved" : "idle");
  const [wishError, setWishError] = useState("");
  const [adding, setAdding] = useState(false);
  const [cartError, setCartError] = useState("");

  useEffect(() => {
    if (wishlisted) setWishState("saved");
  }, [wishlisted]);

  const stockInfo = getStockInfo(product.stock);

  const handleWishlist = async () => {
    if (wishState !== "idle") return;
    setWishState("saving");
    setWishError("");
    try {
      await addToWishlist(product._id);
      setWishState("saved");
    } catch (err) {
      if (err?.response?.status === 409) {
        setWishState("saved");
      } else {
        setWishState("idle");
        setWishError("Unable to save product. Please try again.");
      }
    }
  };

  const handleAddToCart = async () => {
    if (adding) return;
    setAdding(true);
    setCartError("");
    try {
      await addToCart(product._id);
    } catch (err) {
      setCartError(getErrorMessage(err, "Unable to add to cart."));
    } finally {
      setAdding(false);
    }
  };

  const wishLabel = {
    idle: "♡ Add to Wishlist",
    saving: "⏳ Saving...",
    saved: "♥ Added to Wishlist",
  }[wishState];

  return (
    <div className="product-card">
      <div className="product-image-wrap">
        <img
          src={product.image || FALLBACK_IMAGE}
          alt={product.name}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = FALLBACK_IMAGE;
          }}
        />
        <span className="category-badge">{product.category}</span>
      </div>

      <div className="product-body">
        <h3 className="product-name">{product.name}</h3>
        <p className="product-desc">{product.description}</p>

        <div className="product-footer">
          <span className="product-price">{formatPrice(product.price)}</span>
          <span className={`stock-tag ${stockInfo.className}`}>{stockInfo.text}</span>
        </div>

        <div className="card-actions">
          <Link to={`/products/${product._id}`} className="btn btn-outline btn-sm">
            View Details
          </Link>
          <button
            className={`btn btn-sm ${wishState === "saved" ? "btn-saved" : "btn-outline"}`}
            onClick={handleWishlist}
            disabled={wishState === "saving"}
          >
            {wishLabel}
          </button>
        </div>

        <button
          className="btn btn-primary btn-block"
          onClick={handleAddToCart}
          disabled={adding || product.stock <= 0}
        >
          {adding ? "Adding..." : product.stock <= 0 ? "Out of Stock" : "Add to Cart"}
        </button>

        {wishError && <p className="form-error">{wishError}</p>}
        {cartError && <p className="form-error">{cartError}</p>}
      </div>
    </div>
  );
}

export default ProductCard;