import React, { useEffect, useState } from "react";
import {
  CheckCircle,
  XCircle,
  Clock,
  Grid,
  List,
  Filter,
  Search,
  Tag,
  Calendar,
  ChevronDown,
  Package,
  AlertCircle,
  Eye,
} from "lucide-react";
import axios from "axios";
import { useSocket } from "../context/SocketProvider";
import { useAuth } from "../context/AuthProvider";
import ProductDetailModal from "./ProductDetail";

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("grid");
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const socket = useSocket();
  const { token } = useAuth();

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:4000/admin/products", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts(res.data.data.products || []);
    } catch (error) {
      console.error("Failed to load products:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (!socket) return;
    socket.on("admin-dashboard-update", fetchProducts);
    return () => {
      socket.off("admin-dashboard-update", fetchProducts);
    };
  }, [socket]);

  const filteredProducts = products
    .filter((product) => {
      if (filter === "all") return true;
      if (filter === "pending") return product.status === "pending";
      if (filter === "approved") return product.status === "approved";
      if (filter === "rejected") return product.status === "rejected";
      return true;
    })
    .filter(
      (product) =>
        product.name?.toLowerCase().includes(search.toLowerCase()) ||
        product.description?.toLowerCase().includes(search.toLowerCase()),
    );

  const approveProduct = async (productId) => {
    try {
      await axios.put(
        `http://localhost:4000/admin/products/${productId}/approve`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );
      fetchProducts();
    } catch (error) {
      console.error("Approve failed:", error);
    }
  };

  const rejectProduct = async (productId) => {
    try {
      await axios.delete(
        `http://localhost:4000/admin/products/${productId}/reject`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      fetchProducts();
    } catch (error) {
      console.error("Reject failed:", error);
    }
  };

  const openProductModal = (product) => {
    setSelectedProduct(product);
    document.getElementById("product_detail_modal").showModal();
  };

  const StatusBadge = ({ status }) => {
    const config = {
      pending: {
        icon: <Clock className="w-3 h-3" />,
        bg: "bg-amber-50",
        text: "text-amber-800",
        dot: "bg-amber-500",
      },
      approved: {
        icon: <CheckCircle className="w-3 h-3" />,
        bg: "bg-emerald-50",
        text: "text-emerald-800",
        dot: "bg-emerald-500",
      },
      rejected: {
        icon: <XCircle className="w-3 h-3" />,
        bg: "bg-red-50",
        text: "text-red-800",
        dot: "bg-red-500",
      },
    };

    const { bg, text, dot } = config[status] || config.pending;

    return (
      <div
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${bg} ${text}`}
      >
        <div className={`w-1.5 h-1.5 rounded-full ${dot}`}></div>
        <span className="capitalize font-medium tracking-wide">{status}</span>
      </div>
    );
  };

  const ProductCard = ({ product }) => (
    <div
      onClick={() => openProductModal(product)}
      className="group cursor-pointer bg-white border border-gray-100 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 hover:border-gray-200 active:scale-[0.99]"
    >
      {/* Image Container */}
      <div className="relative aspect-square bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
        <img
          src={
            product.variants?.[0]?.images?.[0] ||
            "https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=800&h=800&fit=crop&q=80"
          }
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Status Badge Overlay */}
        <div className="absolute top-3 left-3">
          <StatusBadge status={product.status} />
        </div>

        {/* View Indicator */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300 flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center gap-2 text-xs font-medium">
            <Eye className="w-3 h-3" />
            View Details
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-3">
        <h3 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-1 tracking-tight">
          {product.name}
        </h3>
        <p className="text-xs text-gray-600 line-clamp-2 mb-3 leading-relaxed tracking-wide">
          {product.description || "No description provided"}
        </p>

        {/* Meta Information */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <Tag className="w-3 h-3" />
              <span className="font-medium text-gray-700">
                {product.category || "Uncategorized"}
              </span>
            </div>
            <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span>
                {new Date(product.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </div>
          </div>

          {product.variants?.[0]?.sizes?.[0]?.price && (
            <span className="font-bold text-gray-900 text-sm bg-gray-100 px-2 py-1 rounded">
              ₹{product.variants[0].sizes[0].price.toLocaleString()}
            </span>
          )}
        </div>

        {/* Quick Actions - Only for pending */}
        {product.status === "pending" && (
          <div
            className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-2"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                approveProduct(product._id);
              }}
              className="flex-1 py-2 text-xs font-medium bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
            >
              Approve
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                rejectProduct(product._id);
              }}
              className="flex-1 py-2 text-xs font-medium bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              Reject
            </button>
          </div>
        )}
      </div>
    </div>
  );

  const ProductRow = ({ product }) => (
    <tr
      onClick={() => openProductModal(product)}
      className="border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer group"
    >
      <td className="py-3 px-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
            <img
              src={product.variants?.[0]?.images?.[0]}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <p className="font-medium text-sm text-gray-900 mb-0.5 tracking-tight">
              {product.name}
            </p>
            <p className="text-xs text-gray-600 line-clamp-1 max-w-xs">
              {product.description || "No description"}
            </p>
          </div>
        </div>
      </td>
      <td className="py-3 px-4">
        <div className="flex items-center gap-1.5 text-xs">
          <Tag className="w-3.5 h-3.5 text-gray-500" />
          <span className="font-medium text-gray-700">
            {product.category || "Uncategorized"}
          </span>
        </div>
      </td>
      <td className="py-3 px-4">
        <StatusBadge status={product.status} />
      </td>
      <td className="py-3 px-4 text-xs text-gray-600">
        {new Date(product.createdAt).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        })}
      </td>
      <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
        {product.status === "pending" && (
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => approveProduct(product._id)}
              className="px-2.5 py-1.5 text-xs font-medium bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
            >
              Approve
            </button>
            <button
              onClick={() => rejectProduct(product._id)}
              className="px-2.5 py-1.5 text-xs font-medium bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              Reject
            </button>
          </div>
        )}
      </td>
    </tr>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="w-12 h-12 border-3 border-gray-200 rounded-full"></div>
            <div className="w-12 h-12 border-3 border-black border-t-transparent rounded-full animate-spin absolute inset-0"></div>
          </div>
          <p className="text-sm text-gray-500 font-medium tracking-wide">
            Loading products...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-[1920px] mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-1 tracking-tight">
              Products
            </h1>
            <p className="text-xs md:text-sm text-gray-600 tracking-wide">
              Manage and review product submissions
            </p>
          </div>
          <div className="text-xs text-gray-500 bg-gray-100 px-3 py-1.5 rounded-full">
            {products.length} total
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-colors bg-white"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="appearance-none pl-3 pr-8 py-2.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:border-black w-36"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
            </div>

            <div className="flex border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
              <button
                onClick={() => setViewMode("grid")}
                className={`px-3 py-2 transition-colors ${viewMode === "grid" ? "bg-white text-black" : "text-gray-500 hover:text-gray-700"}`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`px-3 py-2 transition-colors ${viewMode === "list" ? "bg-white text-black" : "text-gray-500 hover:text-gray-700"}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="mb-4 flex items-center gap-2 text-xs">
        <span className="font-medium text-gray-900">
          {filteredProducts.length}
        </span>
        <span className="text-gray-600">
          {filteredProducts.length === 1 ? "product" : "products"} found
        </span>
      </div>

      {/* Grid View */}
      {viewMode === "grid" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3">
          {filteredProducts.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}

      {/* List View */}
      {viewMode === "list" && (
        <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-0">
                  <div className="pl-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Product
                  </div>
                </th>
                <th className="text-left p-0">
                  <div className="py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Category
                  </div>
                </th>
                <th className="text-left p-0">
                  <div className="py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Status
                  </div>
                </th>
                <th className="text-left p-0">
                  <div className="py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Date
                  </div>
                </th>
                <th className="text-left p-0">
                  <div className="pr-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => (
                <ProductRow key={product._id} product={product} />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Empty State */}
      {filteredProducts.length === 0 && (
        <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50/50">
          <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gray-100 flex items-center justify-center">
            <AlertCircle className="w-6 h-6 text-gray-400" />
          </div>
          <p className="text-gray-600 font-medium text-sm mb-1">
            No products found
          </p>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            {search || filter !== "all"
              ? "Try adjusting your search or filter"
              : "No products submitted yet"}
          </p>
        </div>
      )}

      {/* Product Detail Modal */}
      <ProductDetailModal product={selectedProduct} />
    </div>
  );
};

export default AdminProducts;
