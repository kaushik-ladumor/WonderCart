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
  Rocket
} from "lucide-react";

// --- Components ---

const Navbar = () => {
  return (
    <nav className="sticky top-0 left-0 right-0 z-50 bg-white border-b border-gray-100 font-poppins">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 sm:h-18">
          {/* Logo */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-lg sm:text-xl font-bold text-blue-600 whitespace-nowrap">WonderCart Seller</span>
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden lg:flex items-center gap-8">
            <a href="#platform" className="text-[11px] font-bold uppercase tracking-widest text-gray-400 hover:text-blue-600 transition-colors">PLATFORM</a>
            <a href="#statistics" className="text-[11px] font-bold uppercase tracking-widest text-gray-400 hover:text-blue-600 transition-colors">STATISTICS</a>
            <a href="#earnings" className="text-[11px] font-bold uppercase tracking-widest text-gray-400 hover:text-blue-600 transition-colors">EARNINGS</a>
            <a href="#guide" className="text-[11px] font-bold uppercase tracking-widest text-gray-400 hover:text-blue-600 transition-colors">GUIDE</a>
            <a href="#partners" className="text-[11px] font-bold uppercase tracking-widest text-gray-400 hover:text-blue-600 transition-colors">PARTNERS</a>
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-3 sm:gap-6 shrink-0">
            <button 
              onClick={() => document.getElementById("login_modal")?.showModal()}
              className="text-xs sm:text-sm font-bold text-gray-700 hover:text-blue-600 whitespace-nowrap"
            >
              Login
            </button>
            <Link 
              to="/signup"
              className="px-3 sm:px-6 py-2 bg-blue-600 text-white text-[11px] sm:text-sm font-bold rounded-md hover:bg-blue-700 transition-colors shadow-sm whitespace-nowrap"
            >
              Start selling
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

const Hero = () => {
  return (
    <section className="bg-white py-8 lg:py-16 overflow-hidden font-poppins">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          <div className="max-w-xl text-center lg:text-left">
            <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold text-gray-900 mb-6 leading-[1.15] tracking-tight">
              The simplest way to <br className="hidden sm:block" /> grow your brand online
            </h1>
            <p className="text-base lg:text-lg text-gray-500 mb-8 lg:mb-10 leading-relaxed max-w-lg mx-auto lg:mx-0">
              Reach millions of buyers across India and manage your entire business from a single intuitive dashboard. Join 1.5 Lakh+ successful sellers today.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
              <Link 
                to="/signup"
                className="w-full sm:w-auto px-10 py-3.5 bg-blue-600 text-white font-bold rounded-md hover:bg-blue-700 transition-colors shadow-sm text-center"
              >
                Start Selling Free
              </Link>
              <button className="w-full sm:w-auto px-10 py-3.5 bg-blue-50 text-blue-600 font-bold rounded-md hover:bg-blue-100 transition-colors text-center">
                See how it works
              </button>
            </div>
          </div>
          <div className="relative mt-8 lg:mt-0">
            <div className="rounded-2xl overflow-hidden shadow-xl border border-gray-100">
              <img 
                src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=2488&auto=format&fit=crop" 
                alt="Seller working" 
                className="w-full h-auto object-cover max-h-[400px] lg:max-h-none"
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
    { label: "ACTIVE BUYERS", value: "2 Crore+", icon: Users },
    { label: "ACTIVE SELLERS", value: "1.5 Lakh+", icon: Store },
    { label: "MARGIN", value: "85% Max", icon: TrendingUp },
    { label: "PAYOUT", value: "7 Days", icon: Clock },
  ];

  return (
    <section id="statistics" className="bg-[#f0f4ff] py-8 lg:py-10 font-poppins">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {stats.map((stat, i) => (
            <div key={i} className="flex items-center gap-3 sm:gap-4 justify-center lg:justify-start">
              <div className="h-10 w-10 sm:h-12 sm:w-12 bg-white rounded-full flex items-center justify-center text-blue-600 shadow-sm shrink-0">
                <stat.icon className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg sm:text-xl font-bold text-gray-900 leading-none mb-1">{stat.value}</span>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">{stat.label}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const Benefits = () => {
  const benefits = [
    { title: "High profit margins", desc: "Our low commission structure ensures you keep more of what you earn.", icon: DollarSign },
    { title: "Seller discounts", desc: "Access exclusive vendor pricing and promotional tools to boost your brand.", icon: Zap },
    { title: "Shipping handling", desc: "End-to-end logistics support with reliable partners across 19k+ pin codes.", icon: Truck },
    { title: "Live dashboard", desc: "Monitor your performance in real-time with comprehensive stats and tools.", icon: LayoutDashboard },
    { title: "Featured promotions", desc: "Get your brand noticed with homepage placements and targeted ads.", icon: ShieldCheck },
    { title: "Pan-India reach", desc: "Break geographical barriers and sell to millions in every corner.", icon: Globe2 }
  ];

  return (
    <section id="platform" className="py-12 lg:py-16 bg-white font-poppins">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center lg:text-left">
          <span className="text-[11px] font-bold text-blue-600 uppercase tracking-widest block mb-2">THE PLATFORM</span>
          <h2 className="text-2xl lg:text-4xl font-bold text-gray-900 tracking-tight">Everything you need to grow</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {benefits.map((benefit, i) => (
            <div key={i} className="p-8 bg-[#f9fafc] rounded-xl group border border-transparent hover:border-gray-100 transition-all shadow-sm">
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center mb-6 text-blue-600">
                <benefit.icon className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">{benefit.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{benefit.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const ProfitCalculator = () => {
  const [sellingPrice, setSellingPrice] = useState(1500);
  const [costPrice, setCostPrice] = useState(800);
  const [ordersPerMonth, setOrdersPerMonth] = useState(250);
  const commissionRate = 0.10;

  const commission = sellingPrice * commissionRate;
  const perOrderProfit = sellingPrice - costPrice - commission;
  const marginPercent = ((perOrderProfit / sellingPrice) * 100).toFixed(1);
  const monthlyEarnings = perOrderProfit * ordersPerMonth;

  return (
    <section id="earnings" className="py-12 lg:py-16 bg-[#f0f4ff] font-poppins">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-2xl lg:text-4xl font-bold text-gray-900 mb-2 tracking-tight">Calculate your earning potential</h2>
          <p className="text-gray-500 text-sm font-medium italic">See how much profit you can generate with WonderCart</p>
        </div>
        
        <div className="grid lg:grid-cols-2 gap-0 overflow-hidden rounded-2xl shadow-lg border border-gray-100">
          {/* Inputs */}
          <div className="bg-white p-8 sm:p-12 border-r border-gray-50">
            <div className="space-y-10">
              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm font-bold">
                  <span className="text-gray-600 uppercase tracking-widest text-[10px]">Avg Selling Price</span>
                  <span className="text-blue-600 bg-blue-50 px-2 py-0.5 rounded text-xs">₹ {sellingPrice}</span>
                </div>
                <input 
                  type="range" min="100" max="5000" step="10"
                  value={sellingPrice}
                  onChange={(e) => setSellingPrice(Number(e.target.value))}
                  className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm font-bold">
                  <span className="text-gray-600 uppercase tracking-widest text-[10px]">Product Cost Price</span>
                  <span className="text-blue-600 bg-blue-50 px-2 py-0.5 rounded text-xs">₹ {costPrice}</span>
                </div>
                <input 
                  type="range" min="50" max="4000" step="10"
                  value={costPrice}
                  onChange={(e) => setCostPrice(Number(e.target.value))}
                  className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm font-bold">
                  <span className="text-gray-600 uppercase tracking-widest text-[10px]">Orders / Month</span>
                  <span className="text-blue-600 bg-blue-50 px-2 py-0.5 rounded text-xs">{ordersPerMonth}</span>
                </div>
                <input 
                  type="range" min="10" max="1000" step="10"
                  value={ordersPerMonth}
                  onChange={(e) => setOrdersPerMonth(Number(e.target.value))}
                  className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="bg-blue-600 p-8 sm:p-12 text-white relative">
            <div className="space-y-10">
              <div>
                <p className="text-blue-100 text-[10px] font-bold uppercase tracking-widest mb-6 border-b border-blue-500 pb-2 inline-block">Estimated Results</p>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-blue-100 text-xs font-bold opacity-80">Profit per item</span>
                    <span className="text-xl font-bold italic">₹ {perOrderProfit >= 0 ? perOrderProfit : 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-blue-100 text-xs font-bold opacity-80">Margin</span>
                    <span className="text-xl font-bold italic">{marginPercent > 0 ? marginPercent : 0}%</span>
                  </div>
                </div>
              </div>

              <div className="pt-8 border-t border-blue-500">
                <p className="text-blue-100 text-[10px] font-bold uppercase tracking-[0.2em] mb-3">MONTHLY REVENUE POTENTIAL</p>
                <div className="flex items-baseline gap-2 mb-8">
                  <p className="text-4xl lg:text-5xl font-bold">₹ {(monthlyEarnings >= 0 ? monthlyEarnings : 0).toLocaleString()}</p>
                </div>
                
                <button className="w-full py-4 bg-white text-blue-600 font-bold rounded-lg hover:bg-gray-50 transition-colors shadow-lg text-sm">
                  Start Your Business Plan
                </button>
              </div>
            </div>
          </div>
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
    <section id="guide" className="py-12 lg:py-16 bg-white font-poppins">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-2xl lg:text-4xl font-bold text-gray-900 mb-2">The 5-Step Path</h2>
        <p className="text-gray-500 text-sm font-medium mb-12 lg:mb-16">Go from zero to profit in 48 hours</p>

        <div className="relative">
          <div className="hidden lg:block absolute top-8 left-[10%] right-[10%] h-[1px] bg-gray-100 -z-0" />
          
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-y-10 gap-x-6 relative z-10">
            {steps.map((step, i) => (
              <div key={i} className="flex flex-col items-center">
                <div className="h-16 w-16 flex items-center justify-center rounded-full bg-white border-2 border-blue-600 text-xl font-bold text-blue-600 mb-4 shadow-sm">
                  {i + 1}
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-[11px] text-gray-500 leading-relaxed max-w-[140px]">{step.desc}</p>
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
    <section id="partners" className="py-12 lg:py-16 bg-[#f9fafc] font-poppins">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-center sm:items-end mb-10 gap-4">
          <div className="text-center sm:text-left">
            <h2 className="text-2xl lg:text-4xl font-bold text-gray-900 mb-2">Trusted by Partners</h2>
            <p className="text-gray-500 text-sm font-medium underline underline-offset-4 decoration-blue-600">Join our growing community</p>
          </div>
          <div className="flex gap-4">
            <button className="h-10 w-10 flex items-center justify-center rounded-full bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button className="h-10 w-10 flex items-center justify-center rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-md">
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <div key={i} className="p-8 bg-white rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex gap-1 mb-6">
                  {[...Array(t.stars)].map((_, s) => <Star key={s} className="h-3 w-3 fill-yellow-400 text-yellow-400" />)}
                </div>
                <p className="text-gray-500 italic text-sm leading-relaxed mb-8">"{t.quote}"</p>
              </div>
              <div className="flex items-center gap-3 pt-6 border-t border-gray-50">
                <div className="h-10 w-10 rounded-full bg-gray-100 overflow-hidden shrink-0">
                  <img src={`https://i.pravatar.cc/100?img=${i + 32}`} alt={t.name} />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-xs">{t.name}</h4>
                  <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{t.role}</p>
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
    <section className="bg-blue-600 py-16 lg:py-24 font-poppins">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
        <h2 className="text-3xl lg:text-5xl font-black mb-6">Built for your growth</h2>
        <p className="text-lg text-blue-100 mb-10 max-w-xl mx-auto leading-relaxed opacity-90 font-medium">
          Start selling to millions of active buyers today. No upfront costs, total transparency.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link 
            to="/signup"
            className="w-full sm:w-auto px-10 py-4 bg-white text-blue-600 font-bold rounded-md text-lg shadow-lg hover:bg-gray-50 transition-all"
          >
            Start For Free
          </Link>
          <button 
            onClick={() => document.getElementById("login_modal")?.showModal()}
            className="w-full sm:w-auto px-10 py-4 border-2 border-white/40 text-white font-bold rounded-md text-lg hover:bg-white/10 transition-all"
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
    <div className="min-h-screen bg-white font-body antialiased selection:bg-blue-600 selection:text-white font-poppins">
      <Navbar />
      <Hero />
      <StatsBar />
      <Benefits />
      <ProfitCalculator />
      <HowItWorks />
      <Testimonials />
      <FinalCTA />
      
      <footer className="py-10 border-t border-gray-100 font-poppins">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
          <div className="flex items-center gap-2">
            <span className="text-gray-900 normal-case text-base font-black">WonderCart Seller</span>
          </div>
          <div className="flex flex-wrap justify-center gap-6">
            <a href="#" className="hover:text-blue-600">Privacy</a>
            <a href="#" className="hover:text-blue-600">Terms</a>
            <a href="#" className="hover:text-blue-600">Handbook</a>
            <a href="#" className="hover:text-blue-600">Support</a>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 text-center md:text-left">
           <p className="text-[10px] text-gray-300 font-medium uppercase tracking-[0.2em]">© 2026 WonderCart Technologies.</p>
        </div>
      </footer>
    </div>
  );
};

export default SellerLandingPage;
