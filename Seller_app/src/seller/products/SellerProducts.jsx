import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  Plus,
  Package,
  RefreshCw,
  X,
  TrendingUp,
  AlertCircle,
  BarChart3,
} from "lucide-react";
import Loader from "../../components/Loader";
import { API_URL } from "../../utils/constants";
import ProductCard from "./ProductCard";

const SellerProducts = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteLoading, setDeleteLoading] = useState({});
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async (pageNum = 1, append = false) => {
    try {
      if (pageNum === 1) setLoading(true);
      else setLoadingMore(true);

      const token = localStorage.getItem("token");
      const response = await fetch(
        `${API_URL}/product/seller/product?page=${pageNum}&limit=8`,
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

      const productList = data.products || [];
      const pagination = data.pagination;

      if (append) {
        setProducts((prev) => [...prev, ...productList]);
        setFilteredProducts((prev) => [...prev, ...productList]);
      } else {
        setProducts(productList);
        setFilteredProducts(productList);
      }

      if (pagination) {
        setHasMore(pagination.page < pagination.pages);
      } else {
        setHasMore(productList.length === 8);
      }
    } catch (err) {
      setError(err.message || "Failed to load products");
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
      const response = await fetch(`${API_URL}/product/delete/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || "Delete failed");
      }

      const updated = products.filter((product) => product._id !== id);
      setProducts(updated);
      setFilteredProducts(updated);
    } catch (err) {
      alert(`Delete failed: ${err.message}`);
    } finally {
      setDeleteLoading((prev) => ({ ...prev, [id]: false }));
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const filtered = products.filter(
        (product) =>
          product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.category?.toLowerCase().includes(searchTerm.toLowerCase()),
      );
      setFilteredProducts(filtered);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, products]);

  const getStats = () => {
    const totalStock = products.reduce((sum, product) => {
      if (!product.variants?.length) return sum;
      return (
        sum +
        product.variants.reduce(
          (variantSum, variant) =>
            variantSum +
            (variant.sizes?.reduce((sizeSum, size) => sizeSum + (size.stock || 0), 0) ||
              0),
          0,
        )
      );
    }, 0);

    const inStock = products.filter((product) => {
      if (!product.variants?.length) return false;
      return product.variants.some((variant) =>
        variant.sizes?.some((size) => (size.stock || 0) > 0),
      );
    }).length;

    const outOfStock = products.filter((product) => {
      if (!product.variants?.length) return true;
      return !product.variants.some((variant) =>
        variant.sizes?.some((size) => (size.stock || 0) > 0),
      );
    }).length;

    return { totalStock, inStock, outOfStock };
  };

  if (loading) return <Loader />;

  if (error) {
    return (
      <div className="px-0 py-2 font-poppins">
        <div className="mx-auto max-w-md rounded-[18px] border border-rose-200 bg-white px-5 py-7 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50">
            <AlertCircle className="h-7 w-7 text-rose-600" />
          </div>
          <h3 className="text-[1.1rem] font-bold text-[#11182d]">Unable to Load Products</h3>
          <p className="mt-2 text-[0.82rem] text-[#6d7892]">{error}</p>
          <button
            onClick={() => fetchProducts()}
            className="mt-6 inline-flex items-center justify-center gap-2 rounded-[14px] bg-[#0f49d7] px-6 py-3 text-sm font-bold text-white shadow-sm hover:shadow-md transition-all"
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const stats = getStats();

  const statCards = [
    {
      label: "Total Products",
      value: products.length,
      icon: Package,
      iconWrap: "bg-[#eef2ff] text-[#0f49d7]",
      valueClasses: "text-[#11182d]",
    },
    {
      label: "Products In Stock",
      value: stats.inStock,
      icon: TrendingUp,
      iconWrap: "bg-emerald-50 text-emerald-600",
      valueClasses: "text-emerald-700",
    },
    {
      label: "Out of Stock",
      value: stats.outOfStock,
      icon: AlertCircle,
      iconWrap: "bg-rose-50 text-rose-600",
      valueClasses: "text-rose-700",
    },
    {
      label: "Total Stock",
      value: stats.totalStock,
      icon: Package,
      iconWrap: "bg-[#f8f9fd] text-[#6d7892]",
      valueClasses: "text-[#11182d]",
    },
  ];

  return (
    <div className="min-h-screen bg-[#f6f7fb] py-3 text-[#11182d] font-poppins">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-4">
        <section className="rounded-[18px] border border-[#e1e5f1] bg-white px-5 py-4 sm:px-6 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0f49d7] text-[0.75rem] font-bold text-white shadow-sm">
              1
            </span>
            <div>
              <h1 className="text-[1.5rem] font-semibold tracking-tight text-[#11182d]">Product Inventory</h1>
              <p className="mt-0.5 text-[0.82rem] text-[#6d7892]">Manage catalog, stock, and variants.</p>
            </div>
          </div>

          <Link
            to="/seller/products/add"
            className="inline-flex items-center justify-center gap-2 rounded-[14px] bg-[#0f49d7] px-6 py-2.5 text-[0.82rem] font-bold text-white shadow-sm hover:shadow-md transition-all lg:min-w-[180px]"
          >
            <Plus className="h-4.5 w-4.5" />
            Add New Product
          </Link>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3.5 xl:grid-cols-4">
        {statCards.map((card) => {
          const Icon = card.icon;

          return (
            <div
              key={card.label}
              className="rounded-[18px] border border-[#d7dcea] bg-white px-5 py-4 shadow-sm group hover:border-[#0f49d7] transition-all"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[0.65rem] font-bold uppercase tracking-[0.12em] text-[#6d7892]">
                    {card.label}
                  </p>
                  <p className={`mt-2.5 text-[1.5rem] font-bold tracking-tight ${card.valueClasses}`}>
                    {card.value}
                  </p>
                </div>
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-[12px] ${card.iconWrap} transition-transform group-hover:scale-110`}
                >
                  <Icon className="h-4.5 w-4.5" />
                </div>
              </div>
            </div>
          );
        })}
      </section>

      <section className="rounded-[18px] border border-[#d7dcea] bg-white px-5 py-4 sm:px-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full max-w-2xl">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#98a4bd]" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-[14px] border border-[#d7dcea] bg-[#f8f9fd] py-2.5 pl-11 pr-11 text-[0.82rem] text-[#11182d] outline-none placeholder:text-[#98a4bd] focus:border-[#0f49d7] focus:bg-white transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-[#98a4bd] hover:text-rose-600 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-3 text-[0.78rem] font-semibold text-[#6d7892]">
            <span className="text-[#11182d]">{filteredProducts.length} shown</span>
            <span className="h-3.5 w-px bg-[#d7dcea]" />
            <span>{products.length} total</span>
          </div>
        </div>
      </section>

      {filteredProducts.length === 0 ? (
        <section className="rounded-[18px] border border-[#d7dcea] bg-white px-6 py-12 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-[20px] bg-[#f8f9fd] border border-[#d7dcea]/50">
            <Package className="h-8 w-8 text-[#98a4bd]" />
          </div>
          <h3 className="text-[1.1rem] font-bold text-[#11182d]">
            {searchTerm ? "No products found" : "No products yet"}
          </h3>
          <p className="mx-auto mt-2 max-w-xs text-[0.82rem] text-[#6d7892] font-medium leading-relaxed">
            {searchTerm
              ? "Try adjusting your search to find the right product faster."
              : "Start by adding your first product to build your seller catalog."}
          </p>
          {!searchTerm && (
            <Link
              to="/seller/products/add"
              className="mt-6 inline-flex items-center gap-2 rounded-[14px] bg-[#0f49d7] px-6 py-3 text-[0.82rem] font-bold text-white shadow-sm"
            >
              <Plus className="h-4 w-4" />
              Add Your First Product
            </Link>
          )}
        </section>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4.5 sm:grid-cols-2 xl:grid-cols-4">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                onDelete={handleDelete}
                deleteLoading={deleteLoading}
              />
            ))}
          </div>

          <section className="rounded-[18px] border border-[#d7dcea] bg-white px-5 py-4 text-center shadow-sm">
            <p className="text-[0.78rem] font-semibold text-[#6d7892]">
              Showing <span className="text-[#11182d]">{filteredProducts.length}</span> of <span className="text-[#11182d]">{products.length}</span> products
            </p>

            {hasMore && !searchTerm && (
              <button
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="mt-4 inline-flex items-center gap-2.5 rounded-[14px] bg-[#0f49d7] px-6 py-2.5 text-[0.82rem] font-bold text-white shadow-sm hover:shadow-md transition-all disabled:opacity-60"
              >
                {loadingMore ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Loading...
                  </>
                ) : (
                  "Load More Products"
                )}
              </button>
            )}
          </section>
        </div>
      )}

      <Link
        to="/seller/products/add"
        className="fixed bottom-6 right-6 z-20 flex h-14 w-14 items-center justify-center rounded-full bg-[#0f49d7] text-white shadow-lg hover:scale-110 transition-transform md:hidden"
      >
        <Plus className="h-6 w-6" />
      </Link>
      </div>
    </div>
  );
};

export default SellerProducts;
