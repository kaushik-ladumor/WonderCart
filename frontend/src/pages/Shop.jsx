import { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { Package, Search, Filter, X } from "lucide-react";
import ProductCard from "../components/ProductCard";
import Loader from "../components/Loader";
import { API_URL } from "../utils/constants";

function Shop() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [wishlist, setWishlist] = useState([]);
  const [addingToWishlist, setAddingToWishlist] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("default");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // Fetch all products and categories on initial load
  useEffect(() => {
    fetchAllProducts();
    fetchCategories();
  }, []);

  // Fetch wishlist if logged in
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetchWishlist(token);
    }
  }, []);

  // Debounced search API call
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery.trim().length > 0) {
        performSearch(searchQuery);
      } else if (searchQuery.trim() === "") {
        // If search is cleared, show all products
        if (selectedCategory === "all") {
          fetchAllProducts();
        } else {
          filterByCategory(selectedCategory);
        }
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  // Sort products when sortBy changes
  useEffect(() => {
    if (products.length > 0) {
      sortProducts(sortBy);
    }
  }, [sortBy, products.length]);

  const fetchAllProducts = (
    pageNum = 1,
    append = false,
    category = selectedCategory,
  ) => {
    if (pageNum === 1) setLoading(true);
    else setLoadingMore(true);

    const token =
      localStorage.getItem("token") || localStorage.getItem("authToken");
    const config = token
      ? { headers: { Authorization: `Bearer ${token}` } }
      : {};

    const categoryParam =
      category !== "all" ? `&category=${encodeURIComponent(category)}` : "";
    axios
      .get(
        `${API_URL}/product/get?page=${pageNum}&limit=8${categoryParam}`,
        config,
      )
      .then((res) => {
        const productList = res.data.data || [];
        const pagination = res.data.pagination;

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

        setLoading(false);
        setLoadingMore(false);
      })
      .catch((err) => {
        console.error(err);
        toast.error("Failed to load products");
        setLoading(false);
        setLoadingMore(false);
      });
  };

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchAllProducts(nextPage, true, selectedCategory);
  };

  const fetchCategories = async () => {
    try {
      const res = await axios.get(`${API_URL}/product/categories`);
      setCategories(res.data.categories || []);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  };

  const performSearch = async (query) => {
    if (!query.trim()) return;

    setSearchLoading(true);
    const token =
      localStorage.getItem("token") || localStorage.getItem("authToken");
    const config = token
      ? { headers: { Authorization: `Bearer ${token}` } }
      : {};

    try {
      const encodedQuery = encodeURIComponent(query);
      const res = await axios.get(
        `${API_URL}/product/query/search?query=${encodedQuery}`,
        config,
      );

      if (res.data.success) {
        const searchResults = res.data.data || res.data.products || [];
        setProducts(searchResults);
      } else {
        setProducts([]);
      }
    } catch (error) {
      console.error("Search error:", error);
      toast.error("Failed to search products");
      setProducts([]);
    } finally {
      setSearchLoading(false);
    }
  };

  const filterByCategory = async (category) => {
    setSelectedCategory(category);
    setPage(1);
    fetchAllProducts(1, false, category);
  };

  const sortProducts = (sortType) => {
    const sorted = [...products];

    switch (sortType) {
      case "price-low":
        sorted.sort(
          (a, b) => getLowestPrice(a.variants) - getLowestPrice(b.variants),
        );
        break;
      case "price-high":
        sorted.sort(
          (a, b) => getLowestPrice(b.variants) - getLowestPrice(a.variants),
        );
        break;
      case "name-asc":
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "name-desc":
        sorted.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case "rating":
        sorted.sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0));
        break;
      default:
        return;
    }

    setProducts(sorted);
  };

  const getLowestPrice = (variants) => {
    if (!variants?.length) return 0;
    let lowest = Infinity;
    variants.forEach((variant) => {
      variant.sizes?.forEach((size) => {
        const finalPrice = size.sellingPrice || size.originalPrice || 0;
        if (finalPrice < lowest) lowest = finalPrice;
      });
    });
    return lowest === Infinity ? 0 : lowest;
  };

  const fetchWishlist = async (token) => {
    try {
      const res = await axios.get(`${API_URL}/wishlist`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        const ids = res.data.wishlist?.items?.map((item) => item.product) || [];
        setWishlist(ids);
      }
    } catch (err) {
      console.error(err);
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
        toast.success("Added to wishlist!");
      }
    } catch (err) {
      toast.error("Failed to update wishlist");
    } finally {
      setAddingToWishlist((prev) => ({ ...prev, [product._id]: false }));
    }
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setPage(1);
    fetchAllProducts(1, false);
  };

  const handleClearFilters = () => {
    setSelectedCategory("all");
    setSortBy("default");
    setSearchQuery("");
    setPage(1);
    fetchAllProducts(1, false);
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="min-h-screen bg-[#f9f9ff] pt-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Mobile Filter Bar */}
        <div className="lg:hidden flex items-center gap-2 mb-6 overflow-x-auto pb-2 custom-scrollbar">
          <button
            onClick={handleClearFilters}
            className={`whitespace-nowrap px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
              selectedCategory === "all"
                ? "bg-[#004ac6] text-white"
                : "bg-[#f0f4ff] text-[#5c6880]"
            }`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => filterByCategory(cat)}
              className={`whitespace-nowrap px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
                selectedCategory === cat
                  ? "bg-[#004ac6] text-white"
                  : "bg-[#f0f4ff] text-[#5c6880]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Sidebar - Desktop Only with refined styling */}
          <aside className="hidden lg:block w-48 lg:w-64 shrink-0">
            <div className="bg-white rounded-[2rem] p-8 border border-[#f0f4ff] shadow-tonal-sm sticky top-24">
              <h3 className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#004ac6] mb-6">
                Selection
              </h3>
              <div className="flex flex-col gap-2">
                <button
                  onClick={handleClearFilters}
                  className={`text-xs font-bold uppercase tracking-widest px-4 py-3 rounded-xl transition-all text-left ${
                    selectedCategory === "all"
                      ? "bg-[#141b2d] text-white shadow-lg shadow-black/10"
                      : "text-[#5c6880] hover:bg-[#f0f4ff]"
                  }`}
                >
                  All Artifacts
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => filterByCategory(cat)}
                    className={`text-xs font-bold uppercase tracking-widest px-4 py-3 rounded-xl transition-all text-left ${
                      selectedCategory === cat
                        ? "bg-[#141b2d] text-white shadow-lg shadow-black/10"
                        : "text-[#5c6880] hover:bg-[#f0f4ff]"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="mt-10 pt-8 border-t border-[#f0f4ff]">
                <h3 className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#004ac6] mb-6">
                  Sortation
                </h3>
                <div className="space-y-2">
                   {['default', 'price-low', 'price-high', 'rating'].map((sort) => (
                      <button
                        key={sort}
                        onClick={() => setSortBy(sort)}
                        className={`w-full text-left px-4 py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${
                          sortBy === sort ? 'bg-[#f0f4ff] text-[#004ac6]' : 'text-[#5c6880] hover:text-[#141b2d]'
                        }`}
                      >
                         {sort === 'default' ? 'Relevant' : sort.replace('-', ': ')}
                      </button>
                   ))}
                </div>
              </div>

              <div className="mt-10 p-5 bg-[#f0f4ff] rounded-2xl">
                 <p className="text-[10px] text-[#004ac6] font-bold uppercase tracking-widest mb-2">Editor's Tip</p>
                 <p className="text-[10px] text-[#5c6880] leading-relaxed">Filter by category to discover pieces curated for your specific lifestyle needs.</p>
              </div>
            </div>
          </aside>

          {/* Main Content Area */}
          <div className="flex-1 min-w-0">
            {/* Header Area with refined search */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 pb-4 border-b border-[#f0f4ff]">
              <div>
                <span className="text-[10px] text-[#004ac6] font-bold uppercase tracking-[0.3em] mb-2 block">Curation</span>
                <h2 className="font-display text-4xl font-extrabold text-[#141b2d] tracking-tight">
                  {selectedCategory === "all" ? "The Full Collection" : selectedCategory}
                </h2>
              </div>

              <div className="flex items-center gap-4">
                 <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5c6880] group-focus-within:text-[#004ac6] transition-colors" />
                    <input
                      type="text"
                      placeholder="Find an artifact..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full md:w-64 pl-12 pr-4 py-3.5 bg-white border border-[#f0f4ff] rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#004ac6]/5 text-sm text-[#141b2d] placeholder:text-[#5c6880]/40 transition-all font-body"
                    />
                 </div>
              </div>
            </div>

            {/* Products Grid with consistent gap and rounded cards */}
            {products.length === 0 ? (
              <div className="text-center py-24 bg-white rounded-[2.5rem] border border-[#f0f4ff] shadow-tonal-sm">
                <div className="w-20 h-20 bg-[#f0f4ff] rounded-[2rem] flex items-center justify-center mx-auto mb-6 text-[#004ac6]">
                   <Package className="w-8 h-8" />
                </div>
                <h3 className="font-display text-2xl font-bold text-[#141b2d] tracking-tight">Curation Empty</h3>
                <p className="text-sm text-[#5c6880] mt-2 max-w-xs mx-auto px-4 leading-relaxed">Nothing matches your current criteria in our selection. Consider resetting filters.</p>
                <button
                  onClick={handleClearFilters}
                  className="mt-8 bg-[#141b2d] text-white font-bold px-10 py-4 rounded-2xl hover:bg-[#004ac6] hover:-translate-y-1 transition-all text-[11px] uppercase tracking-[0.2em] shadow-xl shadow-black/10"
                >
                  Clear Selection
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
                {products.map((product) => (
                  <ProductCard
                    key={product._id}
                    product={product}
                    wishlist={wishlist}
                    addingToWishlist={addingToWishlist}
                    toggleWishlist={toggleWishlist}
                  />
                ))}
              </div>
            )}

            {/* Pagination with refined primary button */}
            {products.length > 0 && hasMore && !searchQuery && (
              <div className="mt-20 text-center pb-20">
                <button
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="group relative inline-flex items-center gap-3 px-10 py-4 bg-white border border-[#f0f4ff] rounded-2xl font-display font-bold text-xs uppercase tracking-[0.2em] text-[#141b2d] hover:bg-[#141b2d] hover:text-white transition-all shadow-tonal-sm hover:shadow-tonal-md active:scale-95 disabled:opacity-50"
                >
                  {loadingMore ? (
                    <div className="w-4 h-4 border-2 border-[#141b2d] border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      Explore More
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Shop;
