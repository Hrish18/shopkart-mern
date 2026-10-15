import { useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { getErrorMessage } from "../services/api";
import { formatPrice } from "../utils/format";

function CartItem({ item }) {
  const { updateQuantity, removeFromCart } = useCart();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const { product, quantity } = item;

  const run = async (action) => {
    setBusy(true);
    setError("");
    try {
      await action();
    } catch (err) {
      setError(getErrorMessage(err, "Something went wrong."));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="cart-item">
      <img src={product.image} alt={product.name} className="cart-img" />

      <div className="cart-info">
        <Link to={`/products/${product._id}`} className="cart-name">
          {product.name}
        </Link>
        <p className="muted">{formatPrice(product.price)} each</p>

        <div className="qty-controls">
          <button
            className="qty-btn"
            disabled={busy || quantity <= 1}
            onClick={() => run(() => updateQuantity(product._id, quantity - 1))}
          >
            −
          </button>
          <span className="qty-value">{quantity}</span>
          <button
            className="qty-btn"
            disabled={busy || quantity >= product.stock}
            onClick={() => run(() => updateQuantity(product._id, quantity + 1))}
          >
            +
          </button>
        </div>

        <button
          className="btn btn-danger btn-sm"
          disabled={busy}
          onClick={() => run(() => removeFromCart(product._id))}
        >
          Remove
        </button>

        {error && <p className="form-error">{error}</p>}
      </div>

      <div className="cart-line-total">{formatPrice(product.price * quantity)}</div>
    </div>
  );
}

export default CartItem;