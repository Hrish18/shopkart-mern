import { Link } from "react-router-dom";
import { formatDate, formatPrice } from "../utils/format";

function OrderCard({ order }) {
  return (
    <div className="order-card">
      <div className="order-head">
        <div>
          <strong>Order #{order._id.slice(-8)}</strong>
          <p className="muted">{formatDate(order.createdAt)}</p>
        </div>
        <span className="status-pill">{order.status}</span>
      </div>

      <ul className="order-items">
        {order.items.map((item) => (
          <li key={item.product}>
            {item.name} × {item.quantity}
          </li>
        ))}
      </ul>

      <div className="order-foot">
        <strong>Total: {formatPrice(order.totalAmount)}</strong>
        <Link to={`/orders/${order._id}`} className="btn btn-outline btn-sm">
          View Details
        </Link>
      </div>
    </div>
  );
}

export default OrderCard;