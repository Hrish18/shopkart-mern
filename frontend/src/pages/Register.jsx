import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { registerCustomer, getErrorMessage } from "../services/api";
import { useAuth } from "../context/AuthContext";

function Register() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ fullName: "", email: "", password: "", phone: "" });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to="/home" replace />;

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const validate = () => {
    const e = {};
    if (!form.fullName.trim()) e.fullName = "Full name is required.";
    if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = "Enter a valid email.";
    if (form.password.length < 6) e.password = "Password must be at least 6 characters.";
    if (!/^\d{10}$/.test(form.phone.trim())) e.phone = "Phone must be 10 digits.";
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");
    const v = validate();
    setErrors(v);
    if (Object.keys(v).length) return;

    try {
      setLoading(true);
      await registerCustomer(form);
      navigate("/login", { state: { registered: true } });
    } catch (err) {
      setServerError(getErrorMessage(err, "Registration failed."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrap">
      <form className="auth-card" onSubmit={handleSubmit} noValidate>
        <h2>Create Account</h2>
        <p className="muted">Join ShopKart and start shopping.</p>

        <div className="form-group">
          <label>Full Name</label>
          <input name="fullName" value={form.fullName} onChange={handleChange} placeholder="John Doe" />
          {errors.fullName && <span className="field-error">{errors.fullName}</span>}
        </div>

        <div className="form-group">
          <label>Email</label>
          <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="john@gmail.com" />
          {errors.email && <span className="field-error">{errors.email}</span>}
        </div>

        <div className="form-group">
          <label>Password</label>
          <input name="password" type="password" value={form.password} onChange={handleChange} placeholder="At least 6 characters" />
          {errors.password && <span className="field-error">{errors.password}</span>}
        </div>

        <div className="form-group">
          <label>Phone Number</label>
          <input name="phone" value={form.phone} onChange={handleChange} placeholder="9876543210" />
          {errors.phone && <span className="field-error">{errors.phone}</span>}
        </div>

        {serverError && <p className="form-error">{serverError}</p>}

        <button className="btn btn-primary btn-block" disabled={loading}>
          {loading ? "Creating..." : "Create Account"}
        </button>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </form>
    </div>
  );
}

export default Register;