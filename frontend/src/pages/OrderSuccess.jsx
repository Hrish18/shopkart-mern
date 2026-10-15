import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getOrder } from "../services/api";
import { formatPrice } from "../utils/format";

function OrderSuccess() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    getOrder(id)
      .then(({ data }) => setOrder(data.order))
      .catch(() => setError(true));
  }, [id]);

  if (error) return <div className="status-box error-box">Unable to load the order.</div>;
  if (!order) return <div className="status-box">Loading...</div>;

  return (
    <div className="status-box success-box">
      <div className="big-emoji">✅</div>
      <h2>Order Placed Successfully</h2>
      <p className="muted">Order ID</p>
      <p><strong>{order._id}</strong></p>
      <p className="muted">Total</p>
      <p><strong>{formatPrice(order.totalAmount)}</strong></p>
      <p className="muted">Status</p>
      <p><span className="status-pill">{order.status}</span></p>
      <p>Your order has been saved successfully.</p>

      <div className="card-actions center-actions">
        <Link to="/orders" className="btn btn-primary">View My Orders</Link>
        <Link to="/products" className="btn btn-outline">Continue Shopping</Link>
      </div>
    </div>
  );
}

export default OrderSuccess;