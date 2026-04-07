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
      <div className="px-0 py-2">
        <div className="mx-auto max-w-md rounded-[26px] border border-[#e3e8ff] bg-white px-5 py-7 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#fef0f0]">
            <AlertCircle className="h-7 w-7 text-[#d14343]" />
          </div>
          <h3 className="text-[18px] font-semibold text-[#11182d]">Unable to Load Products</h3>
          <p className="mt-2 text-sm text-[#6d7894]">{error}</p>
          <button
            onClick={() => fetchProducts()}
            className="mt-6 inline-flex items-center justify-center gap-2 rounded-2xl bg-[#2f5fe3] px-4 py-3 text-sm font-semibold text-white"
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
      iconClasses: "bg-[#eaf0ff] text-[#2f5fe3]",
      valueClasses: "text-[#11182d]",
    },
    {
      label: "Products In Stock",
      value: stats.inStock,
      icon: TrendingUp,
      iconClasses: "bg-[#e9f8ef] text-[#18794e]",
      valueClasses: "text-[#18794e]",
    },
    {
      label: "Out of Stock",
      value: stats.outOfStock,
      icon: BarChart3,
      iconClasses: "bg-[#fef0f0] text-[#d14343]",
      valueClasses: "text-[#d14343]",
    },
    {
      label: "Total Stock",
      value: stats.totalStock,
      icon: Package,
      iconClasses: "bg-[#f5f7ff] text-[#7481a2]",
      valueClasses: "text-[#11182d]",
    },
  ];

  return (
    <div className="space-y-4 px-0 pb-2">
      <section className="rounded-[28px] border border-[#e3e8ff] bg-white px-5 py-4 sm:px-6 sm:py-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-[#9aa6c7]">
              Seller Products
            </p>
            <h1 className="mt-1.5 text-[24px] font-semibold tracking-[-0.03em] text-[#11182d]">
              Product Inventory
            </h1>
            <p className="mt-1.5 max-w-2xl text-[13px] text-[#6d7894]">
              Manage your catalog, stock, and product details in the same clean seller
              workspace.
            </p>
          </div>

          <Link
            to="/seller/products/add"
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#2f5fe3] px-4 py-2.5 text-[13px] font-semibold text-white lg:min-w-[172px]"
          >
            <Plus className="h-4 w-4" />
            Add New Product
          </Link>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((card) => {
          const Icon = card.icon;

          return (
            <div
              key={card.label}
              className="rounded-[24px] border border-[#e3e8ff] bg-white px-4 py-3.5"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-[#98a4c4]">
                    {card.label}
                  </p>
                  <p className={`mt-2.5 text-[26px] font-semibold ${card.valueClasses}`}>
                    {card.value}
                  </p>
                </div>
                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-2xl ${card.iconClasses}`}
                >
                  <Icon className="h-[18px] w-[18px]" />
                </div>
              </div>
            </div>
          );
        })}
      </section>

      <section className="rounded-[28px] border border-[#e3e8ff] bg-white px-5 py-4 sm:px-6">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full max-w-2xl">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7d88a8]" />
            <input
              type="text"
              placeholder="Search products by name, category, or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-2xl border border-[#d9e0f7] bg-[#f7f8ff] py-2.5 pl-11 pr-11 text-[13px] text-[#11182d] outline-none placeholder:text-[#7f8aac] focus:border-[#2f5fe3]"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-[#7d88a8]"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3 text-[13px] text-[#6d7894]">
            <span>{filteredProducts.length} shown</span>
            <span className="h-4 w-px bg-[#d6def4]" />
            <span>{products.length} total</span>
          </div>
        </div>
      </section>

      {filteredProducts.length === 0 ? (
        <section className="rounded-[28px] border border-[#e3e8ff] bg-white px-6 py-10 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-[20px] bg-[#f2f5ff]">
            <Package className="h-7 w-7 text-[#6c79a0]" />
          </div>
          <h3 className="text-[18px] font-semibold text-[#11182d]">
            {searchTerm ? "No products found" : "No products yet"}
          </h3>
          <p className="mx-auto mt-2 max-w-sm text-[13px] text-[#6d7894]">
            {searchTerm
              ? "Try adjusting your search to find the right product faster."
              : "Start by adding your first product to build your seller catalog."}
          </p>
          {!searchTerm && (
            <Link
              to="/seller/products/add"
              className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-[#2f5fe3] px-4 py-2.5 text-[13px] font-semibold text-white"
            >
              <Plus className="h-4 w-4" />
              Add Your First Product
            </Link>
          )}
        </section>
      ) : (
        <>
          <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                onDelete={handleDelete}
                deleteLoading={deleteLoading}
              />
            ))}
          </section>

          <section className="rounded-[28px] border border-[#e3e8ff] bg-white px-5 py-4 text-center sm:px-6">
            <p className="text-[13px] text-[#6d7894]">
              Showing {filteredProducts.length} of {products.length} products
            </p>

            {hasMore && !searchTerm && (
              <button
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-[#2f5fe3] px-5 py-2.5 text-[13px] font-semibold text-white disabled:opacity-60"
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
        </>
      )}

      <Link
        to="/seller/products/add"
        className="fixed bottom-6 right-6 z-20 inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#2f5fe3] text-white md:hidden"
      >
        <Plus className="h-6 w-6" />
      </Link>
    </div>
  );
};

export default SellerProducts;
