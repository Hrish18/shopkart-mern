import { useRef, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { createPaymentOrder, verifyPayment, getErrorMessage } from "../services/api";
import OrderSummary from "../components/OrderSummary";

const loadRazorpayScript = () =>
  new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

function Checkout() {
  const { user } = useAuth();
  const { cartItems, loading, subtotal, clearCartState } = useCart();
  const navigate = useNavigate();
  const paymentDone = useRef(false);

  const [form, setForm] = useState({
    fullName: user?.fullName || "",
    phone: user?.phone || "",
    addressLine1: "",
    city: "",
    state: "",
    pincode: "",
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [processing, setProcessing] = useState(false);

  if (loading) return <div className="status-box">Loading...</div>;

  // Empty cart -> go back (but not right after a successful payment)
  if (cartItems.length === 0 && !paymentDone.current) {
    return <Navigate to="/cart" replace />;
  }

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const validate = () => {
    const e = {};
    if (!form.fullName.trim()) e.fullName = "Full name is required.";
    if (!/^\d{10}$/.test(form.phone.trim())) e.phone = "Phone must be a valid 10-digit number.";
    if (!form.addressLine1.trim()) e.addressLine1 = "Address is required.";
    if (!form.city.trim()) e.city = "City is required.";
    if (!form.state.trim()) e.state = "State is required.";
    if (!/^\d{6}$/.test(form.pincode.trim())) e.pincode = "Pincode must contain 6 digits.";
    return e;
  };

  const handlePay = async (e) => {
    e.preventDefault();
    setServerError("");

    const v = validate();
    setErrors(v);
    if (Object.keys(v).length) return;

    try {
      setProcessing(true);

      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        setServerError("Unable to load Razorpay. Check your internet connection.");
        setProcessing(false);
        return;
      }

      const { data } = await createPaymentOrder(form);

      const options = {
        key: data.key,
        amount: data.amount,
        currency: data.currency,
        name: "ShopKart",
        description: "ShopKart Order",
        order_id: data.razorpayOrderId,

        handler: async (response) => {
          try {
            const verify = await verifyPayment({
              shopKartOrderId: data.shopKartOrderId,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            paymentDone.current = true;
            clearCartState();
            navigate(`/order-success/${verify.data.order._id}`);
          } catch (err) {
            setServerError(getErrorMessage(err, "Payment verification failed."));
            setProcessing(false);
          }
        },

        modal: {
          ondismiss: () => setProcessing(false),
        },

        prefill: { name: form.fullName, contact: form.phone },
        theme: { color: "#4f46e5" },
      };

      const rzp = new window.Razorpay(options);

      rzp.on("payment.failed", () => {
        setServerError("Payment failed. Your cart has not been cleared. Please try again.");
        setProcessing(false);
      });

      rzp.open();
    } catch (err) {
      setServerError(getErrorMessage(err, "Unable to start payment."));
      setProcessing(false);
    }
  };

  const field = (name, label, placeholder) => (
    <div className="form-group">
      <label>{label}</label>
      <input name={name} value={form[name]} onChange={handleChange} placeholder={placeholder} />
      {errors[name] && <span className="field-error">{errors[name]}</span>}
    </div>
  );

  return (
    <div className="page">
      <div className="container">
        <div className="page-header">
          <h1>Checkout</h1>
        </div>

        <div className="cart-layout">
          <form className="form-card" onSubmit={handlePay} noValidate>
            <h3>Shipping Details</h3>
            {field("fullName", "Full Name", "John Doe")}
            {field("phone", "Phone", "9876543210")}
            {field("addressLine1", "Address", "22 MG Road")}
            {field("city", "City", "Bengaluru")}
            {field("state", "State", "Karnataka")}
            {field("pincode", "Pincode", "560001")}

            {serverError && <p className="form-error">{serverError}</p>}

            <button className="btn btn-primary btn-block" disabled={processing}>
              {processing ? "Processing..." : "Place Order & Pay"}
            </button>
          </form>

          <OrderSummary cartItems={cartItems} subtotal={subtotal} />
        </div>
      </div>
    </div>
  );
}

export default Checkout;