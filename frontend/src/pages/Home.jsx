import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Truck,
  Shield,
  Zap,
  Tag,
  ChevronRight,
  ArrowRight,
  Star,
} from "lucide-react";
import Loader from "../components/Loader";

function HomePage() {
  const [loading] = useState(false);

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen bg-white">
      {/* HERO - Clean & Bold */}
      <section className="bg-black text-white">
        <div className="max-w-6xl mx-auto px-4 py-14 md:py-20">
          <div className="max-w-2xl">
            <span className="inline-block px-3 py-1 bg-white text-black text-xs font-semibold rounded mb-4">
              NEW SEASON • 2026
            </span>
            <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-4">
              Minimal.
              <br />
              Timeless.
              <br />
              Yours.
            </h1>
            <p className="text-gray-300 mb-6 max-w-lg">
              Curated essentials for the modern lifestyle. Thoughtfully
              designed, built to last, made for you.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link to="/products">
                <button className="inline-flex items-center gap-2 bg-white text-black px-5 py-2.5 rounded font-medium hover:bg-gray-100 transition w-full sm:w-auto">
                  Shop Collection
                  <ChevronRight className="w-4 h-4" />
                </button>
              </Link>
              <Link to="/about">
                <button className="inline-flex items-center gap-2 border border-white/30 text-white px-5 py-2.5 rounded font-medium hover:bg-white/10 transition w-full sm:w-auto">
                  Our Story
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* TRUST FEATURES */}
      <section className="py-10 border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <Truck className="w-6 h-6 mx-auto mb-2 text-black" />
              <h3 className="font-semibold text-sm text-gray-900">
                Free Shipping
              </h3>
              <p className="text-xs text-gray-600">On orders above ₹999</p>
            </div>
            <div>
              <Shield className="w-6 h-6 mx-auto mb-2 text-black" />
              <h3 className="font-semibold text-sm text-gray-900">
                Secure Payments
              </h3>
              <p className="text-xs text-gray-600">100% protected</p>
            </div>
            <div>
              <Zap className="w-6 h-6 mx-auto mb-2 text-black" />
              <h3 className="font-semibold text-sm text-gray-900">
                Fast Delivery
              </h3>
              <p className="text-xs text-gray-600">2–4 business days</p>
            </div>
            <div>
              <Tag className="w-6 h-6 mx-auto mb-2 text-black" />
              <h3 className="font-semibold text-sm text-gray-900">
                Easy Returns
              </h3>
              <p className="text-xs text-gray-600">30-day guarantee</p>
            </div>
          </div>
        </div>
      </section>

      {/* BRAND PHILOSOPHY */}
      <section className="py-14 bg-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Designed for today. Built for tomorrow.
          </h2>
          <p className="text-gray-600 text-sm mb-8 max-w-2xl mx-auto">
            We believe in creating products that become part of your daily
            ritual. No trends. No compromise. Just timeless essentials that work
            harder, look better, and last longer.
          </p>
          <div className="flex justify-center">
            <Link to="/products">
              <button className="inline-flex items-center gap-2 bg-black text-white px-5 py-2.5 rounded font-medium hover:bg-gray-800 transition">
                Explore the collection
                <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* VALUES */}
      <section className="py-14 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Why shop with us
            </h2>
            <p className="text-gray-600 text-sm">
              Quality isn't just a promise. It's our standard.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded border border-gray-100">
              <div className="w-10 h-10 bg-black rounded flex items-center justify-center mb-4">
                <Star className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Premium Quality
              </h3>
              <p className="text-sm text-gray-600">
                Every product is hand-picked and tested for durability, comfort,
                and finish.
              </p>
            </div>

            <div className="bg-white p-6 rounded border border-gray-100">
              <div className="w-10 h-10 bg-black rounded flex items-center justify-center mb-4">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">
                2 Year Warranty
              </h3>
              <p className="text-sm text-gray-600">
                We stand behind our products. If something's wrong, we make it
                right.
              </p>
            </div>

            <div className="bg-white p-6 rounded border border-gray-100">
              <div className="w-10 h-10 bg-black rounded flex items-center justify-center mb-4">
                <Tag className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Fair Pricing</h3>
              <p className="text-sm text-gray-600">
                No inflated markups. Just honest prices for exceptional
                products.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* QUOTE / TESTIMONIAL */}
      <section className="py-14 bg-white">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <div className="text-4xl text-gray-300 mb-4">"</div>
          <p className="text-lg md:text-xl text-gray-900 font-medium mb-6">
            The best things in life aren't things. But when you need them, they
            should be exceptional.
          </p>
          <p className="text-sm text-gray-600">— Our promise to you</p>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-14 bg-black text-white">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold mb-3">
            Ready for something better?
          </h2>
          <p className="text-gray-300 text-sm mb-6 max-w-xl mx-auto">
            Join thousands of customers who've made the switch to mindful,
            quality essentials.
          </p>
          <Link to="/products">
            <button className="inline-flex items-center gap-2 bg-white text-black px-6 py-3 rounded font-medium hover:bg-gray-100 transition">
              Start shopping
              <ChevronRight className="w-4 h-4" />
            </button>
          </Link>
          <p className="text-xs text-gray-400 mt-4">
            Free shipping on all orders above ₹999
          </p>
        </div>
      </section>
    </div>
  );
}

export default HomePage;
