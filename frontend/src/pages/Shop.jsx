import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Heart,
  Search,
  SlidersHorizontal,
  Star,
  X,
} from "lucide-react";
import Loader from "../components/Loader";
import ProductCard from "../components/ProductCard";
import { API_URL } from "../utils/constants";

const ITEMS_PER_PAGE = 12;

const getProductImage = (product) =>
  product?.variants?.find((variant) => variant?.images?.[0])?.images?.[0] ||
  product?.image ||
  product?.images?.[0] ||
  "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80";

const getSellingPrice = (product) =>
  Math.round(product?.variants?.[0]?.sizes?.[0]?.sellingPrice || 0);

const getOriginalPrice = (product) =>
  Math.round(product?.variants?.[0]?.sizes?.[0]?.originalPrice || 0);

const getRating = (product) => Number(product?.averageRating || 4.5);

const buildPagination = (page, totalPages) => {
  if (totalPages <= 1) return [1];

  const pages = [1];
  const start = Math.max(2, page - 1);
  const end = Math.min(totalPages - 1, page + 1);

  if (start > 2) pages.push("...");
  for (let i = start; i <= end; i += 1) pages.push(i);
  if (end < totalPages - 1) pages.push("...");
  if (totalPages > 1) pages.push(totalPages);

  return pages;
};

