import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Search,
  Plus,
  Package,
  RefreshCw,
  X,
  TrendingUp,
  AlertCircle,
  BarChart3,
  Star,
  Edit,
  Trash2,
  Eye,
  Tag,
} from "lucide-react";
import Loader from "../../components/Loader";

const SellerProducts = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteLoading, setDeleteLoading] = useState({});

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await fetch(
        "http://localhost:4000/product/seller/product",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || "Failed to load products");
      }

      const productList = data.products || data.data || [];
      setProducts(productList);
      setFilteredProducts(productList);
    } catch (err) {
      setError(err.message || "Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this product? This action cannot be undone.",
      )
    ) {
      return;
    }

    setDeleteLoading((prev) => ({ ...prev, [id]: true }));

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:4000/product/delete/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
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
    } finally {
      setDeleteLoading((prev) => ({ ...prev, [id]: false }));
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const filtered = products.filter(
        (p) =>
          p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.category?.toLowerCase().includes(searchTerm.toLowerCase()),
      );
      setFilteredProducts(filtered);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, products]);

  const getStats = () => {
    const totalStock = products.reduce((sum, p) => {
      if (!p.variants?.length) return sum;
      return (
        sum +
        p.variants.reduce(
          (vSum, v) =>
            vSum +
            (v.sizes?.reduce((sSum, s) => sSum + (s.stock || 0), 0) || 0),
          0,
        )
      );
    }, 0);

    const inStock = products.filter((p) => {
      if (!p.variants?.length) return false;
      return p.variants.some((v) => v.sizes?.some((s) => (s.stock || 0) > 0));
    }).length;

    const outOfStock = products.filter((p) => {
      if (!p.variants?.length) return true;
      return !p.variants.some((v) => v.sizes?.some((s) => (s.stock || 0) > 0));
    }).length;

    return { totalStock, inStock, outOfStock };
  };

  const ProductCard = ({ product, onDelete, deleteLoading }) => {
    const getTotalStock = (variants) => {
      if (!variants?.length) return 0;
      return variants.reduce(
        (total, variant) =>
          total +
          (variant.sizes?.reduce((sum, size) => sum + (size.stock || 0), 0) ||
            0),
        0,
      );
    };

    const getProductImage = (variants) => {
      return (
        variants?.[0]?.images?.[0] ||
        "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80"
      );
    };

    const getPriceRange = (variants) => {
      if (!variants?.length) return "₹0";

      const allPrices = variants
        .flatMap((v) => v.sizes?.map((s) => s.price || 0) || [0])
        .filter((p) => p > 0);

      if (allPrices.length === 0) return "₹0";

      const minPrice = Math.min(...allPrices);
      const maxPrice = Math.max(...allPrices);

      return minPrice === maxPrice
        ? `₹${minPrice.toLocaleString()}`
        : `₹${minPrice.toLocaleString()} - ₹${maxPrice.toLocaleString()}`;
    };

    const stock = getTotalStock(product.variants);
    const isOutOfStock = stock === 0;
    const isLowStock = stock > 0 && stock <= 5;
    const hasMultipleColors = product.variants?.length > 1;

    return (
      <div className="group bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition duration-200">
        {/* Image Section - Full view */}
        <Link
          to={`/seller/products/${product._id}`}
          className="block relative aspect-square"
        >
          <img
            src={getProductImage(product.variants)}
            alt={product.name}
            className="w-full h-full object-cover"
          />

          {/* Stock Badge */}
          <div className="absolute top-2 left-2">
            {isOutOfStock ? (
              <span className="px-2 py-1 bg-red-500 text-white text-xs font-medium rounded">
                Out of Stock
              </span>
            ) : isLowStock ? (
              <span className="px-2 py-1 bg-amber-500 text-white text-xs font-medium rounded">
                Low Stock
              </span>
            ) : (
              <span className="px-2 py-1 bg-green-500 text-white text-xs font-medium rounded">
                In Stock
              </span>
            )}
          </div>

          {/* Color Variants Badge */}
          {hasMultipleColors && (
            <div className="absolute top-2 right-2">
              <div className="flex items-center gap-1 px-2 py-1 bg-black/80 text-white text-xs font-medium rounded backdrop-blur-sm">
                <Tag className="w-3 h-3" />
                {product.variants.length} colors
              </div>
            </div>
          )}

          {/* Hover Overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-200 flex items-center justify-center">
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <Eye className="w-6 h-6 text-white drop-shadow-lg" />
            </div>
          </div>
        </Link>

        {/* Content Section */}
        <div className="p-3">
          {/* Category & Name */}
          <div className="mb-3">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs text-gray-500 uppercase tracking-wide truncate">
                {product.category || "Uncategorized"}
              </p>
              <div className="flex items-center gap-1">
                <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                <span className="text-xs font-medium text-gray-900">
                  {product.averageRating?.toFixed(1) || "0.0"}
                </span>
              </div>
            </div>
            <Link to={`/seller/products/${product._id}`}>
              <h3 className="text-sm font-medium text-gray-900 line-clamp-2 hover:text-gray-700 transition">
                {product.name}
              </h3>
            </Link>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-2 mb-3">
            <div className="bg-gray-50 rounded px-2 py-1.5">
              <p className="text-xs text-gray-600">Stock</p>
              <p
                className={`text-sm font-bold ${
                  isOutOfStock
                    ? "text-red-600"
                    : isLowStock
                      ? "text-amber-600"
                      : "text-green-600"
                }`}
              >
                {stock}
              </p>
            </div>
            <div className="bg-gray-50 rounded px-2 py-1.5">
              <p className="text-xs text-gray-600">Price</p>
              <p className="text-sm font-bold text-gray-900">
                {getPriceRange(product.variants)}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2 border-t border-gray-100">
            <Link
              to={`/seller/products/edit/${product._id}`}
              className="flex-1 px-2 py-1.5 bg-gray-900 text-white text-xs rounded hover:bg-gray-800 transition flex items-center justify-center gap-1"
            >
              <Edit className="w-3 h-3" />
              Edit
            </Link>
            <button
              onClick={() => onDelete(product._id)}
              disabled={deleteLoading?.[product._id]}
              className="px-2 py-1.5 border border-red-300 text-red-600 text-xs rounded hover:bg-red-50 transition flex items-center justify-center gap-1 disabled:opacity-50"
            >
              {deleteLoading?.[product._id] ? (
                <div className="w-3 h-3 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Trash2 className="w-3 h-3" />
                  Delete
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (loading) return <Loader />;

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center max-w-sm bg-white rounded-lg shadow-sm p-8 border border-gray-200">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Unable to Load Products
          </h3>
          <p className="text-gray-600 text-sm mb-6">{error}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={fetchProducts}
              className="px-4 py-2.5 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-800 transition flex items-center justify-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const stats = getStats();

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Product Inventory
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Manage your products and inventory
              </p>
            </div>

            <Link
              to="/seller/products/add"
              className="px-4 py-2.5 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-800 transition flex items-center justify-center gap-1.5 w-full sm:w-auto"
            >
              <Plus className="w-4 h-4" />
              Add New Product
            </Link>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Package className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-gray-600">Total Products</p>
                <p className="text-xl font-bold text-gray-900">
                  {products.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-gray-600">Total Stock</p>
                <p className="text-xl font-bold text-gray-900">
                  {stats.totalStock}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <BarChart3 className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-xs text-gray-600">Out of Stock</p>
                <p className="text-xl font-bold text-red-600">
                  {stats.outOfStock}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search products by name, category, or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-9 py-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm"
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
          <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
            <Package className="w-14 h-14 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {searchTerm ? "No products found" : "No products yet"}
            </h3>
            <p className="text-gray-600 text-sm mb-6 max-w-sm mx-auto">
              {searchTerm
                ? "Try adjusting your search terms"
                : "Start by adding your first product"}
            </p>
            {!searchTerm && (
              <Link
                to="/seller/products/add"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-800 transition"
              >
                <Plus className="w-4 h-4" />
                Add Your First Product
              </Link>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  onDelete={handleDelete}
                  deleteLoading={deleteLoading}
                />
              ))}
            </div>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Showing {filteredProducts.length} of {products.length} products
              </p>
            </div>
          </>
        )}

        {/* Mobile Floating Button */}
        <Link
          to="/seller/products/add"
          className="fixed bottom-6 right-6 md:hidden p-3 bg-gray-900 text-white rounded-full shadow-lg hover:shadow-xl hover:bg-gray-800 transition"
        >
          <Plus className="w-6 h-6" />
        </Link>
      </div>
    </div>
  );
};

export default SellerProducts;
