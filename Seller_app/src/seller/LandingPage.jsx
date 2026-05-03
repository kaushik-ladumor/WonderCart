import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Store,
  ChevronRight,
  ArrowRight,
  BarChart3,
  Truck,
  ShieldCheck,
  Globe2,
  DollarSign,
  Zap,
  Users,
  TrendingUp,
  Clock,
  Star,
  Quote,
  ChevronLeft,
  Search,
  LayoutDashboard,
  Rocket,
  Menu,
  X
} from "lucide-react";

// --- Components ---

const Navbar = () => {
  return (
    <nav className="sticky top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-[#e1e5f1] font-poppins">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-28">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-4 group shrink-0">
            <img 
              src="/WonderCart Logo.png" 
              alt="WonderCart" 
              className="h-16 sm:h-20 w-auto object-contain"
            />
            <div className="h-12 w-px bg-[#e1e5f1] mx-1 hidden sm:block"></div>
            <span className="text-[1.1rem] font-bold text-[#11182d] uppercase tracking-[0.18em] hidden sm:block">
              Seller <span className="text-[#0f49d7]">Portal</span>
            </span>
          </Link>

          {/* Buttons */}
          <div className="flex items-center gap-4 sm:gap-8 shrink-0">
            <button
              onClick={() => document.getElementById("login_modal")?.showModal()}
              className="text-[1rem] font-bold text-[#11182d] hover:text-[#0f49d7] transition-colors uppercase tracking-wider"
            >
              Login
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

const Hero = () => {
  return (
    <section className="bg-white pt-4 pb-12 lg:pt-8 lg:pb-24 overflow-hidden font-poppins">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-[1.2fr_1fr] gap-8 lg:gap-4 items-start">
          <div className="w-full text-center lg:text-left pr-0">
            <h1 className="text-[2rem] lg:text-[3.2rem] font-black text-[#11182d] mb-6 leading-[1.15] tracking-tight">
              The smartest way to <br className="hidden lg:block" /> scale your brand online.
            </h1>
            <p className="text-[1.1rem] text-[#6d7892] mb-8 lg:mb-10 leading-relaxed max-w-lg mx-auto lg:mx-0">
              Reach millions of active buyers across India. Manage your entire business from a single intuitive dashboard with zero upfront costs. Join 1.5 Lakh+ successful sellers today.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
              <Link
                to="/signup"
                className="w-full sm:w-auto px-8 py-3.5 bg-[#0f49d7] text-white font-bold rounded-[14px] hover:bg-[#003da3] transition-colors shadow-md text-center"
              >
                Start Selling Now
              </Link>
              <button className="w-full sm:w-auto px-8 py-3.5 bg-[#f6f7fb] text-[#11182d] border border-[#d7dcea] font-bold rounded-[14px] hover:bg-[#e1e5f1] transition-colors text-center">
                Explore Features
              </button>
            </div>
          </div>
          <div className="relative mt-8 lg:mt-0 flex justify-center lg:justify-start">
            <div className="w-[85%] lg:w-[90%] rounded-2xl overflow-hidden shadow-xl border border-gray-100">
              <img
                src="/seller_hero.png"
                alt="Seller working"
                className="w-full h-auto object-cover max-h-[350px] lg:max-h-[400px]"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const StatsBar = () => {
  const stats = [
    { label: "Active Buyers", value: "2 Crore+", icon: Users },
    { label: "Active Sellers", value: "1.5 Lakh+", icon: Store },
    { label: "Maximum Margin", value: "85%", icon: TrendingUp },
    { label: "Fast Payout", value: "7 Days", icon: Clock },
  ];

  return (
    <section id="statistics" className="bg-white border-y border-[#e1e5f1] py-10 lg:py-12 font-poppins">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
          {stats.map((stat, i) => (
            <div key={i} className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-4 p-4 rounded-[18px] hover:bg-[#f6f7fb] transition-colors cursor-default">
              <div className="h-12 w-12 sm:h-14 sm:w-14 bg-[#f0f4ff] rounded-2xl flex items-center justify-center text-[#0f49d7] shrink-0">
                <stat.icon className="h-6 w-6 sm:h-7 sm:w-7" />
              </div>
              <div className="flex flex-col justify-center">
                <span className="text-[1.5rem] font-bold text-[#11182d] leading-none mb-1.5">{stat.value}</span>
                <span className="text-[0.82rem] font-semibold text-[#6d7892] tracking-wide">{stat.label}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const Benefits = () => {
  const features = [
    { title: "High profit margins", description: "Our low commission structure ensures you keep more of what you earn.", icon: DollarSign },
    { title: "Seller discounts", description: "Access exclusive vendor pricing and promotional tools to boost your brand.", icon: Zap },
    { title: "Shipping handling", description: "End-to-end logistics support with reliable partners across 19k+ pin codes.", icon: Truck },
    { title: "Live dashboard", description: "Monitor your performance in real-time with comprehensive stats and tools.", icon: LayoutDashboard },
    { title: "Featured promotions", description: "Get your brand noticed with homepage placements and targeted ads.", icon: ShieldCheck },
    { title: "Pan-India reach", description: "Break geographical barriers and sell to millions in every corner.", icon: Globe2 }
  ];

  return (
    <section id="platform" className="py-16 lg:py-24 bg-[#f6f7fb] border-y border-[#e1e5f1] font-poppins">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12 md:mb-16 text-center lg:text-left">
          <span className="text-[#0f49d7] font-bold tracking-widest text-[0.82rem] uppercase mb-3 block">
            THE PLATFORM
          </span>
          <h2 className="text-[2rem] sm:text-[2.5rem] md:text-[3rem] font-black text-[#11182d] tracking-tight leading-[1.1]">
            Everything you need to grow
          </h2>
        </div>
        
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {features.map((feature, i) => (
            <div 
              key={i} 
              className="p-6 md:p-8 bg-white rounded-[18px] border border-[#e1e5f1]"
            >
              <div className="h-12 w-12 sm:h-14 sm:w-14 bg-[#f0f4ff] rounded-2xl flex items-center justify-center text-[#0f49d7] mb-6 shadow-sm">
                <feature.icon className="h-6 w-6" />
              </div>
              <h3 className="text-[1.25rem] font-bold text-[#11182d] mb-3">{feature.title}</h3>
              <p className="text-[#6d7892] leading-relaxed text-[0.95rem]">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};



const HowItWorks = () => {
  const steps = [
    { title: "Sign up", desc: "Use GST and bank info." },
    { title: "Onboarding", desc: "Set up your shop profile." },
    { title: "Verification", desc: "Instant document check." },
    { title: "Listing", desc: "Upload your products." },
    { title: "Profit", desc: "Sell and earn weekly." }
  ];

  return (
    <section id="guide" className="py-16 lg:py-24 bg-white font-poppins">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-[2rem] sm:text-[2.5rem] md:text-[3rem] font-black text-[#11182d] mb-4 tracking-tight leading-[1.1]">The 5-Step Path</h2>
        <p className="text-[1.1rem] text-[#6d7892] mb-16 lg:mb-20">Go from zero to profit in 48 hours</p>

        <div className="relative">
          <div className="hidden lg:block absolute top-10 left-[10%] right-[10%] h-[2px] bg-[#f0f4ff] -z-0" />

          <div className="grid grid-cols-2 lg:grid-cols-5 gap-y-12 gap-x-6 relative z-10">
            {steps.map((step, i) => (
              <div key={i} className="flex flex-col items-center group cursor-default">
                <div className="h-20 w-20 flex items-center justify-center rounded-[18px] bg-white border-2 border-[#0f49d7] text-[1.5rem] font-bold text-[#0f49d7] mb-6 shadow-sm group-hover:bg-[#0f49d7] group-hover:text-white transition-colors duration-300">
                  {i + 1}
                </div>
                <h3 className="text-[1.1rem] font-bold text-[#11182d] mb-2">{step.title}</h3>
                <p className="text-[0.95rem] text-[#6d7892] leading-relaxed max-w-[160px]">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

const Testimonials = () => {
  const testimonials = [
    { name: "Rahul Mehra", role: "Heritage Leathers", quote: "WonderCart's dashboard is intuitive. My sales tripled with ease!", stars: 5 },
    { name: "Anjali Sharma", role: "Pure Handcrafted", quote: "Shipping is unmatched. Seamless logistics through the app.", stars: 5 },
    { name: "Vihaan Singh", role: "Urban Textiles", quote: "Weekly payouts and transparency. Best seller platform today.", stars: 5 }
  ];

  return (
    <section id="partners" className="py-16 lg:py-24 bg-[#f6f7fb] border-y border-[#e1e5f1] font-poppins">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-center sm:items-end mb-12 lg:mb-16 gap-6">
          <div className="text-center sm:text-left">
            <h2 className="text-[2rem] sm:text-[2.5rem] md:text-[3rem] font-black text-[#11182d] mb-3 tracking-tight leading-[1.1]">Trusted by Partners</h2>
            <p className="text-[1.1rem] text-[#6d7892] underline underline-offset-8 decoration-[#0f49d7]">Join our growing community</p>
          </div>
          <div className="flex gap-4">
            <button className="h-12 w-12 flex items-center justify-center rounded-[14px] bg-white text-[#6d7892] border border-[#e1e5f1] hover:text-[#11182d] hover:border-[#11182d] transition-all shadow-sm">
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button className="h-12 w-12 flex items-center justify-center rounded-[14px] bg-[#0f49d7] text-white hover:bg-[#003da3] transition-colors shadow-[0_4px_14px_rgba(15,73,215,0.39)]">
              <ChevronRight className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {testimonials.map((t, i) => (
            <div key={i} className="p-8 md:p-10 bg-white rounded-[18px] border border-[#e1e5f1] hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group">
              <div>
                <div className="flex gap-1.5 mb-6">
                  {[...Array(t.stars)].map((_, s) => <Star key={s} className="h-4 w-4 fill-yellow-400 text-yellow-400" />)}
                </div>
                <p className="text-[#6d7892] italic text-[1rem] leading-relaxed mb-8">"{t.quote}"</p>
              </div>
              <div className="flex items-center gap-4 pt-6 border-t border-[#e1e5f1]">
                <div className="h-12 w-12 rounded-[14px] bg-[#f0f4ff] overflow-hidden shrink-0">
                  <img src={`https://i.pravatar.cc/100?img=${i + 32}`} alt={t.name} className="w-full h-full object-cover" />
                </div>
                <div>
                  <h4 className="font-bold text-[#11182d] text-[1.05rem]">{t.name}</h4>
                  <p className="text-[0.7rem] font-bold text-[#6d7892] uppercase tracking-widest mt-0.5">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const FinalCTA = () => {
  return (
    <section className="bg-[#0f49d7] py-20 lg:py-32 font-poppins relative overflow-hidden">
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white relative z-10">
        <h2 className="text-[2.5rem] lg:text-[4.5rem] font-black mb-6 tracking-tight leading-[1.1]">Built for your growth</h2>
        <p className="text-[1.1rem] md:text-[1.25rem] text-[#f0f4ff] mb-12 max-w-2xl mx-auto leading-relaxed opacity-90 font-medium">
          Start selling to millions of active buyers today. No upfront costs, total transparency.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
          <Link
            to="/signup"
            className="w-full sm:w-auto px-10 py-4 bg-white text-[#0f49d7] font-bold rounded-[14px] text-[1rem] shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:bg-[#f6f7fb] hover:-translate-y-1 transition-all duration-300"
          >
            Start For Free
          </Link>
          <button
            onClick={() => document.getElementById("login_modal")?.showModal()}
            className="w-full sm:w-auto px-10 py-4 border border-white/30 text-white font-bold rounded-[14px] text-[1rem] hover:bg-white/10 hover:-translate-y-1 transition-all duration-300"
          >
            Back to Login
          </button>
        </div>
      </div>
    </section>
  );
};

const SellerLandingPage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-white font-body antialiased selection:bg-[#0f49d7] selection:text-white font-poppins">
      <Navbar />
      <Hero />
      <StatsBar />
      <Benefits />
      <HowItWorks />
      <Testimonials />
      <FinalCTA />

      <footer className="py-12 lg:py-16 bg-white border-t border-[#e1e5f1] font-poppins">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-8">
            <div className="flex flex-col items-center md:items-start gap-3">
              <span className="text-[#11182d] text-[1.4rem] font-black tracking-tight">WonderCart Seller</span>
              <p className="text-[0.9rem] text-[#6d7892] max-w-xs text-center md:text-left leading-relaxed">
                Empowering businesses to grow and reach millions of buyers nationwide.
              </p>
            </div>
            
            <div className="flex flex-wrap justify-center md:justify-end gap-x-8 gap-y-4">
              <a href="#" className="text-[0.9rem] font-semibold text-[#6d7892] hover:text-[#0f49d7] transition-colors">Privacy Policy</a>
              <a href="#" className="text-[0.9rem] font-semibold text-[#6d7892] hover:text-[#0f49d7] transition-colors">Terms of Service</a>
              <a href="#" className="text-[0.9rem] font-semibold text-[#6d7892] hover:text-[#0f49d7] transition-colors">Seller Handbook</a>
              <a href="#" className="text-[0.9rem] font-semibold text-[#6d7892] hover:text-[#0f49d7] transition-colors">Help Center</a>
            </div>
          </div>
          
          <div className="mt-12 pt-8 border-t border-[#e1e5f1] flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-[0.85rem] text-[#6d7892]">© 2026 WonderCart Technologies. All rights reserved.</p>
            <div className="flex gap-6">
              <span className="text-[0.85rem] font-medium text-[#6d7892]">Designed for Sellers</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default SellerLandingPage;
