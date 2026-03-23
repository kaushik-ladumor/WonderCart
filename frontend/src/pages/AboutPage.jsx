import React from "react";
import { Link } from "react-router-dom";
import {
  Target,
  Eye,
  CheckCircle2,
  Gem,
  Lightbulb,
  Users,
  HeadphonesIcon,
  Lock,
  Globe
} from "lucide-react";

const About = () => {
  return (
    <div className="min-h-screen bg-white font-body selection:bg-blue-100 selection:text-blue-900">
      
      {/* 1. Hero Section */}
      <section className="relative px-4 sm:px-6 lg:px-8 pt-6 pb-12 md:pt-8 md:pb-16 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div className="max-w-2xl">
            <span className="inline-block px-4 py-1.5 bg-[#f0f4ff] text-[#004ac6] text-[10px] font-bold uppercase tracking-[0.2em] rounded-full mb-6 relative">
              Our Story
            </span>
            <h1 className="font-display text-5xl lg:text-6xl xl:text-7xl font-extrabold text-[#141b2d] leading-[1.05] tracking-tight mb-6">
              Redefining Digital Commerce
            </h1>
            <p className="text-[#5c6880] text-[13px] md:text-sm leading-relaxed mb-10 max-w-lg">
              WonderCart is more than a marketplace. We are a digital curator, bridging the gap between global artisans and discerning collectors who value quality over quantity.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/shop" className="px-8 py-4 bg-[#004ac6] text-white rounded-xl font-display font-bold text-[11px] uppercase tracking-[0.2em] hover:bg-[#141b2d] transition-all hover:scale-105 active:scale-95 shadow-lg shadow-blue-500/20">
                Explore Curations
              </Link>
              <Link to="/about" className="px-8 py-4 bg-[#f0f4ff] text-[#004ac6] rounded-xl font-display font-bold text-[11px] uppercase tracking-[0.2em] hover:bg-[#e1e8fd] transition-all hover:scale-105 active:scale-95">
                Meet the Artisans
              </Link>
            </div>
          </div>
          <div className="relative">
            <div className="rounded-[2.5rem] overflow-hidden shadow-2xl relative aspect-[4/5] md:aspect-auto md:h-[600px] w-full max-w-md ml-auto">
              <img 
                src="https://images.unsplash.com/photo-1544928147-79a2dbc1f389?w=800&auto=format&fit=crop&q=80" 
                alt="Artisan crafting" 
                className="w-full h-full object-cover"
              />
            </div>
            {/* Floating Card */}
            <div className="absolute -bottom-6 right-8 md:-left-12 md:bottom-12 bg-white p-6 rounded-2xl shadow-xl max-w-[240px]">
              <p className="font-body text-[11px] text-[#5c6880] italic leading-relaxed">
                "Craftsmanship is the heart of every item we curate."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. The WonderCart Journey */}
      <section className="px-4 sm:px-6 lg:px-8 py-12 bg-[#f9f9ff]">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          {/* Collage */}
          <div className="grid grid-cols-2 gap-4 auto-rows-[160px] md:auto-rows-[200px]">
            <img src="https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=600&auto=format&fit=crop&q=80" alt="Decor" className="w-full h-full object-cover rounded-3xl" />
            <img src="https://images.unsplash.com/photo-1513694203232-719a280e022f?w=600&auto=format&fit=crop&q=80" alt="Plant art" className="w-full h-full object-cover rounded-3xl row-span-2" />
            <img src="https://images.unsplash.com/photo-1538688525198-9b88f6f53126?w=600&auto=format&fit=crop&q=80" alt="Furniture" className="w-full h-full object-cover rounded-3xl row-span-2" />
            <img src="https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=600&auto=format&fit=crop&q=80" alt="Interior" className="w-full h-full object-cover rounded-3xl" />
          </div>
          
          <div className="max-w-xl">
            <h2 className="font-display text-3xl md:text-4xl font-extrabold text-[#141b2d] mb-8">
              The WonderCart Journey
            </h2>
            <div className="space-y-6 text-[#5c6880] text-xs md:text-[13px] leading-relaxed">
              <p>
                Founded in 2024, WonderCart began with a simple observation: the digital marketplace had become a warehouse of noise. Beautiful, soulful products were being buried under algorithms that prioritized speed over story.
              </p>
              <p>
                We decided to build something different. A place where "curation" isn't just a marketing buzzword, but the foundation of every decision we make. We travel the globe, virtually and physically, to find vendors who put their heart into their craft.
              </p>
              <p>
                Today, WonderCart stands as a sanctuary for both the creator and the consumer—a platform where quality is the only metric that matters.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Mission & Vision */}
      <section className="px-4 sm:px-6 lg:px-8 py-16 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-[#f0f4ff] rounded-[2.5rem] p-10 md:p-14 hover:scale-[1.02] transition-transform duration-500">
            <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-[#004ac6] shadow-sm mb-8">
              <Target className="w-6 h-6" strokeWidth={2} />
            </div>
            <h3 className="font-display text-2xl font-bold text-[#141b2d] mb-4">Our Mission</h3>
            <p className="text-[#5c6880] text-[13px] leading-relaxed max-w-md">
              To empower independent artisans by providing a premium platform that celebrates their craftsmanship and connects them with a global audience of conscious consumers.
            </p>
          </div>
          <div className="bg-[#f0f4ff] rounded-[2.5rem] p-10 md:p-14 hover:scale-[1.02] transition-transform duration-500">
            <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-[#004ac6] shadow-sm mb-8">
              <Eye className="w-6 h-6" strokeWidth={2} />
            </div>
            <h3 className="font-display text-2xl font-bold text-[#141b2d] mb-4">Our Vision</h3>
            <p className="text-[#5c6880] text-[13px] leading-relaxed max-w-md">
              To become the world's most trusted destination for editorial commerce, where every purchase supports sustainable craftsmanship and artistic integrity.
            </p>
          </div>
        </div>
      </section>

      {/* 4. Pillars */}
      <section className="px-4 sm:px-6 lg:px-8 py-12 text-center max-w-7xl mx-auto">
        <h2 className="font-display text-2xl md:text-3xl font-extrabold text-[#141b2d] mb-4">
          The Pillars of WonderCart
        </h2>
        <p className="text-[#5c6880] text-[11px] md:text-xs max-w-xl mx-auto mb-16">
          Our core values guide every interaction, from vendor selection to customer support.
        </p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: CheckCircle2, title: "Quality", desc: "We maintain a rigorous selection process to ensure every product meets our premium standards." },
            { icon: Gem, title: "Integrity", desc: "Transparency in sourcing and fair pricing for both our vendors and customers." },
            { icon: Lightbulb, title: "Innovation", desc: "Constantly evolving our platform to create a seamless, editorial shopping experience." },
            { icon: Users, title: "Community", desc: "Fostering meaningful connections between the people who make and the people who use." }
          ].map((pillar, i) => (
            <div key={i} className="bg-[#f9f9ff] rounded-[2rem] p-8 text-left border border-white hover:shadow-premium transition-shadow duration-300">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-[#004ac6] shadow-sm mb-6">
                <pillar.icon className="w-5 h-5" strokeWidth={2} />
              </div>
              <h4 className="font-display font-bold text-[#141b2d] mb-3 text-[15px]">{pillar.title}</h4>
              <p className="text-[#5c6880] text-[11px] leading-relaxed">{pillar.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Unwavering Commitment */}
      <section className="px-4 sm:px-6 lg:px-8 pb-16 max-w-7xl mx-auto">
        <div className="relative rounded-[3rem] overflow-hidden bg-[#141b2d] p-12 md:p-24 text-center flex flex-col items-center justify-center min-h-[440px]">
          <img 
            src="https://images.unsplash.com/photo-1497215888806-bc30e386ab0d?w=1200&auto=format&fit=crop&q=80" 
            alt="Minimalist background" 
            className="absolute inset-0 w-full h-full object-cover opacity-20 mix-blend-overlay"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#141b2d] to-transparent opacity-90" />
          
          <div className="relative z-10 max-w-3xl mx-auto">
            <h2 className="font-display text-3xl md:text-5xl font-extrabold text-white mb-6 tracking-tight">
              Our Unwavering Commitment
            </h2>
            <p className="text-white/80 text-[13px] md:text-sm leading-relaxed mb-12 max-w-2xl mx-auto">
              Whether you are a vendor looking for a home for your creations or a customer searching for something unique, WonderCart is dedicated to your success and satisfaction. We provide full-spectrum support, from logistics for sellers to premium discovery for buyers.
            </p>
            
            <div className="flex flex-wrap justify-center gap-4">
              <div className="flex items-center gap-2 px-6 py-3.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-[10px] font-bold tracking-[0.2em] uppercase">
                <HeadphonesIcon className="w-4 h-4" /> 24/7 Support
              </div>
              <div className="flex items-center gap-2 px-6 py-3.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-[10px] font-bold tracking-[0.2em] uppercase">
                <Lock className="w-4 h-4" /> Secure Transactions
              </div>
              <div className="flex items-center gap-2 px-6 py-3.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-[10px] font-bold tracking-[0.2em] uppercase">
                <Globe className="w-4 h-4" /> Global Shipping
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Footer (matches image aesthetic) */}
      <footer className="bg-[#f0f4ff] pt-12 pb-8 border-t border-[#e1e8fd]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-1 md:col-span-2">
              <Link to="/" className="font-display text-2xl font-extrabold tracking-tight text-[#141b2d] mb-4 block">
                WonderCart
              </Link>
              <p className="text-xs text-[#5c6880] max-w-xs leading-relaxed">
                Curating the world's finest artisan products for the modern digital collector.
              </p>
            </div>
            
            <div>
              <h4 className="font-bold text-[10px] uppercase tracking-widest text-[#141b2d] mb-6">Marketplace</h4>
              <ul className="space-y-4 text-[11px] font-medium text-[#5c6880]">
                <li><Link to="/shop" className="hover:text-[#004ac6] transition-colors">Shop All</Link></li>
                <li><Link to="/shop" className="hover:text-[#004ac6] transition-colors">Trending</Link></li>
                <li><Link to="/shop" className="hover:text-[#004ac6] transition-colors">New Arrivals</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-[10px] uppercase tracking-widest text-[#141b2d] mb-6">Company</h4>
              <ul className="space-y-4 text-[11px] font-medium text-[#5c6880]">
                <li><Link to="/about" className="hover:text-[#004ac6] transition-colors">About Us</Link></li>
                <li><Link to="#" className="hover:text-[#004ac6] transition-colors">Vendor Handbook</Link></li>
                <li><Link to="/contact" className="hover:text-[#004ac6] transition-colors">Contact Us</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-[#004ac6]/10">
            <p className="text-[10px] text-[#5c6880] mb-4 md:mb-0 uppercase tracking-wider font-semibold">
              © 2024 WonderCart Curated Marketplace. All rights reserved.
            </p>
            <div className="flex gap-6 text-[10px] text-[#5c6880] font-bold uppercase tracking-[0.2em] mb-4 md:mb-0">
              <Link to="#" className="hover:text-[#141b2d]"><Globe className="w-4 h-4" /></Link>
              <Link to="#" className="hover:text-[#141b2d]"><Target className="w-4 h-4" /></Link> 
            </div>
            <div className="flex gap-6 text-[10px] text-[#5c6880] font-bold uppercase tracking-[0.2em]">
              <Link to="/privacy" className="hover:text-[#004ac6]">Privacy Policy</Link>
              <Link to="/terms" className="hover:text-[#004ac6]">Terms of Service</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default About;
