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
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import axios from "axios";
import { useSocket } from "../context/SocketProvider";
import { useAuth } from "../context/AuthProvider";
import ProductDetailModal from "./ProductDetail";
import { API_URL } from "../utils/constants";

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("grid");
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const socket = useSocket();
  const { token } = useAuth();

  const fetchProducts = async (pageNum = 1, append = false) => {
    try {
      if (pageNum === 1) setLoading(true);
      else setLoadingMore(true);

      const res = await axios.get(
        `${API_URL}/admin/products?page=${pageNum}&limit=8`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      const productList = res.data.data.products || [];
      const pagination = res.data.data.pagination;

      if (append) {
        setProducts((prev) => [...prev, ...productList]);
      } else {
        setProducts(productList);
      }

      if (pagination) {
        setHasMore(pagination.page < pagination.pages);
      } else {
        setHasMore(productList.length === 8);
      }
    } catch (error) {
      console.error("Failed to load products:", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchProducts(nextPage, true);
  };

  useEffect(() => {
    if (token) {
      fetchProducts();
    }
  }, [token]);

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
        `${API_URL}/admin/products/${productId}/approve`,
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
      await axios.delete(`${API_URL}/admin/products/${productId}/reject`, {
        headers: { Authorization: `Bearer ${token}` },
      });
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
        bg: "bg-gray-100",
        text: "text-gray-900",
        dot: "bg-gray-500",
      },
      approved: {
        icon: <CheckCircle className="w-3 h-3" />,
        bg: "bg-gray-900",
        text: "text-white",
        dot: "bg-white",
      },
      rejected: {
        icon: <XCircle className="w-3 h-3" />,
        bg: "bg-gray-200",
        text: "text-gray-900",
        dot: "bg-gray-600",
      },
    };

    const { bg, text, dot } = config[status] || config.pending;

    return (
      <div
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-medium uppercase tracking-wider ${bg} ${text}`}
      >
        <div className={`w-1.5 h-1.5 rounded-full ${dot}`}></div>
        <span>{status}</span>
      </div>
    );
  };

  const ProductCard = ({ product }) => (
    <div
      onClick={() => openProductModal(product)}
      className="group cursor-pointer bg-white border border-gray-200 hover:border-black transition-all duration-200"
    >
      <div className="relative aspect-square bg-gray-50 border-b border-gray-200 overflow-hidden">
        <img
          src={product.variants?.[0]?.images?.[0] || "/placeholder.png"}
          alt={product.name}
          className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-2 left-2">
          <StatusBadge status={product.status} />
        </div>
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
          <div className="bg-white border border-gray-200 px-3 py-1.5 text-[10px] font-medium uppercase tracking-wider flex items-center gap-1 shadow-sm">
            <Eye className="w-3 h-3" />
            View
          </div>
        </div>
      </div>
      <div className="p-3 space-y-2">
        <div>
          <h3 className="text-xs font-medium text-gray-900 line-clamp-1 tracking-tight">
            {product.name}
          </h3>
          <p className="text-[10px] text-gray-500 uppercase tracking-wider mt-0.5 flex items-center gap-1">
            <Tag className="w-3 h-3" />
            {product.category || "General"}
          </p>
        </div>
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <div>
            <span className="text-[9px] text-gray-500 uppercase tracking-wider">
              Price
            </span>
            <p className="text-xs font-medium text-gray-900">
              ₹
              {product.variants?.[0]?.sizes?.[0]?.sellingPrice?.toLocaleString() ||
                "0"}
            </p>
          </div>
          {product.status === "pending" && (
            <div
              className="flex items-center gap-1"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  approveProduct(product._id);
                }}
                className="w-7 h-7 flex items-center justify-center bg-gray-900 text-white text-[10px] font-medium uppercase tracking-wider hover:bg-gray-800 transition-colors"
                title="Approve"
              >
                ✓
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  rejectProduct(product._id);
                }}
                className="w-7 h-7 flex items-center justify-center bg-gray-200 text-gray-900 text-[10px] font-medium uppercase tracking-wider hover:bg-gray-300 transition-colors"
                title="Reject"
              >
                ✗
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const ProductRow = ({ product }) => (
    <tr
      onClick={() => openProductModal(product)}
      className="border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer"
    >
      <td className="py-2.5 px-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gray-100 border border-gray-200 overflow-hidden flex-shrink-0">
            <img
              src={product.variants?.[0]?.images?.[0]}
              alt={product.name}
              className="w-full h-full object-contain p-1"
            />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-900 mb-0.5 tracking-tight">
              {product.name}
            </p>
            <p className="text-[10px] text-gray-500 line-clamp-1 max-w-xs">
              {product.description || "No description"}
            </p>
          </div>
        </div>
      </td>
      <td className="py-2.5 px-3">
        <div className="flex items-center gap-1.5 text-[10px]">
          <Tag className="w-3 h-3 text-gray-400" />
          <span className="font-medium text-gray-700 uppercase tracking-wider">
            {product.category || "—"}
          </span>
        </div>
      </td>
      <td className="py-2.5 px-3">
        <StatusBadge status={product.status} />
      </td>
      <td className="py-2.5 px-3">
        <div className="flex flex-col">
          <span className="text-xs font-medium text-gray-900">
            ₹
            {product.variants?.[0]?.sizes?.[0]?.sellingPrice?.toLocaleString() ||
              "0"}
          </span>
          {product.variants?.[0]?.sizes?.[0]?.discount > 0 && (
            <span className="text-[9px] font-medium text-gray-500 uppercase tracking-wider">
              {product.variants[0].sizes[0].discount}% OFF
            </span>
          )}
        </div>
      </td>
      <td className="py-2.5 px-3 text-[10px] font-medium text-gray-500">
        {new Date(product.createdAt).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        })}
      </td>
      <td className="py-2.5 px-3" onClick={(e) => e.stopPropagation()}>
        {product.status === "pending" ? (
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => approveProduct(product._id)}
              className="w-7 h-7 flex items-center justify-center bg-gray-900 text-white text-[10px] font-medium uppercase tracking-wider hover:bg-gray-800 transition-colors"
              title="Approve"
            >
              ✓
            </button>
            <button
              onClick={() => rejectProduct(product._id)}
              className="w-7 h-7 flex items-center justify-center bg-gray-200 text-gray-900 text-[10px] font-medium uppercase tracking-wider hover:bg-gray-300 transition-colors"
              title="Reject"
            >
              ✗
            </button>
          </div>
        ) : (
          <span className="text-[10px] text-gray-400 uppercase tracking-wider">
            —
          </span>
        )}
      </td>
    </tr>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-3">
          <div className="relative">
            <div className="w-8 h-8 border border-gray-200 rounded-full"></div>
            <div className="w-8 h-8 border border-black border-t-transparent rounded-full animate-spin absolute inset-0"></div>
          </div>
          <p className="text-[10px] text-gray-500 uppercase tracking-wider">
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
            <h1 className="text-lg md:text-xl font-medium text-gray-900 uppercase tracking-tight">
              Products
            </h1>
            <p className="text-[10px] text-gray-500 uppercase tracking-wider mt-0.5">
              Manage and review product submissions
            </p>
          </div>
          <div className="text-[10px] text-gray-600 bg-gray-100 px-2.5 py-1.5 uppercase tracking-wider">
            {products.length} total
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 w-3.5 h-3.5" />
              <input
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-2 text-xs border border-gray-200 focus:outline-none focus:border-black focus:ring-0 transition-colors bg-white"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="appearance-none pl-3 pr-7 py-2 text-xs border border-gray-200 bg-white focus:outline-none focus:border-black w-28"
              >
                <option value="all">All</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-3.5 h-3.5 pointer-events-none" />
            </div>

            <div className="flex border border-gray-200">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 transition-colors ${viewMode === "grid" ? "bg-gray-900 text-white" : "bg-white text-gray-400 hover:text-gray-900"}`}
              >
                <Grid className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 transition-colors ${viewMode === "list" ? "bg-gray-900 text-white" : "bg-white text-gray-400 hover:text-gray-900"}`}
              >
                <List className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="mb-4 flex items-center gap-2 text-[10px] text-gray-600 uppercase tracking-wider">
        <span className="font-medium text-gray-900">
          {filteredProducts.length}
        </span>
        <span>
          {filteredProducts.length === 1 ? "product" : "products"} found
        </span>
      </div>

      {/* GRID VIEW - FIXED: ONLY 4 CARDS PER ROW */}
      {viewMode === "grid" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredProducts.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}

      {/* List View */}
      {viewMode === "list" && (
        <div className="border border-gray-200 overflow-hidden bg-white">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-0">
                  <div className="pl-3 py-2.5 text-[10px] font-medium text-gray-600 uppercase tracking-wider">
                    Product
                  </div>
                </th>
                <th className="text-left p-0">
                  <div className="py-2.5 text-[10px] font-medium text-gray-600 uppercase tracking-wider">
                    Category
                  </div>
                </th>
                <th className="text-left p-0">
                  <div className="py-2.5 text-[10px] font-medium text-gray-600 uppercase tracking-wider">
                    Status
                  </div>
                </th>
                <th className="text-left p-0">
                  <div className="py-2.5 text-[10px] font-medium text-gray-600 uppercase tracking-wider">
                    Price
                  </div>
                </th>
                <th className="text-left p-0">
                  <div className="py-2.5 text-[10px] font-medium text-gray-600 uppercase tracking-wider">
                    Date
                  </div>
                </th>
                <th className="text-left p-0">
                  <div className="pr-3 py-2.5 text-[10px] font-medium text-gray-600 uppercase tracking-wider">
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

      {/* Load More Button */}
      {products.length > 0 && hasMore && filter === "all" && !search && (
        <div className="mt-8 text-center">
          <button
            onClick={handleLoadMore}
            disabled={loadingMore}
            className="px-5 py-2 bg-gray-900 text-white text-[10px] font-medium uppercase tracking-wider hover:bg-gray-800 transition-colors disabled:opacity-50 flex items-center gap-2 mx-auto"
          >
            {loadingMore ? (
              <>
                <div className="animate-spin rounded-full h-3 w-3 border border-white border-t-transparent"></div>
                Loading...
              </>
            ) : (
              "Load More"
            )}
          </button>
        </div>
      )}

      {/* Empty State */}
      {filteredProducts.length === 0 && (
        <div className="text-center py-12 border border-gray-200 bg-gray-50">
          <AlertCircle className="w-6 h-6 mx-auto mb-2 text-gray-400" />
          <p className="text-xs font-medium text-gray-900 mb-1">
            No products found
          </p>
          <p className="text-[10px] text-gray-500 uppercase tracking-wider max-w-sm mx-auto">
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
