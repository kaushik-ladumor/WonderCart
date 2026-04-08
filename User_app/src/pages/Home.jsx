import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Armchair,
  Dumbbell,
  Gem,
  Heart,
  Home,
  MessageSquare,
  MonitorSmartphone,
  Shirt,
  Sparkles,
  Star,
} from "lucide-react";
import toast from "react-hot-toast";
import Loader from "../components/Loader";
import ChatBotPanel from "../AiFeatures/ChatBot";
import ProductCard from "../components/ProductCard";
import { API_URL } from "../utils/constants";

const categoryConfig = [
  { key: "fashion", label: "Fashion", icon: Shirt },
  { key: "electronics", label: "Gadgets", icon: MonitorSmartphone },
  { key: "home & kitchen", label: "Home", icon: Home },
  { key: "beauty", label: "Beauty", icon: Sparkles },
  { key: "sports", label: "Sports", icon: Dumbbell },
  { key: "luxury", label: "Luxury", icon: Gem },
];

const commitmentPoints = [
  {
    title: "100+ Brands",
    description:
      "Handpicked partners selected for quality, consistency, and design value.",
    icon: Star,
    iconBg: "bg-[#eaf0ff]",
    iconColor: "text-[#0f49d7]",
  },
  {
    title: "Eco-First",
    description:
      "Thoughtful packaging and cleaner delivery choices across our collection.",
    icon: Sparkles,
    iconBg: "bg-[#eaf8ef]",
    iconColor: "text-[#1c8a4a]",
  },
  {
    title: "Expert Curation",
    description:
      "Every product is reviewed for usefulness, build quality, and everyday appeal.",
    icon: Armchair,
    iconBg: "bg-[#eef2fb]",
    iconColor: "text-[#4b5977]",
  },
];

const collectionCards = [
  {
    title: "The Sanctuary Home",
    subtitle: "Elevate your daily environment with silent luxury.",
    image:
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=1200&auto=format&fit=crop&q=80",
    action: "Explore",
    path: "/shop?category=home%20%26%20kitchen",
  },
  {
    title: "Glow Protocol",
    subtitle: "Skincare curation",
    image:
      "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=900&auto=format&fit=crop&q=80",
    path: "/shop?category=beauty",
  },
  {
    title: "Tech Nomadic",
    subtitle: "Essential gadgets",
    image:
      "https://images.unsplash.com/photo-1517430816045-df4b7de11d1d?w=900&auto=format&fit=crop&q=80",
    path: "/shop?category=electronics",
  },
];

const heroImage =
  "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=1200&auto=format&fit=crop&q=80";
const commitmentImage =
  "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1200&auto=format&fit=crop&q=80";

const getCategoryMeta = (category) => {
  const normalized = String(category || "")
    .trim()
    .toLowerCase();
    
  const configMatch = categoryConfig.find((item) => item.key === normalized);

  return {
    key: normalized || "general",
    label: category || "Collection",
    icon: configMatch ? configMatch.icon : Sparkles,
  };
};

const getProductImage = (product) =>
  product?.variants?.find((variant) => variant?.images?.[0])?.images?.[0] ||
  "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=900&auto=format&fit=crop&q=80";

const getSellingPrice = (product) =>
  Math.round(product?.variants?.[0]?.sizes?.[0]?.sellingPrice || 0);

const getOriginalPrice = (product) =>
  Math.round(product?.variants?.[0]?.sizes?.[0]?.originalPrice || 0);

function HomePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [chatOpen, setChatOpen] = useState(false);
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [addingToWishlist, setAddingToWishlist] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const productsRes = await axios.get(`${API_URL}/product/get?limit=8`);
        setTrendingProducts(productsRes.data.data || []);

        const categoriesRes = await axios.get(`${API_URL}/product/categories`);
        setCategories(categoriesRes.data.categories || []);

        const token = localStorage.getItem("token");
        if (token) {
          const wishlistRes = await axios.get(`${API_URL}/wishlist`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (wishlistRes.data.success) {
            setWishlist(
              wishlistRes.data.wishlist?.items
                ?.map((item) => item.product?._id || item.product)
                .filter(Boolean) || [],
            );
          }
        }
      } catch (error) {
        console.error("Home data fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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

  if (loading) return <Loader />;

  const visibleCategories = categories.map((category) => getCategoryMeta(category));

  const featuredProducts = trendingProducts.slice(0, 4);

  return (
    <div className="min-h-screen bg-[#f6f7fb] text-[#11182d]">
      <section className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-4 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-[28px] border border-[#dddff0] bg-[#8d4f33]">
          <div className="grid min-h-[300px] grid-cols-1 lg:grid-cols-[1.05fr_1fr]">
            <div className="flex flex-col justify-center gap-5 px-6 py-8 text-white sm:px-8 lg:px-10">
              <div className="space-y-1">
                <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-white/80">
                  Summer Editorial 2024
                </p>
                <h1 className="max-w-sm text-[1.5rem] font-semibold leading-tight sm:text-[1.75rem]">
                  The Art of Modern Living.
                </h1>
              </div>

              <p className="max-w-md text-[0.82rem] leading-6 text-white/85">
                A meticulously curated collection of essentials designed for the
                discerning individual.
              </p>

              <div>
                <button
                  onClick={() => navigate("/shop")}
                  className="rounded-xl bg-[#0f49d7] px-5 py-3 text-[0.82rem] font-semibold text-white"
                >
                  Shop Collection
                </button>
              </div>
            </div>

            <div className="relative hidden min-h-[300px] lg:block">
              <div className="absolute inset-y-0 right-[20%] w-[18%] bg-[#7c3f24]" />
              <div className="absolute inset-y-0 right-[8%] w-[4%] bg-[#e4c3ad]" />
              <div className="absolute bottom-0 left-0 right-0 h-20 bg-[#744028]" />
              <div className="absolute bottom-0 left-[8%] h-14 w-24 rounded-t-sm bg-[#573124]" />
              <div className="absolute bottom-0 left-[28%] h-8 w-40 rounded-t-[999px] bg-[#d7b79a]" />
              <img
                src={heroImage}
                alt="Featured collection"
                className="absolute bottom-0 left-[18%] h-[68%] w-[56%] object-cover mix-blend-multiply"
              />
            </div>
          </div>
        </div>

        <div className="flex overflow-x-auto gap-3 rounded-[20px] border border-[#e2e6f3] bg-white p-2 sm:p-3 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {visibleCategories.map((category) => {
            const Icon = category.icon;

            return (
              <button
                key={category.key}
                onClick={() =>
                  navigate(`/shop?category=${encodeURIComponent(category.label)}`)
                }
                className="flex flex-col items-center justify-center gap-3 rounded-2xl px-2 py-4 sm:px-3 text-center min-w-[96px] sm:min-w-[110px] lg:min-w-0 lg:flex-1 shrink-0 snap-start hover:bg-[#f8f9fc] transition-colors"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#edf2ff] text-[#0f49d7] shadow-sm">
                  <Icon className="h-5 w-5" />
                </span>
                <span className="text-[0.72rem] sm:text-[0.76rem] font-medium uppercase tracking-[0.18em] text-[#3f4b67]">
                  {category.label}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-[1.1rem] font-semibold text-[#11182d] sm:text-[1.2rem]">
              Trending Now
            </h2>
            <p className="mt-1 text-[0.82rem] text-[#62708d]">
              Selected by our expert curators this week.
            </p>
          </div>
          <button
            onClick={() => navigate("/shop")}
            className="text-[0.82rem] font-semibold text-[#0f49d7]"
          >
            View All Trends
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {featuredProducts.map((product) => (
            <ProductCard
              key={product._id}
              product={product}
              wishlist={wishlist}
              addingToWishlist={addingToWishlist}
              toggleWishlist={toggleWishlist}
            />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <div className="grid overflow-hidden rounded-[22px] border border-[#dde4f2] bg-white lg:grid-cols-[1.05fr_1fr]">
          <div className="min-h-[260px] bg-[#d8c8b4]">
            <img
              src={commitmentImage}
              alt="WonderCart commitment"
              className="h-full w-full object-cover"
            />
          </div>

          <div className="space-y-5 bg-[#edf2ff] px-6 py-6 sm:px-8">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#0f49d7]">
                Our Commitment
              </p>
              <h2 className="mt-2 text-[1.2rem] font-semibold text-[#11182d]">
                Curating the exceptional, for every space.
              </h2>
            </div>

            <div className="space-y-4">
              {commitmentPoints.map((point) => {
                const Icon = point.icon;

                return (
                  <div key={point.title} className="flex items-start gap-3">
                    <span
                      className={`mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl ${point.iconBg} ${point.iconColor}`}
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                    <div>
                      <h3 className="text-[0.82rem] font-semibold text-[#11182d]">
                        {point.title}
                      </h3>
                      <p className="mt-1 text-[0.82rem] leading-6 text-[#62708d]">
                        {point.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-4 pb-10 sm:px-6 lg:px-8">
        <div className="mb-4">
          <h2 className="text-[1.1rem] font-semibold text-[#11182d] sm:text-[1.2rem]">
            Recommended Collections
          </h2>
          <p className="mt-1 text-[0.82rem] text-[#62708d]">
            Tailored specifically to your aesthetic profile.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[2.1fr_1fr]">
          <Link
            to={collectionCards[0].path}
            className="relative overflow-hidden rounded-[22px] border border-[#dde4f2] bg-[#d9dbdd]"
          >
            <img
              src={collectionCards[0].image}
              alt={collectionCards[0].title}
              className="h-full min-h-[320px] w-full object-cover"
            />
            <div className="absolute inset-x-0 bottom-0 bg-[#11182d]/55 px-6 py-6 text-white">
              <h3 className="text-[1.2rem] font-semibold">
                {collectionCards[0].title}
              </h3>
              <p className="mt-2 max-w-md text-[0.82rem] text-white/85">
                {collectionCards[0].subtitle}
              </p>
              <span className="mt-4 inline-flex rounded-xl bg-white px-4 py-2 text-[0.82rem] font-semibold text-[#11182d]">
                {collectionCards[0].action}
              </span>
            </div>
          </Link>

          <div className="grid gap-4">
            {collectionCards.slice(1).map((card) => (
              <Link
                key={card.title}
                to={card.path}
                className="relative overflow-hidden rounded-[22px] border border-[#dde4f2] bg-[#d9dbdd]"
              >
                <img
                  src={card.image}
                  alt={card.title}
                  className="h-[198px] w-full object-cover"
                />
                <div className="absolute inset-x-0 bottom-0 bg-[#11182d]/55 px-5 py-4 text-white">
                  <h3 className="text-[1.1rem] font-semibold">{card.title}</h3>
                  <p className="mt-1 text-[0.82rem] text-white/85">{card.subtitle}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {!chatOpen && (
        <button
          onClick={() => setChatOpen(true)}
          aria-label="Open chat"
          className="fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#11182d] text-white shadow-[0_10px_24px_rgba(17,24,45,0.16)]"
        >
          <MessageSquare className="h-5 w-5" strokeWidth={2.3} />
        </button>
      )}

      {chatOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-[#11182d]/35"
            onClick={() => setChatOpen(false)}
          />
          <div className="fixed right-0 top-0 z-50 h-full w-full bg-white sm:w-[420px] md:w-[480px]">
            <ChatBotPanel onClose={() => setChatOpen(false)} />
          </div>
        </>
      )}
    </div>
  );
}

export default HomePage;
