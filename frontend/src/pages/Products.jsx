import { useEffect, useState } from "react";
import { getProducts, getWishlist } from "../services/api";
import ProductCard from "../components/ProductCard";
import SearchBar from "../components/SearchBar";

function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [category, setCategory] = useState("All Categories");
  const [sort, setSort] = useState("");
  const [wishlistIds, setWishlistIds] = useState([]);
  const [retry, setRetry] = useState(0);

  // Wait 400ms after typing stops before calling the backend
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    getWishlist()
      .then(({ data }) => setWishlistIds(data.wishlist.map((p) => p._id)))
      .catch(() => {});
  }, []);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        setLoading(true);
        setError("");
        const { data } = await getProducts({
          search: debouncedSearch,
          category,
          sort,
        });
        if (!cancelled) setProducts(data.products);
      } catch {
        if (!cancelled) setError("Something went wrong while loading products.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [debouncedSearch, category, sort, retry]);

  return (
    <div className="page">
      <div className="container">
        <div className="page-header">
          <p className="eyebrow">DISCOVER SHOPKART</p>
          <h1>Our Products</h1>
          <p className="muted">Find something you love.</p>
        </div>

        <div className="toolbar">
          <SearchBar value={search} onChange={setSearch} />
          <div className="toolbar-filters">
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              <option>All Categories</option>
              <option>Electronics</option>
              <option>Fashion</option>
              <option>Books</option>
              <option>Home</option>
            </select>
            <select value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="">Newest First</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>
        </div>

        {loading && <div className="status-box">Loading products...</div>}

        {error && (
          <div className="status-box error-box">
            <p>{error}</p>
            <button className="btn btn-primary" onClick={() => setRetry(retry + 1)}>
              Try Again
            </button>
          </div>
        )}

        {!loading && !error && products.length === 0 && (
          <div className="status-box">No products found.</div>
        )}

        {!loading && !error && (
          <div className="products-grid">
            {products.map((p) => (
              <ProductCard key={p._id} product={p} wishlisted={wishlistIds.includes(p._id)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Products;