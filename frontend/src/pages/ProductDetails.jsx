import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getProduct, getErrorMessage } from "../services/api";
import { useCart } from "../context/CartContext";
import { formatPrice, getStockInfo } from "../utils/format";

function ProductDetails() {
  const { id } = useParams();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [adding, setAdding] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError("");
        const { data } = await getProduct(id);
        setProduct(data.product);
      } catch (err) {
        setError(
          err?.response?.status === 404
            ? "Product not found."
            : "Something went wrong while loading the product."
        );
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleAdd = async () => {
    setAdding(true);
    setMessage({ type: "", text: "" });
    try {
      await addToCart(product._id);
      setMessage({ type: "success", text: "Added to cart!" });
    } catch (err) {
      setMessage({ type: "error", text: getErrorMessage(err, "Unable to add to cart.") });
    } finally {
      setAdding(false);
    }
  };

  if (loading) return <div className="status-box">Loading product...</div>;
  if (error)
    return (
      <div className="status-box error-box">
        <p>{error}</p>
        <Link to="/products" className="btn btn-primary">Back to Products</Link>
      </div>
    );

  const stockInfo = getStockInfo(product.stock);

  return (
    <div className="page">
      <div className="container">
        <Link to="/products" className="back-link">← Back to Products</Link>

        <div className="details-grid">
          <img src={product.image} alt={product.name} className="details-img" />

          <div className="details-info">
            <span className="category-badge static">{product.category}</span>
            <h1>{product.name}</h1>
            <p className="details-price">{formatPrice(product.price)}</p>
            <span className={`stock-tag ${stockInfo.className}`}>{stockInfo.text}</span>
            <p className="details-desc">{product.description}</p>

            <button
              className="btn btn-primary"
              onClick={handleAdd}
              disabled={adding || product.stock <= 0}
            >
              {adding ? "Adding..." : "Add to Cart"}
            </button>

            {message.text && (
              <p className={message.type === "error" ? "form-error" : "form-success"}>
                {message.text}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetails;