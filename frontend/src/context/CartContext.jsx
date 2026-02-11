import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useAuth } from "./AuthProvider";
import { isTokenExpired, handleTokenExpiration } from "../utils/auth";
import socket from "../socket";
import { API_URL } from "../utils/constants";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartCount, setCartCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const { setAuthUser } = useAuth();

  // ✅ Fetch cart count on initial load
  const fetchCartCount = useCallback(async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setCartCount(0);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_URL}/cart`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));

        if (
          res.status === 401 ||
          isTokenExpired({ response: { status: res.status, data: errorData } })
        ) {
          handleTokenExpiration(null, setAuthUser);
          setCartCount(0);
          setLoading(false);
          return;
        }

        throw new Error("Failed to fetch cart count");
      }

      const data = await res.json();
      const cartData = data.cart || data;

      setCartCount(cartData?.items?.length || 0);
    } catch (err) {
      console.error("Failed to fetch cart count:", err);

      if (isTokenExpired(err)) {
        handleTokenExpiration(null, setAuthUser);
      }

      setCartCount(0);
    } finally {
      setLoading(false);
    }
  }, [setAuthUser]);

  // ✅ Alias for refreshCart
  const refreshCart = fetchCartCount;

  // ✅ Fetch cart count when component mounts
  useEffect(() => {
    fetchCartCount();
  }, [fetchCartCount]);

  // ✅ Listen for real-time cart updates via socket
  useEffect(() => {
    const handleCartUpdate = (data) => {
      console.log("🛒 Real-time cart update:", data.type);
      setCartCount(data.itemCount ?? 0);
    };

    socket.on("cart-update", handleCartUpdate);

    return () => {
      socket.off("cart-update", handleCartUpdate);
    };
  }, []);

  return (
    <CartContext.Provider
      value={{ cartCount, setCartCount, fetchCartCount, refreshCart, loading }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
