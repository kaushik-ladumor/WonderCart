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

      const res = await axios.get(`${API_URL}/admin/products?page=${pageNum}&limit=8`, {
        headers: { Authorization: `Bearer ${token}` },
      });

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
      await axios.delete(
        `${API_URL}/admin/products/${productId}/reject`,
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
      className="group cursor-pointer bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-[0_20px_40px_rgba(0,0,0,0.06)] transition-all duration-500 hover:border-gray-200 active:scale-[0.98] animate-in fade-in slide-in-from-bottom-4"
    >
      {/* Visual Identity */}
      <div className="relative aspect-square bg-[#F8FAFB] overflow-hidden">
        <img
          src={
            product.variants?.[0]?.images?.[0] ||
            "/placeholder.png"
          }
          alt={product.name}
          className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-700 ease-out p-4"
        />

        {/* Floating Status */}
        <div className="absolute top-4 left-4 drop-shadow-sm">
          <StatusBadge status={product.status} />
        </div>

        {/* Hover Action Overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/[0.02] transition-colors duration-500 flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-4 group-hover:translate-y-0 bg-white shadow-xl px-5 py-2.5 rounded-2xl flex items-center gap-2 text-xs font-black uppercase tracking-widest text-gray-900 border border-gray-50">
            <Eye className="w-4 h-4" />
            View
          </div>
        </div>
      </div>

      {/* Product Content Details */}
      <div className="p-4 md:p-5 space-y-3">
        <div className="space-y-1">
          <h3 className="font-black text-gray-900 text-sm line-clamp-1 tracking-tight group-hover:text-blue-600 transition-colors">
            {product.name}
          </h3>
          <p className="text-[11px] font-bold text-gray-400 capitalize tracking-wider flex items-center gap-1.5">
            <Tag className="w-3 h-3" />
            {product.category || "General"}
          </p>
        </div>

        {/* Financials & Action */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-50">
          <div className="flex flex-col">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-tighter">Starting at</span>
            <span className="font-black text-gray-900 text-base leading-none">
              ₹{product.variants?.[0]?.sizes?.[0]?.sellingPrice?.toLocaleString() || "0"}
            </span>
          </div>

          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></div>
            <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Active</span>
          </div>
        </div>

        {/* Pending Approval Controls */}
        {product.status === "pending" && (
          <div
            className="pt-2 flex items-center gap-2"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={(e) => { e.stopPropagation(); approveProduct(product._id); }}
              className="flex-1 py-2 text-[10px] font-black uppercase tracking-widest bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
            >
              Approve
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); rejectProduct(product._id); }}
              className="flex-1 py-2 text-[10px] font-black uppercase tracking-widest bg-red-500 text-white rounded-xl hover:bg-red-600 shadow-lg shadow-red-500/20 transition-all active:scale-95"
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
      <td className="py-3 px-4">
        <div className="flex flex-col">
          <span className="text-sm font-black text-gray-900 leading-none">
            ₹{product.variants?.[0]?.sizes?.[0]?.sellingPrice?.toLocaleString() || "0"}
          </span>
          {product.variants?.[0]?.sizes?.[0]?.discount > 0 && (
            <span className="text-[10px] font-bold text-emerald-600">
              {product.variants[0].sizes[0].discount}% OFF
            </span>
          )}
        </div>
      </td>
      <td className="py-3 px-4 text-xs font-bold text-gray-400">
        {new Date(product.createdAt).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        })}
      </td>
      <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
        {product.status === "pending" ? (
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => approveProduct(product._id)}
              className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors shadow-sm border border-emerald-100"
              title="Approve"
            >
              <CheckCircle className="w-4 h-4" />
            </button>
            <button
              onClick={() => rejectProduct(product._id)}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors shadow-sm border border-red-100"
              title="Reject"
            >
              <XCircle className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400">
            <div className="w-1.5 h-1.5 rounded-full bg-gray-300"></div>
            Completed
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
        <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 sm:gap-4 md:gap-5">
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
                  <div className="py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    Status
                  </div>
                </th>
                <th className="text-left p-0">
                  <div className="py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    Price
                  </div>
                </th>
                <th className="text-left p-0">
                  <div className="py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    Date
                  </div>
                </th>
                <th className="text-left p-0">
                  <div className="pr-4 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    Review
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
            className="px-8 py-2.5 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-all flex items-center gap-2 mx-auto disabled:opacity-50"
          >
            {loadingMore ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Loading...
              </>
            ) : (
              "Load More Products"
            )}
          </button>
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
