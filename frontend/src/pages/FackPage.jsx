import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useCart } from "../context/CartContext";

function FackPage() {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const { setCartCount } = useCart();
  const token = localStorage.getItem("token");

  const fetchCart = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:4000/cart", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const cartData = res.data.cart || res.data;
      setCart(cartData);
      setCartCount(cartData.items.length);
    } catch (err) {
      console.error("Fetch cart error:", err);
      toast.error("Failed to load cart");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const updateQty = async (productId, quantity) => {
    if (quantity < 1) return;

    try {
      const res = await axios.put(
        "http://localhost:4000/cart",
        { productId, quantity },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // ✅ Update cart from response
      const updatedCart = res.data.cart || res.data;
      setCart(updatedCart);
      setCartCount(updatedCart.items.length);
    } catch (error) {
      console.error("Update quantity error:", error);
      toast.error("Failed to update quantity");
    }
  };

  const removeItem = async (productId) => {
    try {
      const res = await axios.delete(
        `http://localhost:4000/cart/${productId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // ✅ Use the returned cart data directly
      const updatedCart = res.data.cart;
      setCart(updatedCart);
      setCartCount(updatedCart.items.length);

      toast.success("Item removed");
    } catch (error) {
      console.error("Remove error:", error);
      toast.error("Failed to remove item");
    }
  };

  const clearCart = async () => {
    try {
      const res = await axios.delete("http://localhost:4000/cart/clear", {
        headers: { Authorization: `Bearer ${token}` },
      });

      // ✅ Update from response
      const clearedCart = res.data.cart;
      setCart(clearedCart);
      setCartCount(0);
      toast.success("Cart cleared");
    } catch (error) {
      console.error("Clear cart error:", error);
      toast.error("Failed to clear cart");
    }
  };

  if (loading) return <p>Loading...</p>;
  if (!cart || cart.items.length === 0) return <p>Cart is empty</p>;

  const totalPrice = cart.items.reduce(
    (sum, item) => sum + item.quantity * (item.product?.price || item.price),
    0
  );

  return (
    <div style={{ maxWidth: 600, margin: "auto" }}>
      <h2>My Cart</h2>

      {cart.items.map((item) => (
        <div
          key={item._id}
          style={{
            border: "1px solid #ccc",
            padding: 10,
            marginBottom: 10,
          }}
        >
          <h4>{item.product?.name || item.productName}</h4>
          <p>₹{item.product?.price || item.price}</p>

          <button
            disabled={item.quantity === 1}
            onClick={() =>
              updateQty(item.product?._id || item.product, item.quantity - 1)
            }
          >
            -
          </button>

          <span style={{ margin: "0 10px" }}>{item.quantity}</span>

          <button
            onClick={() =>
              updateQty(item.product?._id || item.product, item.quantity + 1)
            }
          >
            +
          </button>

          <br />
          <br />

          <button
            style={{ color: "red" }}
            onClick={() => removeItem(item.product?._id || item.product)}
          >
            Remove
          </button>
        </div>
      ))}

      <hr />
      <h3>Total: ₹{totalPrice}</h3>

      <button
        onClick={clearCart}
        style={{
          background: "red",
          color: "white",
          padding: 10,
          border: "none",
          cursor: "pointer",
        }}
      >
        Clear Cart
      </button>
    </div>
  );
}

export default FackPage;
