import { useState } from "react";
import { Link } from "react-router-dom";
import { formatPrice, getStockInfo } from "../utils/format";

function WishlistCard({ product, onRemove }) {
  const [removing, setRemoving] = useState(false);
  const stockInfo = getStockInfo(product.stock);

  const handleRemove = async () => {
    setRemoving(true);
    await onRemove(product._id);
    setRemoving(false);
  };

  return (
    <div className="product-card">
      <div className="product-image-wrap">
        <img src={product.image} alt={product.name} />
        <span className="category-badge">{product.category}</span>
      </div>

      <div className="product-body">
        <h3 className="product-name">{product.name}</h3>

        <div className="product-footer">
          <span className="product-price">{formatPrice(product.price)}</span>
          <span className={`stock-tag ${stockInfo.className}`}>{stockInfo.text}</span>
        </div>

        <div className="card-actions">
          <Link to={`/products/${product._id}`} className="btn btn-outline btn-sm">
            View Details
          </Link>
          <button className="btn btn-danger btn-sm" onClick={handleRemove} disabled={removing}>
            {removing ? "Removing..." : "Remove ♥"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default WishlistCard;