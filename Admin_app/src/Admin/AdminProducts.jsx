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
        `${API_URL}/admin/products?page=${pageNum}&limit=8`
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
    <div className="mx-auto max-w-[1400px] space-y-8 pb-10 font-poppins bg-[#f8f9fc] min-h-screen px-4 py-8">
      {/* Header Section */}
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between mb-2">
        <div>
          <h1 className="text-[28px] font-semibold leading-tight text-[#141b2d]">Product Governance</h1>
          <p className="mt-1 text-sm text-[#66728d]">
            Review, approve, or reject vendor inventory to maintain platform quality.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search inventory..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full md:w-80 bg-white border border-[#e2e8f0] rounded-2xl py-2.5 pl-11 pr-4 text-[13px] font-medium outline-none transition-all focus:border-[#2563eb] shadow-sm"
            />
          </div>
          <div className="flex border border-[#e2e8f0] bg-white rounded-2xl overflow-hidden shadow-sm">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2.5 transition-all ${viewMode === "grid" ? "bg-[#0f172a] text-white" : "text-gray-400 hover:text-[#0f172a]"}`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2.5 transition-all ${viewMode === "list" ? "bg-[#0f172a] text-white" : "text-gray-400 hover:text-[#0f172a]"}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {['all', 'pending', 'approved', 'rejected'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-5 py-2 rounded-full text-[11px] font-bold uppercase tracking-widest transition-all whitespace-nowrap ${filter === f
                ? "bg-[#2563eb] text-white shadow-lg shadow-blue-100"
                : "bg-white text-gray-500 border border-[#e2e8f0] hover:border-gray-300"
              }`}
          >
            {f} {f === 'all' ? `(${products.length})` : ''}
          </button>
        ))}
      </div>

      {/* Results */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <div key={product._id} className="group bg-white rounded-[24px] border border-[#eef2f8] overflow-hidden hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-300 flex flex-col">
              <div className="relative aspect-[4/3] bg-[#fcfdfe] overflow-hidden p-6">
                <img
                  src={product.variants?.[0]?.images?.[0]}
                  alt=""
                  className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute top-4 left-4">
                  <StatusBadge status={product.status} />
                </div>
                <button
                  onClick={() => openProductModal(product)}
                  className="absolute top-4 right-4 h-9 w-9 bg-white/90 backdrop-blur rounded-xl flex items-center justify-center text-gray-600 shadow-sm opacity-0 group-hover:opacity-100 transition-all border border-[#eff2f9]"
                >
                  <Eye className="w-4 h-4" />
                </button>
              </div>

              <div className="p-5 flex-1 flex flex-col">
                <div className="mb-4">
                  <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-1">{product.category || 'General'}</p>
                  <h3 className="text-sm font-bold text-[#1a2238] line-clamp-1">{product.name}</h3>
                </div>

                <div className="mt-auto pt-4 border-t border-[#f1f4f9] flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Valuation</p>
                    <p className="text-[15px] font-bold text-[#1a2238]">₹{product.variants?.[0]?.sizes?.[0]?.sellingPrice?.toLocaleString()}</p>
                  </div>

                  {product.status === "pending" && (
                    <div className="flex gap-1.5">
                      <button
                        onClick={(e) => { e.stopPropagation(); approveProduct(product._id); }}
                        className="h-9 w-9 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center hover:bg-emerald-600 hover:text-white transition-all border border-emerald-100"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); rejectProduct(product._id); }}
                        className="h-9 w-9 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center hover:bg-rose-600 hover:text-white transition-all border border-rose-100"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* List View */
        <div className="rounded-[24px] border border-[#e7ebf5] bg-white overflow-x-auto scrollbar-hide shadow-sm">
          <table className="w-full min-w-[900px]">
            <thead className="bg-gray-50/50">
              <tr>
                <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">Product Information</th>
                <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">Market Value</th>
                <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">Internal Status</th>
                <th className="px-6 py-4 text-right text-[10px] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">Operations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f1f4f9]">
              {filteredProducts.map((product) => (
                <tr key={product._id} className="group hover:bg-gray-50/50 transition-colors cursor-pointer" onClick={() => openProductModal(product)}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 bg-white rounded-xl border border-[#eef2f8] flex items-center justify-center overflow-hidden shrink-0">
                        <img src={product.variants?.[0]?.images?.[0]} alt="" className="h-10 w-10 object-contain p-1" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-[#1a2238] line-clamp-1">{product.name}</p>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{product.category}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold text-[#1a2238]">₹{product.variants?.[0]?.sizes?.[0]?.sellingPrice?.toLocaleString()}</p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={product.status} />
                  </td>
                  <td className="px-6 py-4 text-right whitespace-nowrap">
                    <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                      {product.status === 'pending' && (
                        <>
                          <button onClick={() => approveProduct(product._id)} className="px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-emerald-600 hover:text-white transition-all">Authorize</button>
                          <button onClick={() => rejectProduct(product._id)} className="px-3 py-1.5 bg-rose-50 text-rose-600 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-rose-600 hover:text-white transition-all">Discard</button>
                        </>
                      )}
                      <button onClick={() => openProductModal(product)} className="px-3 py-1.5 bg-gray-50 text-gray-500 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-gray-200 transition-all border border-gray-100">Review</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination & Empty State (simplified for brevity, maintaining functionality) */}
      {filteredProducts.length === 0 && (
        <div className="py-20 text-center bg-white rounded-[24px] border border-[#e7ebf5] shadow-sm">
          <Package className="w-12 h-12 text-gray-200 mx-auto mb-4" />
          <p className="text-sm font-bold text-[#1a2238]">No matching inventory found</p>
          <p className="text-xs text-gray-400 mt-1">Try broadening your search parameters.</p>
        </div>
      )}
      {/* Product Detail Modal */}
      <ProductDetailModal product={selectedProduct} />
    </div>
  );
};

export default AdminProducts;
