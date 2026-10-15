import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getWishlist, removeFromWishlist } from "../services/api";
import WishlistCard from "../components/WishlistCard";

function Wishlist() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [actionError, setActionError] = useState("");

  const load = async () => {
    try {
      setLoading(true);
      setError(false);
      const { data } = await getWishlist();
      setItems(data.wishlist);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleRemove = async (productId) => {
    setActionError("");
    try {
      await removeFromWishlist(productId);
      setItems((prev) => prev.filter((p) => p._id !== productId));
    } catch {
      setActionError("Unable to remove the product. Please try again.");
    }
  };

  if (loading) return <div className="status-box">Loading your wishlist...</div>;

  if (error)
    return (
      <div className="status-box error-box">
        <h3>Something went wrong.</h3>
        <p>We couldn't load your wishlist.</p>
        <button className="btn btn-primary" onClick={load}>Try Again</button>
      </div>
    );

  return (
    <div className="page">
      <div className="container">
        <div className="page-header">
          <h1>My Wishlist</h1>
          <p className="muted">
            {items.length} product{items.length !== 1 ? "s" : ""} saved
          </p>
        </div>

        {actionError && <p className="form-error center">{actionError}</p>}

        {items.length === 0 ? (
          <div className="status-box">
            <div className="big-emoji">❤️</div>
            <h3>Your wishlist is empty</h3>
            <p>Save products you love and find them here later.</p>
            <Link to="/products" className="btn btn-primary">Browse Products</Link>
          </div>
        ) : (
          <div className="products-grid">
            {items.map((p) => (
              <WishlistCard key={p._id} product={p} onRemove={handleRemove} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Wishlist;