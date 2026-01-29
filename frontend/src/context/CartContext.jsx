import { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthProvider";
import { isTokenExpired, handleTokenExpiration } from "../utils/auth";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartCount, setCartCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const { setAuthUser } = useAuth();

  // ✅ Fetch cart count on initial load
  const fetchCartCount = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("http://localhost:4000/cart", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        
        // Check for token expiration
        if (res.status === 401 || isTokenExpired({ response: { status: res.status, data: errorData } })) {
          handleTokenExpiration(null, setAuthUser);
          setCartCount(0);
          setLoading(false);
          return;
        }
        
        throw new Error("Failed to fetch cart count");
      }

      const data = await res.json();
      const cartData = data.cart || data;

      // ✅ Set the actual cart count from backend
      setCartCount(cartData?.items?.length || 0);
    } catch (err) {
      console.error("Failed to fetch cart count:", err);
      
      // Check for token expiration
      if (isTokenExpired(err)) {
        handleTokenExpiration(null, setAuthUser);
      }
      
      setCartCount(0);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Fetch cart count when component mounts
  useEffect(() => {
    fetchCartCount();
  }, []);

  return (
    <CartContext.Provider
      value={{ cartCount, setCartCount, fetchCartCount, loading }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
