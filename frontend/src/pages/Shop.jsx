import { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { Package, Search, Filter, X } from "lucide-react";
import ProductCard from "../components/ProductCard";
import Loader from "../components/Loader";

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
  }, [sortBy]);

  const fetchAllProducts = () => {
    setLoading(true);
    const token =
      localStorage.getItem("token") || localStorage.getItem("authToken");
    const config = token
      ? { headers: { Authorization: `Bearer ${token}` } }
      : {};

    axios
      .get("http://localhost:4000/product/get", config)
      .then((res) => {
        const productList = res.data.data || res.data;
        setProducts(productList);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        toast.error("Failed to load products");
        setLoading(false);
      });
  };

  const fetchCategories = async () => {
    try {
      const res = await axios.get("http://localhost:4000/product/categories");
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
        `http://localhost:4000/product/query/search?query=${encodedQuery}`,
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
    setLoading(true);

    if (category === "all") {
      fetchAllProducts();
      return;
    }

    const token =
      localStorage.getItem("token") || localStorage.getItem("authToken");
    const config = token
      ? { headers: { Authorization: `Bearer ${token}` } }
      : {};

    try {
      const res = await axios.get(
        `http://localhost:4000/product/query/category?category=${category}`,
        config,
      );
      setProducts(res.data.data || res.data.products || []);
    } catch (error) {
      console.error("Filter error:", error);
      toast.error("Failed to filter products");
    } finally {
      setLoading(false);
    }
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
      const res = await axios.get("http://localhost:4000/wishlist", {
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
        await axios.delete(
          `http://localhost:4000/wishlist/remove/${product._id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        setWishlist((prev) => prev.filter((id) => id !== product._id));
        toast.success("Removed from wishlist");
      } else {
        await axios.post(
          "http://localhost:4000/wishlist/add",
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
    fetchAllProducts();
  };

  const handleClearFilters = () => {
    setSelectedCategory("all");
    setSortBy("default");
    setSearchQuery("");
    fetchAllProducts();
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Search Bar */}
      <div className="sticky top-0 z-30 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center gap-3">
            {/* Mobile Filter Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="md:hidden flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700"
            >
              <Filter className="w-4 h-4" />
              <span className="text-xs font-medium">Filter</span>
            </button>

            {/* Search Input */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="search"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-sm text-gray-900 placeholder-gray-500 bg-white"
              />
              {searchLoading && (
                <div className="absolute right-10 top-1/2 transform -translate-y-1/2">
                  <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-gray-600"></div>
                </div>
              )}
              {searchQuery && !searchLoading && (
                <button
                  onClick={handleClearSearch}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Mobile Filters Panel */}
          {showFilters && (
            <div className="md:hidden mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-900 mb-1">
                    Sort By
                  </label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black text-gray-900 bg-white"
                  >
                    <option value="default">Default</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="name-asc">Name: A to Z</option>
                    <option value="name-desc">Name: Z to A</option>
                    <option value="rating">Rating</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-900 mb-1">
                    Category
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => filterByCategory(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black text-gray-900 bg-white"
                  >
                    <option value="all">All Categories</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-5">
        {/* Desktop Filters & Info Bar */}
        <div className="hidden md:flex items-center justify-between mb-5">
          <div className="flex items-center gap-4">
            {/* Category Filters */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleClearFilters}
                className={`px-3 py-1.5 text-xs rounded border ${selectedCategory === "all"
                    ? "bg-black text-white border-black"
                    : "border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}
              >
                All
              </button>
              {categories.slice(0, 5).map((cat) => (
                <button
                  key={cat}
                  onClick={() => filterByCategory(cat)}
                  className={`px-3 py-1.5 text-xs rounded border ${selectedCategory === cat
                      ? "bg-black text-white border-black"
                      : "border-gray-300 text-gray-700 hover:bg-gray-50"
                    }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Sort Options */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-700">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-black text-gray-900 bg-white"
            >
              <option value="default">Default</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="name-asc">Name: A to Z</option>
              <option value="name-desc">Name: Z to A</option>
              <option value="rating">Rating</option>
            </select>
          </div>
        </div>

        {/* Results Header */}
        {(searchQuery || selectedCategory !== "all") && (
          <div className="mb-4">
            <h2 className="text-base font-semibold text-gray-900">
              {searchQuery ? (
                <>
                  Search results for "{searchQuery}" ({products.length} product
                  {products.length !== 1 ? "s" : ""})
                </>
              ) : (
                <>
                  {selectedCategory === "all"
                    ? "All Products"
                    : selectedCategory}{" "}
                  ({products.length} product{products.length !== 1 ? "s" : ""})
                </>
              )}
            </h2>
          </div>
        )}

        {/* Products Grid */}
        <section className="py-5">
          {products.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-10 h-10 mx-auto text-gray-300 mb-3" />
              <h2 className="text-base font-semibold text-gray-900 mb-2">
                {searchQuery ? "No products found" : "No products available"}
              </h2>
              <p className="text-gray-600 text-sm mb-4">
                {searchQuery
                  ? "Try a different search term"
                  : "Check back soon for new arrivals!"}
              </p>
              <button
                onClick={handleClearFilters}
                className="px-4 py-2 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition text-sm"
              >
                View All Products
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
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
        </section>
      </div>
    </div>
  );
}

export default Shop;
