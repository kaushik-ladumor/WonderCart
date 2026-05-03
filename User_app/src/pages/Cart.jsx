import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertCircle,
  Info,
  Lock,
  Minus,
  Plus,
  ShoppingBag,
  Share2,
  Tag,
  Trash2,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthProvider";
import { handleTokenExpiration, isTokenExpired } from "../utils/auth";
import { useCart } from "../context/CartContext";
import { useSocket } from "../context/SocketProvider";
import Loader from "../components/Loader";
import { API_URL } from "../utils/constants";

const getItemImage = (item) =>
  item?.product?.productImg?.[0] ||
  item?.productImg ||
  item?.product?.image ||
  item?.product?.images?.[0] ||
  item?.product?.variants?.find((variant) => variant?.images?.[0])?.images?.[0] ||
  "";

const formatColorName = (color) =>
  color ? color.charAt(0).toUpperCase() + color.slice(1) : "";

const Cart = () => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingItems, setUpdatingItems] = useState({});
  const [stockNotice, setStockNotice] = useState(null);
  const navigate = useNavigate();
  const [sharing, setSharing] = useState(false);
  const { setAuthUser } = useAuth();
  const { setCartCount } = useCart();
  const socket = useSocket();

  const handleShareCart = async () => {
    if (!token) return;
    setSharing(true);
    try {
      const res = await fetch(`${API_URL}/cart/share`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        await navigator.clipboard.writeText(data.data.shareLink);
        toast.success("Share link copied to clipboard!");
      } else {
        toast.error(data.message || "Failed to share cart");
      }
    } catch (err) {
      toast.error("Failed to generate share link");
    } finally {
      setSharing(false);
    }
  };

  const token = localStorage.getItem("token");

  const fetchCart = async () => {
    if (!token) {
      setError("Please login first");
      setLoading(false);
      document.getElementById("login_modal")?.showModal();
      return;
    }

    try {
      const res = await fetch(`${API_URL}/cart`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        if (
          res.status === 401 ||
          isTokenExpired({ response: { status: res.status, data: errorData } })
        ) {
          toast.error("Session expired. Please login again.");
          handleTokenExpiration(navigate, setAuthUser);
          return;
        }
        throw new Error(errorData.message || "Failed to fetch cart");
      }

      const data = await res.json();
      const cartData = data.cart || data;
      setCart(cartData);
      setCartCount(cartData?.items?.length || 0);

      if (data.stockChanges) {
        const { removed, adjusted } = data.stockChanges;
        if (removed?.length > 0) {
          setStockNotice({
            type: "removed",
            message: `${removed.length} item${removed.length > 1 ? "s" : ""} removed (out of stock)`,
          });
        } else if (adjusted?.length > 0) {
          setStockNotice({
            type: "adjusted",
            message: `${adjusted.length} item${adjusted.length > 1 ? "s" : ""} had quantity adjusted`,
          });
        }
      }

      setLoading(false);
    } catch (err) {
      console.error(err);
      if (isTokenExpired(err)) {
        toast.error("Session expired. Please login again.");
        handleTokenExpiration(navigate, setAuthUser);
        return;
      }
    }
  };

  useEffect(() => {
    if (!socket || !token) return;

    const handleStockLow = (data) => {
      console.log("⚠️ Stock low alert:", data);
      toast(data.message, { icon: "⚠️", duration: 5000 });
      fetchCart();
    };

    const handleItemReserved = (data) => {
      console.log("🔒 Item reserved:", data);
      toast.success(`${data.productName} is reserved for you for ${data.expiresIn}!`, { icon: "🔒" });
    };

    const handleCartUpdate = (data) => {
      console.log("🛒 Cart update received:", data);
      fetchCart();
    };

    socket.on("stock-low", handleStockLow);
    socket.on("item-reserved", handleItemReserved);
    socket.on("cart-update", handleCartUpdate);

    return () => {
      socket.off("stock-low", handleStockLow);
      socket.off("item-reserved", handleItemReserved);
      socket.off("cart-update", handleCartUpdate);
    };
  }, [socket, token]);

  useEffect(() => {
    fetchCart();
  }, [token]);

  const updateQuantity = async (productId, color, size, newQuantity) => {
    if (newQuantity < 1) return;
    const updateKey = `${productId}-${color}-${size}`;
    setUpdatingItems((prev) => ({ ...prev, [updateKey]: true }));

    try {
      const res = await fetch(`${API_URL}/cart`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productId, color, size, quantity: newQuantity }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        if (
          res.status === 401 ||
          isTokenExpired({ response: { status: res.status, data: errorData } })
        ) {
          toast.error("Session expired. Please login again.");
          handleTokenExpiration(navigate, setAuthUser);
          return;
        }
        throw new Error(errorData.message || "Failed to update quantity");
      }

      await fetchCart();
      toast.success("Quantity updated");
    } catch (err) {
      console.error(err);
      if (isTokenExpired(err)) {
        toast.error("Session expired. Please login again.");
        handleTokenExpiration(navigate, setAuthUser);
        return;
      }
      toast.error(err.message || "Failed to update quantity");
    } finally {
      setUpdatingItems((prev) => {
        const next = { ...prev };
        delete next[updateKey];
        return next;
      });
    }
  };

  const removeItem = async (productId, color, size) => {
    if (!productId || !color || !size) {
      toast.error("Cannot remove item: Missing information");
      return;
    }

    const updateKey = `${productId}-${color}-${size}`;
    setUpdatingItems((prev) => ({ ...prev, [updateKey]: true }));

    try {
      const res = await fetch(`${API_URL}/cart/${productId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ color, size }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        if (
          res.status === 401 ||
          isTokenExpired({ response: { status: res.status, data: errorData } })
        ) {
          toast.error("Session expired. Please login again.");
          handleTokenExpiration(navigate, setAuthUser);
          return;
        }
        throw new Error(errorData.message || "Failed to remove item");
      }

      await fetchCart();
      toast.success("Item removed from cart");
    } catch (err) {
      console.error(err);
      if (isTokenExpired(err)) {
        toast.error("Session expired. Please login again.");
        handleTokenExpiration(navigate, setAuthUser);
        return;
      }
      toast.error(err.message || "Failed to remove item");
    } finally {
      setUpdatingItems((prev) => {
        const next = { ...prev };
        delete next[updateKey];
        return next;
      });
    }
  };

  const proceedToCheckout = () => {
    if (!cart?.items || cart.items.length === 0) {
      toast.error("Your cart is empty");
      return;
    }
    sessionStorage.removeItem("directOrder");
    sessionStorage.removeItem("directOrderTotal");
    navigate("/checkout");
  };

  useEffect(() => {
    fetchCart();
  }, []);

  useEffect(() => {
    if (!socket) return undefined;
    const handleCartUpdate = () => fetchCart();
    socket.on("cart-update", handleCartUpdate);
    return () => socket.off("cart-update", handleCartUpdate);
  }, [socket]);

  const getItemPrice = (item) => Math.round(item.sellingPrice || item.price || 0);
  const getItemOriginalPrice = (item) => Math.round(item.originalPrice || 0);

  const validItems = useMemo(
    () => cart?.items?.filter((item) => !item.isOutOfStock) || [],
    [cart],
  );

  const subtotal = validItems.reduce(
    (sum, item) => sum + getItemPrice(item) * item.quantity,
    0,
  );
  const tax = 0; // Taxes are already included in product prices
  const shipping = subtotal > 0 ? (subtotal >= 999 ? 0 : 50) : 0;
  const total = subtotal + tax + shipping;
  const points = Math.round(total * 0.01);
  const totalSavings = validItems.reduce((sum, item) => {
    const original = getItemOriginalPrice(item);
    const selling = getItemPrice(item);
    if (original > selling) return sum + (original - selling) * item.quantity;
    return sum;
  }, 0);

  if (loading) return <Loader />;

  if (error && !cart) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f6f7fb] px-4">
        <div className="max-w-sm rounded-[18px] border border-[#e1e5f1] bg-white p-6 text-center">
          <AlertCircle className="mx-auto h-10 w-10 text-[#d12828]" />
          <h3 className="mt-3 text-[0.88rem] font-semibold text-[#11182d]">{error}</h3>
          <div className="mt-4 flex justify-center gap-2">
            <button
              onClick={fetchCart}
              className="rounded-xl bg-[#11182d] px-3 py-2 text-[0.8rem] font-medium text-white"
            >
              Retry
            </button>
            <button
              onClick={() => navigate("/")}
              className="rounded-xl border border-[#d7dcea] px-3 py-2 text-[0.8rem] font-medium text-[#11182d]"
            >
              Go Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!cart?.items || cart.items.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f6f7fb] px-4 py-8">
        <div className="max-w-xl text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[22px] border border-[#e1e5f1] bg-white">
            <ShoppingBag className="h-8 w-8 text-[#90a0be]" />
          </div>
          <h2 className="mt-4 text-[1.45rem] font-semibold tracking-tight text-[#11182d]">
            Your Bag is Empty
          </h2>
          <p className="mx-auto mt-2 max-w-md text-[0.86rem] leading-6 text-[#42506d]">
            There is nothing in your WonderCart bag right now. Explore the shop
            and add a few pieces you love.
          </p>
          <button
            onClick={() => navigate("/shop")}
            className="mt-4 rounded-[14px] bg-[#0f49d7] px-4 py-2 text-[0.8rem] font-medium text-white"
          >
            Explore Shop
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f6f7fb] py-3 text-[#11182d]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-4">
          <h1 className="text-[1.5rem] font-semibold tracking-tight sm:text-[1.75rem]">
            Shopping Cart ({cart.items.length} items)
          </h1>
          <p className="mt-1 text-[0.82rem] text-[#42506d]">
            Manage your curated selection before checkout.
          </p>
        </div>

        {stockNotice && (
          <div
            className={`mb-4 flex items-center justify-between rounded-[14px] border px-4 py-3 ${stockNotice.type === "removed"
                ? "border-[#f0c6c6] bg-[#fff5f5]"
                : "border-[#f1ddb0] bg-[#fffaf0]"
              }`}
          >
            <div className="flex items-center gap-2.5">
              <Info
                className={`h-4.5 w-4.5 ${stockNotice.type === "removed"
                    ? "text-[#d12828]"
                    : "text-[#ba7a00]"
                  }`}
              />
              <p className="text-[0.76rem] font-medium text-[#33415e]">
                {stockNotice.message}
              </p>
            </div>
            <button onClick={() => setStockNotice(null)} aria-label="Close notice">
              <X className="h-4.5 w-4.5 text-[#7f8aa3]" />
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
          <div className="space-y-3">
            {cart.items.map((item) => {
              const product = item.product;
              const productName = product?.name || item.productName || "Product";
              const productId = product?._id || item.productId || item.product;
              const productImg = getItemImage(item);
              const updateKey = `${productId}-${item.color}-${item.size}`;
              const isUpdating = Boolean(updatingItems[updateKey]);

              return (
                <div
                  key={item._id || updateKey}
                  className={`rounded-[18px] border border-[#e1e5f1] bg-white p-3.5 ${isUpdating ? "opacity-60" : ""
                    }`}
                >
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-[118px_minmax(0,1fr)]">
                    <div className="flex h-24 items-center justify-center overflow-hidden rounded-[14px] bg-[#eef2f7]">
                      {productImg ? (
                        <img
                          src={productImg}
                          alt={productName}
                          className="h-full w-full object-contain p-2 mix-blend-multiply"
                        />
                      ) : (
                        <ShoppingBag className="h-8 w-8 text-[#8fa0be]" />
                      )}
                    </div>

                    <div className="flex min-h-full flex-col justify-between">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <h3 className="text-[0.82rem] font-semibold text-[#11182d]">
                            {productName}
                          </h3>
                          <p className="mt-1 text-[0.74rem] text-[#6d7892]">
                            {item.size ? `Size: ${item.size}` : "Variant"}{" "}
                            {item.color
                              ? `• Color: ${formatColorName(item.color)}`
                              : ""}
                          </p>
                        </div>

                        <div className="text-left sm:text-right">
                          <p className="text-[0.78rem] font-semibold text-[#11182d]">
                            Rs {getItemPrice(item).toLocaleString("en-IN")}
                          </p>
                          {getItemOriginalPrice(item) > getItemPrice(item) && (
                            <p className="mt-0.5 text-[0.74rem] text-[#7f8aa3] line-through font-medium">
                              Rs{" "}
                              {getItemOriginalPrice(item).toLocaleString("en-IN")}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                        <div className="flex h-9 w-fit items-center rounded-full bg-[#eef2ff] px-2">
                          <button
                            onClick={() =>
                              updateQuantity(
                                productId,
                                item.color,
                                item.size,
                                item.quantity - 1,
                              )
                            }
                            disabled={item.quantity <= 1 || isUpdating}
                            className="flex h-6 w-6 items-center justify-center rounded-full text-[#11182d] disabled:opacity-30"
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className="min-w-[34px] text-center text-[0.74rem] font-semibold text-[#11182d]">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(
                                productId,
                                item.color,
                                item.size,
                                item.quantity + 1,
                              )
                            }
                            disabled={isUpdating}
                            className="flex h-6 w-6 items-center justify-center rounded-full text-[#11182d] disabled:opacity-30"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>

                        <button
                          onClick={() =>
                            removeItem(productId, item.color, item.size)
                          }
                          className="flex items-center gap-2 text-[0.76rem] font-semibold uppercase tracking-[0.12em] text-[#d12828]"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <aside className="space-y-3 xl:sticky xl:top-24">
            <div className="rounded-[18px] border border-[#e1e5f1] bg-white p-4">
              <h2 className="text-[1.05rem] font-semibold text-[#11182d]">
                Order Summary
              </h2>

              <div className="mt-4 space-y-3 text-[0.76rem]">
                <div className="flex items-center justify-between">
                  <span className="text-[#42506d]">Subtotal</span>
                  <span className="font-medium text-[#11182d]">
                    Rs {subtotal.toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#42506d]">Shipping</span>
                  <span className={shipping === 0 ? "font-medium text-[#15753a]" : "font-medium text-[#11182d]"}>
                    {shipping === 0
                      ? "FREE"
                      : `Rs ${shipping.toLocaleString("en-IN")}`}
                  </span>
                </div>

                {totalSavings > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-[#42506d]">Savings</span>
                    <span className="font-medium text-[#15753a]">
                      Rs {totalSavings.toLocaleString("en-IN")}
                    </span>
                  </div>
                )}
              </div>

              <div className="mt-4 border-t border-[#edf1f8] pt-4">
                 <div className="flex items-center justify-between">
                  <span className="text-[0.9rem] font-semibold text-[#11182d]">
                    Total Amount
                  </span>
                  <span className="text-[1.2rem] font-semibold text-[#0f49d7]">
                    Rs {total.toLocaleString("en-IN")}
                  </span>
                </div>

                 <button
                  onClick={proceedToCheckout}
                  className="mt-4 h-11 w-full rounded-[14px] bg-[#0f49d7] text-[0.78rem] font-semibold text-white uppercase tracking-widest"
                >
                  Proceed to Checkout
                </button>

                <button
                  onClick={handleShareCart}
                  disabled={sharing}
                  className="mt-2 flex h-11 w-full items-center justify-center gap-2 rounded-[14px] border border-[#d7dcea] bg-white text-[0.78rem] font-semibold text-[#11182d] uppercase tracking-widest transition-all hover:bg-[#f6f7fb]"
                >
                  <Share2 className="h-3.5 w-3.5" />
                  {sharing ? "Generatings..." : "Share Cart with Friends"}
                </button>

                <div className="mt-3 flex items-center justify-center gap-2 text-[9px] uppercase tracking-[0.14em] text-[#5d6a84]">
                  <Lock className="h-3.5 w-3.5" />
                  <span>100% secure checkout</span>
                </div>
              </div>
            </div>

            <div className="rounded-[18px] border border-[#dfe5f3] bg-[#e8edff] p-3.5">
              <div className="flex items-start gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-[12px] bg-white text-[#0f49d7]">
                  <Tag className="h-4.5 w-4.5" />
                </span>
                <div>
                  <h3 className="text-[0.82rem] font-semibold text-[#11182d]">
                    Member Exclusive
                  </h3>
                  <p className="mt-1 text-[0.72rem] text-[#42506d]">
                    Earn {points} WonderCart points on this purchase.
                  </p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default Cart;
