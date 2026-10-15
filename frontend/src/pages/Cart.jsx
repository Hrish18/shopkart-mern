import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import CartItem from "../components/CartItem";
import { formatPrice } from "../utils/format";

function Cart() {
  const { cartItems, loading, error, cartCount, subtotal, fetchCart } = useCart();
  const navigate = useNavigate();

  if (loading) return <div className="status-box">Loading your cart...</div>;

  if (error)
    return (
      <div className="status-box error-box">
        <p>Unable to load your cart.</p>
        <button className="btn btn-primary" onClick={fetchCart}>Try Again</button>
      </div>
    );

  if (cartItems.length === 0)
    return (
      <div className="status-box">
        <div className="big-emoji">🛒</div>
        <h3>Your cart is empty</h3>
        <p>Looks like you haven't added anything yet.</p>
        <Link to="/products" className="btn btn-primary">Browse Products</Link>
      </div>
    );

  return (
    <div className="page">
      <div className="container">
        <div className="page-header">
          <h1>My Cart</h1>
        </div>

        <div className="cart-layout">
          <div className="cart-list">
            {cartItems.map((item) => (
              <CartItem key={item.product._id} item={item} />
            ))}
          </div>

          <div className="summary-box">
            <h3>Order Summary</h3>
            <div className="summary-row">
              <span>Items</span>
              <span>{cartCount}</span>
            </div>
            <div className="summary-row summary-total">
              <span>Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <button className="btn btn-primary btn-block" onClick={() => navigate("/checkout")}>
              Proceed to Checkout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Cart;