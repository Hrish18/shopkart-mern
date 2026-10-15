import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Home() {
  const { user } = useAuth();

  return (
    <div className="page">
      <div className="container">
        <div className="hero">
          <p className="eyebrow">WELCOME TO SHOPKART</p>
          <h1>Hello, {user.fullName} 👋</h1>
          <p className="muted">Great to see you again. Ready to find something you love?</p>
          <Link to="/products" className="btn btn-primary">Browse Products</Link>
        </div>

        <div className="info-card">
          <h3>Your Account</h3>
          <p><strong>Name:</strong> {user.fullName}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Phone:</strong> {user.phone}</p>
        </div>
      </div>
    </div>
  );
}

export default Home;