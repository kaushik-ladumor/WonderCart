import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, Plus, Package, RefreshCw, X, ChevronLeft } from "lucide-react";
import ProductCard from "./ProductCard";

const SellerProducts = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        "http://localhost:4000/product/seller/product",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || "Failed to load products");
      }

      const productList = data.products || [];
      setProducts(productList);
      setFilteredProducts(productList);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?"))
      return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:4000/product/delete/${id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || "Delete failed");
      }

      const updated = products.filter((p) => p._id !== id);
      setProducts(updated);
      setFilteredProducts(updated);
    } catch (err) {
      alert("Delete failed: " + err.message);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const filtered = products.filter(
        (p) =>
          p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.category?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredProducts(filtered);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, products]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-3 border-gray-300 border-t-black rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-gray-600 text-sm">Loading products...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Unable to Load Products
          </h3>
          <p className="text-gray-600 text-sm mb-6">{error}</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={fetchProducts}
              className="px-4 py-2 bg-black text-white rounded font-medium hover:bg-gray-800 transition text-sm flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Try Again
            </button>
            <button
              onClick={() => navigate("/seller/dashboard")}
              className="px-4 py-2 bg-gray-100 text-gray-800 rounded font-medium hover:bg-gray-200 transition text-sm"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate("/seller/dashboard")}
            className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-black mb-4"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Dashboard
          </button>

          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                Product Inventory
              </h1>
              <p className="text-gray-600 text-sm mt-1">
                {products.length} product{products.length !== 1 ? "s" : ""}
              </p>
            </div>

            <Link
              to="/seller/products/add"
              className="px-4 py-2 bg-black text-white rounded font-medium hover:bg-gray-800 transition flex items-center gap-1.5 text-sm"
            >
              <Plus className="w-4 h-4" />
              Add Product
            </Link>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-9 py-2.5 bg-white border border-gray-300 rounded focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition text-sm"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded transition"
              >
                <X className="w-3.5 h-3.5 text-gray-500" />
              </button>
            )}
          </div>
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-14 h-14 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {searchTerm ? "No products found" : "Your inventory is empty"}
            </h3>
            <p className="text-gray-600 text-sm mb-6">
              {searchTerm
                ? "Try a different search term"
                : "Start by adding your first product"}
            </p>
            {!searchTerm && (
              <Link
                to="/seller/products/add"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-black text-white rounded font-medium hover:bg-gray-800 transition text-sm"
              >
                <Plus className="w-4 h-4" />
                Add Your First Product
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}

        {/* Mobile Floating Button */}
        <div className="fixed bottom-6 right-6 md:hidden">
          <Link
            to="/seller/products/add"
            className="p-3 bg-black text-white rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition"
          >
            <Plus className="w-6 h-6" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SellerProducts;
