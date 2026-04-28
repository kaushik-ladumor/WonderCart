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
        bg: "bg-[#fffbeb]",
        text: "text-[#d97706]",
        border: "border-[#fde68a]",
      },
      approved: {
        bg: "bg-[#f0fdf4]",
        text: "text-[#16a34a]",
        border: "border-[#bbf7d0]",
      },
      rejected: {
        bg: "bg-[#fef2f2]",
        text: "text-[#dc2626]",
        border: "border-[#fecaca]",
      },
    };

    const { bg, text, border } = config[status] || config.pending;

    return (
      <div className={`inline-flex items-center px-2.5 py-1 rounded-[8px] border ${bg} ${border}`}>
        <span className={`text-[9px] font-bold uppercase tracking-wider ${text}`}>{status}</span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] bg-[#f6f7fb]">
        <div className="text-center space-y-3">
          <div className="relative">
            <div className="w-8 h-8 border border-[#e2e8f0] rounded-full"></div>
            <div className="w-8 h-8 border border-[#0f49d7] border-t-transparent rounded-full animate-spin absolute inset-0"></div>
          </div>
          <p className="text-[10px] font-bold text-[#64748b] uppercase tracking-wider">
            Loading products...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-10 font-poppins bg-[#f6f7fb] min-h-screen px-4 sm:px-6 lg:px-8 py-6">
      {/* Header Section */}
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between mb-4">
        <div>
          <h1 className="text-[1.75rem] font-bold tracking-tight text-[#11182d]">Product Governance</h1>
          <p className="mt-1 text-[0.85rem] text-[#64748b]">
            Review, approve, or reject vendor inventory to maintain platform quality.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3">
           <div className="relative w-full sm:w-auto">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94a3b8]" />
              <input 
                type="text" 
                placeholder="Search inventory..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full sm:w-72 bg-white border border-[#d7dcea] rounded-[14px] py-2.5 pl-10 pr-4 text-[0.85rem] font-medium text-[#11182d] outline-none transition-all focus:border-[#0f49d7] focus:ring-4 focus:ring-[#0f49d7]/10 shadow-sm"
              />
           </div>
           <div className="flex items-center gap-1 p-1 bg-white border border-[#d7dcea] rounded-[14px] shadow-sm w-full sm:w-auto">
              <button 
                onClick={() => setViewMode("grid")} 
                className={`p-2 rounded-[10px] transition-all ${viewMode === "grid" ? "bg-[#f8fafc] text-[#0f49d7] shadow-sm border border-[#e2e8f0]" : "text-[#94a3b8] hover:text-[#11182d] hover:bg-gray-50"}`}
                title="Grid View"
              >
                <Grid className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setViewMode("list")} 
                className={`p-2 rounded-[10px] transition-all ${viewMode === "list" ? "bg-[#f8fafc] text-[#0f49d7] shadow-sm border border-[#e2e8f0]" : "text-[#94a3b8] hover:text-[#11182d] hover:bg-gray-50"}`}
                title="List View"
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
            className={`px-4 py-2 rounded-[12px] text-[10px] font-bold uppercase tracking-wider transition-all whitespace-nowrap border ${
              filter === f
                ? "bg-[#0f49d7] text-white border-[#0f49d7] shadow-md shadow-blue-500/20"
                : "bg-white text-[#64748b] border-[#d7dcea] hover:border-[#cbd5e1] hover:text-[#11182d]"
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
            <div key={product._id} className="bg-white rounded-[18px] border border-[#d7dcea] overflow-hidden cursor-pointer flex flex-col" onClick={() => openProductModal(product)}>
              <div className="relative aspect-[4/3] bg-[#f8fafc] overflow-hidden p-6 border-b border-[#e2e8f0]">
                <img
                  src={product.variants?.[0]?.images?.[0] || "/placeholder.png"}
                  alt=""
                  className="w-full h-full object-contain mix-blend-multiply"
                />
                <div className="absolute top-3 left-3">
                  <StatusBadge status={product.status} />
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col">
                <div className="mb-4">
                  <p className="text-[10px] font-bold text-[#0f49d7] uppercase tracking-wider mb-1.5 flex items-center gap-1.5"><Tag className="w-3 h-3"/>{product.category || 'General'}</p>
                  <h3 className="text-[0.95rem] font-bold text-[#11182d] line-clamp-1">{product.name}</h3>
                </div>

                <div className="mt-auto pt-4 border-t border-[#e2e8f0] flex items-center justify-between">
                  <div>
                    <p className="text-[9px] font-bold text-[#64748b] uppercase tracking-wider mb-0.5">Price</p>
                    <p className="text-[1rem] font-bold text-[#11182d]">₹ {product.variants?.[0]?.sizes?.[0]?.sellingPrice?.toLocaleString() || "0"}</p>
                  </div>

                  {product.status === "pending" && (
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); approveProduct(product._id); }}
                        className="h-8 w-8 bg-[#f0fdf4] text-[#16a34a] rounded-[10px] flex items-center justify-center hover:bg-[#16a34a] hover:text-white transition-all border border-[#bbf7d0]"
                        title="Approve"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); rejectProduct(product._id); }}
                        className="h-8 w-8 bg-[#fef2f2] text-[#dc2626] rounded-[10px] flex items-center justify-center hover:bg-[#dc2626] hover:text-white transition-all border border-[#fecaca]"
                        title="Reject"
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
        <div className="bg-white rounded-[18px] border border-[#d7dcea] overflow-x-auto scrollbar-hide shadow-sm">
          <table className="w-full min-w-[900px]">
            <thead className="bg-[#f8fafc] border-b border-[#e2e8f0]">
              <tr>
                <th className="px-6 py-4 text-left text-[10px] font-bold text-[#64748b] uppercase tracking-wider whitespace-nowrap">Product Information</th>
                <th className="px-6 py-4 text-left text-[10px] font-bold text-[#64748b] uppercase tracking-wider whitespace-nowrap">Price</th>
                <th className="px-6 py-4 text-left text-[10px] font-bold text-[#64748b] uppercase tracking-wider whitespace-nowrap">Status</th>
                <th className="px-6 py-4 text-right text-[10px] font-bold text-[#64748b] uppercase tracking-wider whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e2e8f0]">
              {filteredProducts.map((product) => (
                <tr key={product._id} className="cursor-pointer" onClick={() => openProductModal(product)}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 bg-white rounded-[12px] border border-[#e2e8f0] flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
                        <img src={product.variants?.[0]?.images?.[0] || "/placeholder.png"} alt="" className="h-full w-full object-contain p-1.5 mix-blend-multiply" />
                      </div>
                      <div>
                        <p className="text-[0.9rem] font-bold text-[#11182d] line-clamp-1">{product.name}</p>
                        <p className="text-[10px] font-bold text-[#64748b] uppercase tracking-wider mt-0.5">{product.category || 'General'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-[0.95rem] font-bold text-[#11182d]">₹ {product.variants?.[0]?.sizes?.[0]?.sellingPrice?.toLocaleString() || "0"}</p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={product.status} />
                  </td>
                  <td className="px-6 py-4 text-right whitespace-nowrap">
                    <div className="flex justify-end items-center gap-2" onClick={(e) => e.stopPropagation()}>
                      {product.status === 'pending' && (
                        <>
                          <button onClick={() => approveProduct(product._id)} className="px-3 py-1.5 bg-[#f0fdf4] text-[#16a34a] border border-[#bbf7d0] rounded-[10px] text-[10px] font-bold uppercase tracking-wider hover:bg-[#16a34a] hover:text-white transition-all">Approve</button>
                          <button onClick={() => rejectProduct(product._id)} className="px-3 py-1.5 bg-[#fef2f2] text-[#dc2626] border border-[#fecaca] rounded-[10px] text-[10px] font-bold uppercase tracking-wider hover:bg-[#dc2626] hover:text-white transition-all">Reject</button>
                        </>
                      )}
                      <button onClick={() => openProductModal(product)} className="h-8 w-8 flex items-center justify-center bg-white text-[#64748b] border border-[#d7dcea] rounded-[10px] hover:bg-[#f8fafc] hover:text-[#11182d] transition-all shadow-sm">
                         <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Empty State */}
      {filteredProducts.length === 0 && (
        <div className="py-20 text-center bg-white rounded-[18px] border border-[#d7dcea] shadow-sm">
          <Package className="w-12 h-12 text-[#cbd5e1] mx-auto mb-4" />
          <p className="text-[0.95rem] font-bold text-[#11182d]">No matching inventory found</p>
          <p className="text-[0.85rem] text-[#64748b] mt-1">Try broadening your search parameters or select a different filter.</p>
        </div>
      )}

      {/* Product Detail Modal */}
      <ProductDetailModal product={selectedProduct} />
    </div>
  );
};

export default AdminProducts;
