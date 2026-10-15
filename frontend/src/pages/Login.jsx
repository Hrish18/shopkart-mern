import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { loginCustomer } from "../services/api";
import { useAuth } from "../context/AuthContext";

function Login() {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to="/home" replace />;

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.email.trim() || !form.password) {
      setError("Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);
      await loginCustomer(form);
      await refreshUser();
      navigate("/home");
    } catch {
      setError("Invalid Credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrap">
      <form className="auth-card" onSubmit={handleSubmit} noValidate>
        <h2>Welcome Back</h2>
        <p className="muted">Login to continue shopping.</p>

        {location.state?.registered && (
          <p className="form-success">Account created! Please login.</p>
        )}

        <div className="form-group">
          <label>Email</label>
          <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="john@gmail.com" />
        </div>

        <div className="form-group">
          <label>Password</label>
          <input name="password" type="password" value={form.password} onChange={handleChange} placeholder="Your password" />
        </div>

        {error && <p className="form-error">{error}</p>}

        <button className="btn btn-primary btn-block" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>

        <p className="auth-switch">
          New to ShopKart? <Link to="/register">Create an account</Link>
        </p>
      </form>
    </div>
  );
}

export default Login;