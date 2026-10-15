import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import {
  getCart,
  addToCartApi,
  updateCartApi,
  removeFromCartApi,
} from "../services/api";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchCart = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const { data } = await getCart();
      setCartItems(data.cart);
    } catch {
      setError("Unable to load your cart.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchCart();
    } else {
      setCartItems([]);
      setLoading(false);
    }
  }, [user, fetchCart]);

  // These throw on failure so the component can show the error message
  const addToCart = async (productId) => {
    const { data } = await addToCartApi(productId);
    setCartItems(data.cart);
  };

  const updateQuantity = async (productId, quantity) => {
    const { data } = await updateCartApi(productId, quantity);
    setCartItems(data.cart);
  };

  const removeFromCart = async (productId) => {
    const { data } = await removeFromCartApi(productId);
    setCartItems(data.cart);
  };

  const clearCartState = () => setCartItems([]);

  // Derived values (never stored)
  const cartCount = cartItems.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = cartItems.reduce((sum, i) => sum + i.product.price * i.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        loading,
        error,
        cartCount,
        subtotal,
        fetchCart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCartState,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);