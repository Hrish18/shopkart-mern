import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getOrders } from "../services/api";
import OrderCard from "../components/OrderCard";

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      setError(false);
      const { data } = await getOrders();
      setOrders(data.orders);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  if (loading) return <div className="status-box">Loading your orders...</div>;

  if (error)
    return (
      <div className="status-box error-box">
        <p>Unable to load your orders.</p>
        <button className="btn btn-primary" onClick={load}>Try Again</button>
      </div>
    );

  if (orders.length === 0)
    return (
      <div className="status-box">
        <div className="big-emoji">📦</div>
        <h3>You have not placed any orders yet.</h3>
        <Link to="/products" className="btn btn-primary">Start Shopping</Link>
      </div>
    );

  return (
    <div className="page">
      <div className="container narrow">
        <div className="page-header">
          <h1>My Orders</h1>
        </div>
        {orders.map((o) => (
          <OrderCard key={o._id} order={o} />
        ))}
      </div>
    </div>
  );
}

export default Orders;