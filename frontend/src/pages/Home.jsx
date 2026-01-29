import { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { Truck, Shield, Zap, Tag, ChevronRight, Package } from "lucide-react";
import ProductCard from "../components/ProductCard";
import Loader from "../components/Loader";

function HomePage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [wishlist, setWishlist] = useState([]);
  const [addingToWishlist, setAddingToWishlist] = useState({});

  // Fetch products
  useEffect(() => {
    const token =
      localStorage.getItem("token") || localStorage.getItem("authToken");
    const config = token
      ? { headers: { Authorization: `Bearer ${token}` } }
      : {};

    axios
      .get("http://localhost:4000/product/get", config)
      .then((res) => {
        const productList = res.data.data || res.data;
        setProducts(productList);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        toast.error("Failed to load products");
        setLoading(false);
      });
  }, []);

  // Fetch wishlist if logged in
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetchWishlist(token);
    }
  }, []);

  const fetchWishlist = async (token) => {
    try {
      const res = await axios.get("http://localhost:4000/wishlist", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        const ids = res.data.wishlist?.items?.map((item) => item.product) || [];
        setWishlist(ids);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const toggleWishlist = async (e, product) => {
    e.preventDefault();
    e.stopPropagation();

    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please login to manage wishlist");
      return;
    }

    setAddingToWishlist((prev) => ({ ...prev, [product._id]: true }));

    try {
      if (wishlist.includes(product._id)) {
        await axios.delete(
          `http://localhost:4000/wishlist/remove/${product._id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setWishlist((prev) => prev.filter((id) => id !== product._id));
        toast.success("Removed from wishlist");
      } else {
        await axios.post(
          "http://localhost:4000/wishlist/add",
          { productId: product._id },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setWishlist((prev) => [...prev, product._id]);
        toast.success("Added to wishlist!");
      }
    } catch (err) {
      toast.error("Failed to update wishlist");
    } finally {
      setAddingToWishlist((prev) => ({ ...prev, [product._id]: false }));
    }
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-black text-white">
        <div className="max-w-6xl mx-auto px-4 py-12 md:py-16">
          <div className="max-w-2xl">
            <span className="inline-block px-3 py-1 bg-white text-black text-xs font-semibold rounded mb-4">
              WINTER SALE 2026
            </span>

            <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-4">
              Up to 60% Off
            </h1>

            <p className="text-base text-gray-300 mb-6">
              Timeless styles. Unbeatable prices. Limited time only.
            </p>

            <div>
              <Link to="/products">
                <button className="inline-flex items-center gap-2 bg-white text-black px-4 py-2.5 rounded font-medium hover:bg-gray-100 transition">
                  Shop Collection
                  <ChevronRight className="w-4 h-4" />
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-8 border-y border-gray-100">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: Truck, title: "Free Shipping", desc: "Orders over ₹999" },
              { icon: Shield, title: "Secure", desc: "Payment" },
              { icon: Zap, title: "Fast Delivery", desc: "2-4 Days" },
              { icon: Tag, title: "Best Prices", desc: "Guaranteed" },
            ].map((feature, i) => (
              <div key={i} className="text-center">
                <div className="bg-white p-4">
                  <feature.icon className="w-6 h-6 mx-auto mb-2 text-black" />
                  <h3 className="font-semibold text-sm text-gray-900">
                    {feature.title}
                  </h3>
                  <p className="text-xs text-gray-600">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-12">
        <div className="max-w-6xl mx-auto px-4">
          {products.length === 0 ? (
            <div className="text-center py-16">
              <Package className="w-12 h-12 mx-auto text-gray-300 mb-4" />
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                No Products Available
              </h2>
              <p className="text-gray-600 text-sm mb-6">
                Check back soon for new arrivals!
              </p>
              <button
                onClick={() => window.location.reload()}
                className="px-5 py-2.5 bg-black text-white rounded font-medium hover:bg-gray-800 transition"
              >
                Refresh Page
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
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