function Shop() {
  const navigate = useNavigate();
  const location = useLocation();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [wishlist, setWishlist] = useState([]);
  const [addingToWishlist, setAddingToWishlist] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("top-rated");
  const [page, setPage] = useState(1);
  const [minPrice, setMinPrice] = useState(0);
  const [minRating, setMinRating] = useState(0);

  const debouncedSearch = useMemo(() => searchQuery.trim(), [searchQuery]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const categoryFromUrl = params.get("category");
    if (categoryFromUrl) {
      setSelectedCategory(categoryFromUrl);
    } else {
      setSelectedCategory("all");
    }
  }, [location.search]);

  useEffect(() => {
    fetchCategories();
    const token = localStorage.getItem("token");
    if (token) fetchWishlist(token);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadProducts(selectedCategory, debouncedSearch);
    }, 350);

    return () => clearTimeout(timer);
  }, [selectedCategory, debouncedSearch]);

  const fetchCategories = async () => {
    try {
      const res = await axios.get(`${API_URL}/product/categories`);
      setCategories(res.data.categories || []);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  };

  const fetchWishlist = async (token) => {
    try {
      const res = await axios.get(`${API_URL}/wishlist`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        const ids =
          res.data.wishlist?.items
            ?.map((item) => item.product?._id || item.product)
            .filter(Boolean) || [];
        setWishlist(ids);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const loadProducts = async (category, query) => {
    const token =
      localStorage.getItem("token") || localStorage.getItem("authToken");
    const config = token
      ? { headers: { Authorization: `Bearer ${token}` } }
      : {};

    if (query) setSearchLoading(true);
    else setLoading(true);

    try {
      if (query) {
        const encodedQuery = encodeURIComponent(query);
        const res = await axios.get(
          `${API_URL}/product/query/search?query=${encodedQuery}`,
          config,
        );
        let resultList = res.data.data || res.data.products || [];
        if (category !== "all") {
          resultList = resultList.filter(
            (item) =>
              String(item.category || "").toLowerCase() ===
              String(category).toLowerCase(),
          );
        }
        setProducts(resultList);
      } else {
        const categoryParam =
          category !== "all" ? `&category=${encodeURIComponent(category)}` : "";
        const res = await axios.get(
          `${API_URL}/product/get?page=1&limit=200${categoryParam}`,
          config,
        );
        setProducts(res.data.data || []);
      }
      setPage(1);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load products");
      setProducts([]);
    } finally {
      setLoading(false);
      setSearchLoading(false);
    }
  };

  const priceCap = useMemo(() => {
    const maxValue = products.reduce(
      (max, product) => Math.max(max, getSellingPrice(product)),
      50000,
    );
    return maxValue > 0 ? maxValue : 50000;
  }, [products]);

  useEffect(() => {
    if (minPrice > priceCap) setMinPrice(0);
  }, [priceCap]);

  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (minPrice > 0) {
      result = result.filter((product) => getSellingPrice(product) >= minPrice);
    }

    if (minRating > 0) {
      result = result.filter((product) => getRating(product) >= minRating);
    }

    switch (sortBy) {
      case "price-low":
        result.sort((a, b) => getSellingPrice(a) - getSellingPrice(b));
        break;
      case "price-high":
        result.sort((a, b) => getSellingPrice(b) - getSellingPrice(a));
        break;
      case "name":
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "top-rated":
      default:
        result.sort((a, b) => getRating(b) - getRating(a));
        break;
    }

    return result;
  }, [products, minPrice, minRating, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / ITEMS_PER_PAGE));
  const currentPage = Math.min(page, totalPages);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProducts.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredProducts, currentPage]);

  const paginationItems = useMemo(
    () => buildPagination(currentPage, totalPages),
    [currentPage, totalPages],
  );

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setPage(1);
    setMobileFiltersOpen(false);

    if (category === "all") {
      navigate("/shop", { replace: true });
    } else {
      navigate(`/shop?category=${encodeURIComponent(category)}`, { replace: true });
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
        await axios.delete(`${API_URL}/wishlist/remove/${product._id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setWishlist((prev) => prev.filter((id) => id !== product._id));
        toast.success("Removed from wishlist");
      } else {
        await axios.post(
          `${API_URL}/wishlist/add`,
          { productId: product._id },
          { headers: { Authorization: `Bearer ${token}` } },
        );
        setWishlist((prev) => [...prev, product._id]);
        toast.success("Added to wishlist");
      }
    } catch (error) {
      toast.error("Failed to update wishlist");
    } finally {
      setAddingToWishlist((prev) => ({ ...prev, [product._id]: false }));
    }
  };

  const handleClearAll = () => {
    setSelectedCategory("all");
    setSearchQuery("");
    setSortBy("top-rated");
    setMinPrice(0);
    setMinRating(0);
    setPage(1);
    navigate("/shop", { replace: true });
  };

  if (loading) return <Loader />;

  const startIndex = filteredProducts.length
    ? (currentPage - 1) * ITEMS_PER_PAGE + 1
    : 0;
  const endIndex = Math.min(currentPage * ITEMS_PER_PAGE, filteredProducts.length);

  const filterPanel = (
    <div className="rounded-[18px] bg-[#dfe7ff] p-5 text-[#11182d]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-[1.2rem] font-semibold">Filters</h3>
          <p className="mt-1 text-[0.82rem] text-[#5c6880]">Refine selection</p>
        </div>
        <button
          onClick={handleClearAll}
          className="text-[0.8rem] font-medium text-[#0f49d7]"
        >
          Clear All
        </button>
      </div>

      <div className="mt-6 space-y-7">
        <div>
          <p className="text-[0.95rem] font-semibold uppercase tracking-[0.12em] text-[#33415e]">
            Categories
          </p>
          <div className="mt-3 space-y-3">
            {categories.slice(0, 6).map((category) => {
              const active = selectedCategory === category;
              return (
                <button
                  key={category}
                  onClick={() => handleCategoryChange(category)}
                  className="flex items-center gap-3 text-left"
                >
                  <span
                    className={`flex h-5 w-5 items-center justify-center rounded-md border ${
                      active
                        ? "border-[#0f49d7] bg-[#0f49d7] text-white"
                        : "border-[#b6c1d7] bg-white"
                    }`}
                  >
                    {active && <Check className="h-3.5 w-3.5" />}
                  </span>
                  <span className="text-[0.95rem] text-[#25324d]">{category}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <p className="text-[0.95rem] font-semibold uppercase tracking-[0.12em] text-[#33415e]">
            Price Range
          </p>
          <div className="mt-4 px-1">
            <input
              type="range"
              min="0"
              max={priceCap}
              step="500"
              value={minPrice}
              onChange={(e) => {
                setMinPrice(Number(e.target.value));
                setPage(1);
              }}
              className="range range-xs range-primary w-full"
            />
            <div className="mt-2 flex items-center justify-between text-[0.82rem] text-[#33415e]">
              <span>Rs {minPrice.toLocaleString("en-IN")}</span>
              <span>Rs {priceCap.toLocaleString("en-IN")}+</span>
            </div>
          </div>
        </div>

        <div>
          <p className="text-[0.95rem] font-semibold uppercase tracking-[0.12em] text-[#33415e]">
            Ratings
          </p>
          <div className="mt-3 space-y-3">
            {[4, 3].map((rating) => (
              <button
                key={rating}
                onClick={() => {
                  setMinRating((prev) => (prev === rating ? 0 : rating));
                  setPage(1);
                }}
                className="flex items-center gap-3 text-left"
              >
                <span
                  className={`h-5 w-5 rounded-full border ${
                    minRating === rating
                      ? "border-[#0f49d7] bg-[#0f49d7]"
                      : "border-[#b6c1d7] bg-white"
                  }`}
                />
                <span className="text-[0.9rem] text-[#25324d]">
                  {"★".repeat(rating)} & Up
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f6f7fb] py-3 text-[#11182d]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-4 flex items-center justify-between gap-3 lg:hidden">
          <button
            onClick={() => setMobileFiltersOpen(true)}
            className="flex items-center gap-2 rounded-[14px] border border-[#d9deeb] bg-white px-3.5 py-2 text-[0.82rem] font-medium text-[#25324d]"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
          </button>

          <div className="relative w-full max-w-[220px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6d7892]" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-10 w-full rounded-[14px] border border-[#d9deeb] bg-white pl-10 pr-3 text-[0.82rem] text-[#11182d] outline-none placeholder:text-[#7c88a2]"
            />
          </div>
        </div>

        {mobileFiltersOpen && (
          <div className="fixed inset-0 z-[60] bg-[#11182d]/25 lg:hidden">
            <div className="ml-auto h-full w-full max-w-sm overflow-y-auto bg-white p-4">
              <div className="mb-4 flex items-center justify-between">
                <p className="text-[1rem] font-semibold text-[#11182d]">Filters</p>
                <button
                  onClick={() => setMobileFiltersOpen(false)}
                  className="rounded-lg p-2 text-[#5c6880]"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              {filterPanel}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
          <aside className="hidden lg:block">{filterPanel}</aside>

          <div className="min-w-0">
            <div className="rounded-[18px] bg-[#eef2ff] px-5 py-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <p className="text-[0.78rem] font-medium uppercase tracking-[0.2em] text-[#33415e]">
                    Home / Shop
                  </p>
                  <h1 className="mt-2 text-[1.9rem] font-semibold tracking-tight text-[#11182d] sm:text-[2.2rem]">
                    The Collection
                  </h1>
                  <p className="mt-2 text-[0.9rem] text-[#42506d]">
                    {searchLoading
                      ? "Searching products..."
                      : `Showing ${startIndex}-${endIndex} of ${filteredProducts.length} results`}
                  </p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <div className="relative hidden w-full min-w-[260px] lg:block">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6d7892]" />
                    <input
                      type="text"
                      placeholder="Search curated collections..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="h-11 w-full rounded-[14px] border border-[#d9deeb] bg-white pl-10 pr-3 text-[0.82rem] text-[#11182d] outline-none placeholder:text-[#7c88a2]"
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-[0.78rem] font-medium uppercase tracking-[0.16em] text-[#33415e]">
                      Sort By:
                    </span>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="h-11 rounded-[14px] border border-[#d9deeb] bg-white px-4 text-[0.9rem] text-[#11182d] outline-none"
                    >
                      <option value="top-rated">Top Rated</option>
                      <option value="price-low">Price: Low to High</option>
                      <option value="price-high">Price: High to Low</option>
                      <option value="name">Name</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {paginatedProducts.length === 0 ? (
              <div className="mt-4 rounded-[18px] border border-[#dfe4ef] bg-white px-5 py-12 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-[14px] bg-[#eef2ff] text-[#0f49d7]">
                  <Search className="h-5 w-5" />
                </div>
                <h2 className="mt-4 text-[1rem] font-semibold text-[#11182d]">
                  No products found
                </h2>
                <p className="mx-auto mt-2 max-w-md text-[0.82rem] leading-6 text-[#62708d]">
                  Try clearing some filters or searching with a different keyword.
                </p>
                <button
                  onClick={handleClearAll}
                  className="mt-4 rounded-[14px] bg-[#0f49d7] px-4 py-2 text-[0.8rem] font-semibold text-white"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <>
                <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
                  {paginatedProducts.map((product) => (
                    <ProductCard
                      key={product._id}
                      product={product}
                      wishlist={wishlist}
                      addingToWishlist={addingToWishlist}
                      toggleWishlist={toggleWishlist}
                    />
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="mt-8 flex justify-center">
                    <div className="flex items-center gap-2 rounded-[16px] bg-[#eef2ff] px-3 py-2">
                      <button
                        onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="flex h-9 w-9 items-center justify-center rounded-[12px] bg-white text-[#11182d] disabled:opacity-40"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>

                      {paginationItems.map((item, index) =>
                        item === "..." ? (
                          <span
                            key={`ellipsis-${index}`}
                            className="px-2 text-[0.88rem] text-[#5c6880]"
                          >
                            ...
                          </span>
                        ) : (
                          <button
                            key={item}
                            onClick={() => setPage(item)}
                            className={`flex h-9 min-w-[36px] items-center justify-center rounded-[12px] px-2 text-[0.88rem] ${
                              currentPage === item
                                ? "bg-[#0f49d7] text-white"
                                : "bg-white text-[#11182d]"
                            }`}
                          >
                            {item}
                          </button>
                        ),
                      )}

                      <button
                        onClick={() =>
                          setPage((prev) => Math.min(prev + 1, totalPages))
                        }
                        disabled={currentPage === totalPages}
                        className="flex h-9 w-9 items-center justify-center rounded-[12px] bg-white text-[#11182d] disabled:opacity-40"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Shop;
