import { formatPrice } from "../utils/format";

function OrderSummary({ cartItems, subtotal }) {
  return (
    <div className="summary-box">
      <h3>Order Summary</h3>
      {cartItems.map((item) => (
        <div className="summary-row" key={item.product._id}>
          <span>
            {item.product.name} × {item.quantity}
          </span>
          <span>{formatPrice(item.product.price * item.quantity)}</span>
        </div>
      ))}
      <div className="summary-row summary-total">
        <span>Total</span>
        <span>{formatPrice(subtotal)}</span>
      </div>
    </div>
  );
}

export default OrderSummary;