import { NavLink, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

function Navbar() {
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <div className="nav-inner">
        <Link to={user ? "/home" : "/login"} className="brand">
          🛒 ShopKart
        </Link>

        <div className="nav-links">
          {user ? (
            <>
              <NavLink to="/home" className="nav-link">Home</NavLink>
              <NavLink to="/products" className="nav-link">Products</NavLink>
              <NavLink to="/wishlist" className="nav-link">Wishlist</NavLink>
              <NavLink to="/cart" className="nav-link">
                Cart <span className="badge">{cartCount}</span>
              </NavLink>
              <NavLink to="/orders" className="nav-link">Orders</NavLink>
              <button className="btn btn-outline btn-sm" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className="nav-link">Login</NavLink>
              <NavLink to="/register" className="nav-link">Register</NavLink>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;