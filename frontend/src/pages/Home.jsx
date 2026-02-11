import { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { Truck, Shield, Zap, Tag, ChevronRight, Package } from "lucide-react";
import ProductCard from "../components/ProductCard";
import Loader from "../components/Loader";
import { API_URL } from "../utils/constants";

function HomePage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [wishlist, setWishlist] = useState([]);
  const [addingToWishlist, setAddingToWishlist] = useState({});

  useEffect(() => {
    const token =
      localStorage.getItem("token") || localStorage.getItem("authToken");
    const config = token
      ? { headers: { Authorization: `Bearer ${token}` } }
      : {};

    axios
      .get(`${API_URL}/product/get?limit=8`, config)
      .then((res) => {
        const productList = res.data.data || res.data;
        setProducts(productList);
        setLoading(false);
      })
      .catch(() => {
        toast.error("Failed to load products");
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) fetchWishlist(token);
  }, []);

  const fetchWishlist = async (token) => {
    try {
      const res = await axios.get(`${API_URL}/wishlist`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        const ids = res.data.wishlist?.items?.map((i) => i.product) || [];
        setWishlist(ids);
      }
    } catch { }
  };

  const toggleWishlist = async (e, product) => {
    e.preventDefault();
    e.stopPropagation();

    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please login to manage wishlist");
      return;
    }

    setAddingToWishlist((p) => ({ ...p, [product._id]: true }));

    try {
      if (wishlist.includes(product._id)) {
        await axios.delete(
          `${API_URL}/wishlist/remove/${product._id}`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        setWishlist((p) => p.filter((id) => id !== product._id));
        toast.success("Removed from wishlist");
      } else {
        await axios.post(
          `${API_URL}/wishlist/add`,
          { productId: product._id },
          { headers: { Authorization: `Bearer ${token}` } },
        );
        setWishlist((p) => [...p, product._id]);
        toast.success("Added to wishlist");
      }
    } catch {
      toast.error("Failed to update wishlist");
    } finally {
      setAddingToWishlist((p) => ({ ...p, [product._id]: false }));
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen bg-white">
      {/* HERO */}
      <section className="bg-black text-white">
        <div className="max-w-6xl mx-auto px-4 py-14 md:py-20">
          <div className="max-w-2xl">
            <span className="inline-block px-3 py-1 bg-white text-black text-xs font-semibold rounded mb-4">
              NEW SEASON • 2026 COLLECTION
            </span>

            <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-4">
              Everyday Essentials,
              <br />
              Elevated.
            </h1>

            <p className="text-gray-300 mb-6">
              Thoughtfully crafted products designed for comfort, quality, and
              modern living.
            </p>

            <Link to="/products">
              <button className="inline-flex items-center gap-2 bg-white text-black px-5 py-2.5 rounded font-medium hover:bg-gray-100 transition">
                Explore Collection
                <ChevronRight className="w-4 h-4" />
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* TRUST FEATURES */}
      <section className="py-10 border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              {
                icon: Truck,
                title: "Free Shipping",
                desc: "On orders above ₹999",
              },
              {
                icon: Shield,
                title: "Secure Payments",
                desc: "100% protected checkout",
              },
              {
                icon: Zap,
                title: "Fast Delivery",
                desc: "2–4 business days",
              },
              {
                icon: Tag,
                title: "Best Value",
                desc: "Quality at the right price",
              },
            ].map((f, i) => (
              <div key={i}>
                <f.icon className="w-6 h-6 mx-auto mb-2 text-black" />
                <h3 className="font-semibold text-sm text-gray-900">
                  {f.title}
                </h3>
                <p className="text-xs text-gray-600">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRODUCTS */}
      <section className="py-14 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Featured Products
            </h2>
            <p className="text-gray-600 text-sm">
              Handpicked favorites our customers love
            </p>
          </div>

          {products.length === 0 ? (
            <div className="text-center py-20">
              <Package className="w-12 h-12 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                We’re Curating Something Special ✨
              </h3>
              <p className="text-gray-600 mb-6">
                New products are on the way. Stay tuned!
              </p>
              <button
                onClick={() => window.location.reload()}
                className="bg-black text-white px-6 py-2.5 rounded font-medium hover:bg-gray-800 transition"
              >
                Refresh Page
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {products.map((product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  wishlist={wishlist}
                  addingToWishlist={addingToWishlist}
                  toggleWishlist={toggleWishlist}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default HomePage;
