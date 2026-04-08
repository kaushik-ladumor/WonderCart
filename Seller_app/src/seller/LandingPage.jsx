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
  CheckCircle2,
  Users,
  TrendingUp,
  Clock,
  Star,
  Quote
} from "lucide-react";

// --- Components ---

const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
              <Store className="h-5 w-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold uppercase tracking-widest text-gray-400 leading-none">SELLER</span>
              <span className="text-xl font-bold text-gray-900 leading-tight">WonderCart</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => document.getElementById('login_modal')?.showModal()}
              className="px-5 py-2.5 text-sm font-semibold text-gray-700"
            >
              Log in
            </button>
            <Link 
              to="/signup"
              className="px-6 py-2.5 bg-primary text-white text-sm font-semibold rounded-full"
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
  const scrollToSteps = () => {
    document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative pt-24 pb-12 lg:pt-32 lg:pb-16 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <div>
          <span className="inline-block px-4 py-1.5 mb-6 text-xs font-bold tracking-widest text-primary uppercase bg-primary/10 rounded-full">
            Scale your business today
          </span>
          <h1 className="text-5xl lg:text-7xl font-extrabold text-gray-900 mb-6 leading-[1.1]">
            Grow your brand with <br />
            <span className="text-primary">
              India's fastest commerce network
            </span>
          </h1>
          <p className="max-w-2xl mx-auto text-lg lg:text-xl text-gray-500 mb-10 leading-relaxed">
            Join 1.5 lakh+ sellers who are reaching 2 crore+ active buyers across 19,000+ pin codes. 
            Start selling in just 24 hours with zero onboarding fees.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              to="/signup"
              className="w-full sm:w-auto px-8 py-4 bg-primary text-white font-bold rounded-2xl flex items-center justify-center gap-2"
            >
              Create seller account
              <ArrowRight className="h-5 w-5" />
            </Link>
            <button 
              onClick={scrollToSteps}
              className="w-full sm:w-auto px-8 py-4 bg-white text-gray-900 font-bold rounded-2xl border border-gray-200 flex items-center justify-center gap-2"
            >
              See how it works
            </button>
          </div>
        </div>

        <div className="mt-12 lg:mt-16 relative">
          <div className="relative mx-auto max-w-5xl">
            <img 
              src="/assets/landing-hero.png" 
              alt="Seller Dashboard Preview" 
              className="rounded-3xl border border-gray-200"
              onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2426&auto=format&fit=crop'; }}
            />
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
    { label: "Max Profit Margin", value: "85%", icon: TrendingUp },
    { label: "Payment Cycle", value: "7 Days", icon: Clock },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-20">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-8 bg-white p-8 lg:p-12 rounded-[32px] border border-gray-100">
        {stats.map((stat, i) => (
          <div key={i} className="flex flex-col items-center lg:items-start text-center lg:text-left gap-2">
            <div className="flex items-center gap-3 mb-1">
              <div className="p-2 bg-primary/10 rounded-lg">
                <stat.icon className="h-5 w-5 text-primary" />
              </div>
              <span className="text-3xl lg:text-4xl font-extrabold text-gray-900">{stat.value}</span>
            </div>
            <p className="text-sm font-medium text-gray-400 uppercase tracking-widest">{stat.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

const Benefits = () => {
  const benefits = [
    { title: "High profit margins", desc: "Our commission rates ensure you keep the lion's share of your revenue.", icon: DollarSign },
    { title: "Seller discounts", desc: "Access bulk rates for packaging and logistics through our network.", icon: Zap },
    { title: "We handle shipping", desc: "Focus on your product while our fleet handles door-to-door delivery.", icon: Truck },
    { title: "Live dashboard", desc: "Track sales and inventory in real-time with our data tools.", icon: BarChart3 },
    { title: "Featured promotions", desc: "Get discovered faster with daily deals and home-page visibility.", icon: ShieldCheck },
    { title: "Pan-India reach", desc: "Expand your business to every corner of the country seamlessly.", icon: Globe2 }
  ];

  return (
    <section className="py-16 lg:py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 lg:mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Why sellers love WonderCart</h2>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            Everything you need to grow your e-commerce business at scale.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits.map((benefit, i) => (
            <div key={i} className="p-8 bg-white rounded-3xl border border-gray-100">
              <div className="w-14 h-14 rounded-2xl bg-primary/5 flex items-center justify-center mb-6">
                <benefit.icon className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">{benefit.title}</h3>
              <p className="text-gray-500 leading-relaxed">{benefit.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const ProfitCalculator = () => {
  const [sellingPrice, setSellingPrice] = useState(1000);
  const [costPrice, setCostPrice] = useState(600);
  const [ordersPerMonth, setOrdersPerMonth] = useState(100);
  const commissionRate = 0.10;

  const commission = sellingPrice * commissionRate;
  const perOrderProfit = sellingPrice - costPrice - commission;
  const marginPercent = ((perOrderProfit / sellingPrice) * 100).toFixed(1);
  const monthlyEarnings = perOrderProfit * ordersPerMonth;

  return (
    <section className="py-16 lg:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div>
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">Calculate your potential earnings</h2>
            <p className="text-lg text-gray-500 mb-10">
              Estimate your monthly profit by adjusting the sliders below.
            </p>
            
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-semibold text-gray-700">Selling Price (₹)</label>
                  <span className="px-3 py-1 bg-gray-100 text-primary font-bold rounded-lg">₹{sellingPrice}</span>
                </div>
                <input 
                  type="range" min="100" max="5000" step="10"
                  value={sellingPrice}
                  onChange={(e) => setSellingPrice(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
                />
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-semibold text-gray-700">Cost Price (₹)</label>
                  <span className="px-3 py-1 bg-gray-100 text-gray-900 font-bold rounded-lg">₹{costPrice}</span>
                </div>
                <input 
                  type="range" min="50" max="4000" step="10"
                  value={costPrice}
                  onChange={(e) => setCostPrice(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-gray-600"
                />
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-semibold text-gray-700">Orders per month</label>
                  <span className="px-3 py-1 bg-gray-100 text-gray-900 font-bold rounded-lg">{ordersPerMonth}</span>
                </div>
                <input 
                  type="range" min="10" max="500" step="5"
                  value={ordersPerMonth}
                  onChange={(e) => setOrdersPerMonth(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-gray-600"
                />
              </div>
            </div>
          </div>

          <div className="bg-primary rounded-[32px] p-8 lg:p-12 text-white relative">
            <div className="relative z-10 space-y-10">
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <p className="text-white/70 text-sm font-medium uppercase tracking-wider mb-2">Per-order Profit</p>
                  <p className="text-3xl lg:text-4xl font-bold">₹{perOrderProfit >= 0 ? perOrderProfit : 0}</p>
                </div>
                <div>
                  <p className="text-white/70 text-sm font-medium uppercase tracking-wider mb-2">Profit Margin</p>
                  <p className="text-3xl lg:text-4xl font-bold">{marginPercent > 0 ? marginPercent : 0}%</p>
                </div>
              </div>

              <div className="pt-10 border-t border-white/20">
                <p className="text-white/70 text-sm font-medium uppercase tracking-wider mb-2">Monthly Earnings</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-5xl lg:text-6xl font-extrabold text-white">₹{(monthlyEarnings >= 0 ? monthlyEarnings : 0).toLocaleString()}</p>
                  <span className="text-xl text-white/50">/month</span>
                </div>
              </div>

              <div className="bg-white/10 rounded-2xl p-6 mt-6">
                <p className="text-sm text-white/80">Commission: 10% (₹{commission}) included.</p>
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
    { title: "Sign up", desc: "Create your account in minutes." },
    { title: "Seller form", desc: "Complete your shop profile." },
    { title: "Verification", desc: "Takes 24–48 hours." },
    { title: "List products", desc: "Upload your catalog." },
    { title: "Get paid", desc: "Receive weekly payments." }
  ];

  return (
    <section id="how-it-works" className="py-16 lg:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 lg:mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Simple path to selling</h2>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            We've streamlined the process for you.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-12 lg:gap-8">
          {steps.map((step, i) => (
            <div key={i} className="text-center">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100 text-xl font-bold text-gray-900 mb-6 border border-gray-200">
                {i + 1}
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{step.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed px-4">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const Testimonials = () => {
  const testimonials = [
    { name: "Anjali Sharma", category: "Jewelry", quote: "WonderCart helped me scale across India. My revenue tripled!" },
    { name: "Rahul Mehra", category: "Textiles", quote: "The 7-day payout cycle keeps my cash flow healthy." },
    { name: "Priya Varma", category: "Home Decor", quote: "Quick verification and great support for new brands." }
  ];

  return (
    <section className="py-16 lg:py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 lg:mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Trusted by creators</h2>
          <p className="text-lg text-gray-500">Real stories from our seller community.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((t, i) => (
            <div key={i} className="p-8 bg-white rounded-[32px] border border-gray-100">
              <Quote className="h-8 w-8 text-primary/10 mb-6" />
              <p className="text-lg font-medium text-gray-900 mb-8 leading-relaxed italic">"{t.quote}"</p>
              <div>
                <h4 className="font-bold text-gray-900">{t.name}</h4>
                <p className="text-sm text-gray-500">{t.category}</p>
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
    <section className="py-16 lg:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-[40px] bg-gray-900 p-12 lg:p-20 text-center">
          <h2 className="text-4xl lg:text-6xl font-extrabold text-white mb-8">Ready to grow?</h2>
          <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed">
            Join the future of commerce. Set up your shop in minutes.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link 
              to="/signup"
              className="w-full sm:w-auto px-10 py-5 bg-primary text-white font-bold rounded-2xl text-lg"
            >
              Start for free
            </Link>
            <button 
              onClick={() => document.getElementById('login_modal')?.showModal()}
              className="w-full sm:w-auto px-10 py-5 bg-white text-gray-900 font-bold rounded-2xl text-lg"
            >
              Sign in
            </button>
          </div>
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
    <div className="min-h-screen bg-white font-body selection:bg-primary selection:text-white">
      <Navbar />
      <Hero />
      <StatsBar />
      <Benefits />
      <ProfitCalculator />
      <HowItWorks />
      <Testimonials />
      <FinalCTA />
      
      <footer className="py-12 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded bg-gray-900">
              <Store className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-gray-900">WonderCart Seller</span>
          </div>
          <p>© 2026 WonderCart.</p>
          <div className="flex gap-8">
            <a href="#">Privacy</a>
            <a href="#">Terms</a>
            <a href="#">Help</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default SellerLandingPage;
