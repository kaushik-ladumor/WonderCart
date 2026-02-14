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
        <div className="max-w-6xl mx-auto px-4 py-10 md:py-14">
          <div className="max-w-2xl">
            <span className="inline-block px-3 py-1 bg-white text-black text-xs font-semibold rounded mb-3">
              NEW SEASON • 2026
            </span>
            <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-3">
              Minimal.
              <br />
              Timeless.
              <br />
              Yours.
            </h1>
            <p className="text-gray-300 mb-4 max-w-lg text-sm">
              Curated essentials for the modern lifestyle. Thoughtfully
              designed, built to last, made for you.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link to="/products">
                <button className="inline-flex items-center gap-2 bg-white text-black px-5 py-2 rounded font-medium hover:bg-gray-100 transition w-full sm:w-auto text-sm">
                  Shop Collection
                  <ChevronRight className="w-4 h-4" />
                </button>
              </Link>
              <Link to="/about">
                <button className="inline-flex items-center gap-2 border border-white/30 text-white px-5 py-2 rounded font-medium hover:bg-white/10 transition w-full sm:w-auto text-sm">
                  Our Story
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* TRUST FEATURES */}
      <section className="py-8 border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <Truck className="w-5 h-5 mx-auto mb-2 text-black" />
              <h3 className="font-semibold text-xs text-gray-900 uppercase tracking-wider">
                Free Shipping
              </h3>
              <p className="text-[10px] text-gray-500 uppercase tracking-tighter">
                On orders above ₹999
              </p>
            </div>
            <div>
              <Shield className="w-5 h-5 mx-auto mb-2 text-black" />
              <h3 className="font-semibold text-xs text-gray-900 uppercase tracking-wider">
                Secure Payments
              </h3>
              <p className="text-[10px] text-gray-500 uppercase tracking-tighter">
                100% protected
              </p>
            </div>
            <div>
              <Zap className="w-5 h-5 mx-auto mb-2 text-black" />
              <h3 className="font-semibold text-xs text-gray-900 uppercase tracking-wider">
                Fast Delivery
              </h3>
              <p className="text-[10px] text-gray-500 uppercase tracking-tighter">
                2–4 business days
              </p>
            </div>
            <div>
              <Tag className="w-5 h-5 mx-auto mb-2 text-black" />
              <h3 className="font-semibold text-xs text-gray-900 uppercase tracking-wider">
                Easy Returns
              </h3>
              <p className="text-[10px] text-gray-500 uppercase tracking-tighter">
                30-day guarantee
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* BRAND PHILOSOPHY */}
      <section className="py-10 bg-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-3 uppercase tracking-tight">
            Designed for today. Built for tomorrow.
          </h2>
          <p className="text-gray-500 text-xs mb-6 max-w-2xl mx-auto leading-relaxed">
            We believe in creating products that become part of your daily
            ritual. No trends. No compromise. Just timeless essentials that work
            harder, look better, and last longer.
          </p>
          <div className="flex justify-center">
            <Link to="/products">
              <button className="inline-flex items-center gap-2 bg-black text-white px-5 py-2 rounded font-medium hover:bg-gray-800 transition text-sm">
                Explore the collection
                <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* VALUES */}
      <section className="py-10 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-1 uppercase tracking-tight">
              Why shop with us
            </h2>
            <p className="text-gray-500 text-xs uppercase tracking-widest">
              Quality isn't just a promise. It's our standard.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-5 rounded border border-gray-100">
              <div className="w-8 h-8 bg-black rounded flex items-center justify-center mb-3">
                <Star className="w-4 h-4 text-white" />
              </div>
              <h3 className="font-semibold text-sm text-gray-900 mb-1 uppercase tracking-wider">
                Premium Quality
              </h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Every product is hand-picked and tested for durability, comfort,
                and finish.
              </p>
            </div>

            <div className="bg-white p-5 rounded border border-gray-100">
              <div className="w-8 h-8 bg-black rounded flex items-center justify-center mb-3">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <h3 className="font-semibold text-sm text-gray-900 mb-1 uppercase tracking-wider">
                2 Year Warranty
              </h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                We stand behind our products. If something's wrong, we make it
                right.
              </p>
            </div>

            <div className="bg-white p-5 rounded border border-gray-100">
              <div className="w-8 h-8 bg-black rounded flex items-center justify-center mb-3">
                <Tag className="w-4 h-4 text-white" />
              </div>
              <h3 className="font-semibold text-sm text-gray-900 mb-1 uppercase tracking-wider">
                Fair Pricing
              </h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                No inflated markups. Just honest prices for exceptional
                products.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* QUOTE / TESTIMONIAL */}
      <section className="py-10 bg-white">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <div className="text-3xl text-gray-200 mb-2">"</div>
          <p className="text-base text-gray-900 font-medium mb-4 italic tracking-tight">
            The best things in life aren't things. But when you need them, they
            should be exceptional.
          </p>
          <p className="text-xs text-gray-500 uppercase tracking-[0.2em]">
            — Our promise
          </p>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-10 bg-black text-white">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h2 className="text-xl font-bold mb-2 uppercase tracking-tight">
            Ready for something better?
          </h2>
          <p className="text-gray-400 text-xs mb-6 max-w-xl mx-auto uppercase tracking-wide">
            Join thousands of customers who've made the switch to mindful,
            quality essentials.
          </p>
          <Link to="/products">
            <button className="inline-flex items-center gap-2 bg-white text-black px-6 py-2.5 rounded font-medium hover:bg-gray-100 transition text-sm">
              Start shopping
              <ChevronRight className="w-4 h-4" />
            </button>
          </Link>
          <p className="text-[10px] text-gray-500 mt-4 uppercase tracking-[0.2em]">
            Free shipping on orders above ₹999
          </p>
        </div>
      </section>
    </div>
  );
}

export default HomePage;
