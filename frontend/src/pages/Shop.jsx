import { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import {
  Package,
  Search,
} from "lucide-react";
import ProductCard from "../components/ProductCard";
import Loader from "../components/Loader";

function Shop() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [wishlist, setWishlist] = useState([]);
  const [addingToWishlist, setAddingToWishlist] = useState({});
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch all products on initial load
  useEffect(() => {
    fetchAllProducts();
  }, []);

  // Fetch wishlist if logged in
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetchWishlist(token);
    }
  }, []);

  // Debounced search API call
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery.trim().length > 0) {
        performSearch(searchQuery);
      } else if (searchQuery.trim() === "") {
        // If search is cleared, show all products
        fetchAllProducts();
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const fetchAllProducts = () => {
    setLoading(true);
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
  };

  const performSearch = async (query) => {
    if (!query.trim()) return;

    setSearchLoading(true);
    const token =
      localStorage.getItem("token") || localStorage.getItem("authToken");
    const config = token
      ? { headers: { Authorization: `Bearer ${token}` } }
      : {};

    try {
      const encodedQuery = encodeURIComponent(query);
      const res = await axios.get(
        `http://localhost:4000/product/query/search?query=${encodedQuery}`,
        config,
      );

      if (res.data.success) {
        const searchResults = res.data.data || res.data.products || [];
        setProducts(searchResults);
      } else {
        setProducts([]);
      }
    } catch (error) {
      console.error("Search error:", error);
      toast.error("Failed to search products");
      setProducts([]);
    } finally {
      setSearchLoading(false);
    }
  };

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
          },
        );
        setWishlist((prev) => prev.filter((id) => id !== product._id));
        toast.success("Removed from wishlist");
      } else {
        await axios.post(
          "http://localhost:4000/wishlist/add",
          { productId: product._id },
          { headers: { Authorization: `Bearer ${token}` } },
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

  const handleClearSearch = () => {
    setSearchQuery("");
    fetchAllProducts();
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="min-h-screen bg-white text-black">
      {/* Search Bar */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 " />
            <input
              type="search"
              placeholder="Search products by name, category"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black text-sm text-black"
            />
            {searchLoading && (
              <div className="absolute right-10 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
              </div>
            )}
            {searchQuery && !searchLoading && (
              <button
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <section className="py-12">
        <div className="max-w-6xl mx-auto px-4">
          {searchQuery && products.length === 0 ? (
            <div className="text-center py-16">
              <Package className="w-12 h-12 mx-auto text-gray-300 mb-4" />
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                No Products Found
              </h2>
              <button
                onClick={handleClearSearch}
                className="px-5 py-2.5 bg-black text-white rounded font-medium hover:bg-gray-800 transition"
              >
                View All Products
              </button>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-16">
              <Package className="w-12 h-12 mx-auto text-gray-300 mb-4" />
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                No Products Available
              </h2>
              <p className="text-gray-600 text-sm mb-6">
                Check back soon for new arrivals!
              </p>
              <button
                onClick={fetchAllProducts}
                className="px-5 py-2.5 bg-black text-white rounded font-medium hover:bg-gray-800 transition"
              >
                Refresh Products
              </button>
            </div>
          ) : (
            <>
              {searchQuery && (
                <div className="mb-6">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Search Results ({products.length} product
                    {products.length !== 1 ? "s" : ""})
                  </h2>
                </div>
              )}
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
            </>
          )}
        </div>
      </section>
    </div>
  );
}

export default Shop;
