import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getOrder } from "../services/api";
import { formatDate, formatPrice } from "../utils/format";

function OrderDetails() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await getOrder(id);
        setOrder(data.order);
      } catch (err) {
        setError(err?.response?.status === 404 ? "Order not found." : "Unable to load the order.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) return <div className="status-box">Loading order...</div>;
  if (error) return <div className="status-box error-box">{error}</div>;

  const a = order.shippingAddress;

  return (
    <div className="page">
      <div className="container narrow">
        <Link to="/orders" className="back-link">← Back to Orders</Link>

        <div className="order-card">
          <div className="order-head">
            <div>
              <h2>Order #{order._id.slice(-8)}</h2>
              <p className="muted">{formatDate(order.createdAt)}</p>
            </div>
            <span className="status-pill">{order.status}</span>
          </div>

          {order.items.map((item) => (
            <div className="order-line" key={item.product}>
              {item.image && <img src={item.image} alt={item.name} />}
              <div className="order-line-info">
                <strong>{item.name}</strong>
                <span className="muted">
                  {formatPrice(item.price)} × {item.quantity}
                </span>
              </div>
              <strong>{formatPrice(item.price * item.quantity)}</strong>
            </div>
          ))}

          <div className="summary-row summary-total">
            <span>Total</span>
            <span>{formatPrice(order.totalAmount)}</span>
          </div>

          <h3>Shipping Address</h3>
          <p>
            {a.fullName}, {a.phone}
            <br />
            {a.addressLine1}, {a.city}, {a.state} - {a.pincode}
          </p>

          <p className="muted">Payment: {order.paymentStatus}</p>
        </div>
      </div>
    </div>
  );
}

export default OrderDetails;