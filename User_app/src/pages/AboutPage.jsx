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
  Globe,
  ArrowRight,
  ShieldCheck,
  Zap
} from "lucide-react";

const About = () => {
  return (
    <div className="min-h-screen bg-[#f8f9fc] text-[#11182d]">
      
      {/* 1. Hero Section */}
      <section className="px-4 pt-10 pb-12 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <div>
            <div className="flex items-center gap-2 mb-4">
               <div className="w-8 h-8 bg-[#0f49d7] rounded-xl flex items-center justify-center text-white shadow-sm">
                  <Zap className="w-4 h-4" />
               </div>
               <span className="text-[0.62rem] font-bold uppercase tracking-widest text-[#0f49d7]">Our Visionary Approach</span>
            </div>
            <h1 className="text-[2.2rem] lg:text-[3.2rem] font-bold text-[#11182d] leading-[1.1] tracking-tight mb-4">
              Redefining Modern <br /> Marketplace Commerce
            </h1>
            <p className="text-[#42506d] text-[0.8rem] leading-relaxed mb-8 max-w-lg font-medium">
              WonderCart is more than a platform. We are a digital curator, bridging the gap between global artisans and discerning collectors who value quality over quantity.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/shop" className="h-11 px-8 bg-[#0f49d7] text-white rounded-xl font-bold text-[0.65rem] uppercase tracking-widest shadow-md flex items-center">
                Explore Curations
              </Link>
              <Link to="/shop" className="h-11 px-8 bg-white text-[#11182d] border border-[#eef2ff] rounded-xl font-bold text-[0.65rem] uppercase tracking-widest shadow-sm flex items-center gap-2">
                Meet Artisans <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
          <div className="relative">
            <div className="rounded-[32px] overflow-hidden shadow-sm relative aspect-[4/5] md:h-[480px] w-full max-w-md ml-auto border border-white">
              <img 
                src="https://images.unsplash.com/photo-1544928147-79a2dbc1f389?w=800&auto=format&fit=crop&q=80" 
                alt="Artisan crafting" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-4 right-4 md:-left-8 md:bottom-8 bg-white p-5 rounded-[24px] shadow-lg max-w-[200px] border border-[#eef2ff]">
              <p className="text-[0.65rem] font-bold text-[#5d6a84] italic leading-relaxed uppercase tracking-wide">
                "Craftsmanship is the heart of every single item we curate."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. The WonderCart Journey */}
      <section className="px-4 py-12 bg-white border-y border-[#eef2ff]">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <div className="grid grid-cols-2 gap-3 auto-rows-[140px] md:auto-rows-[180px]">
            <img src="https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=600&auto=format&fit=crop&q=80" alt="Decor" className="w-full h-full object-cover rounded-[20px] border border-[#eef2ff]" />
            <img src="https://images.unsplash.com/photo-1513694203232-719a280e022f?w=600&auto=format&fit=crop&q=80" alt="Plant art" className="w-full h-full object-cover rounded-[20px] row-span-2 border border-[#eef2ff]" />
            <img src="https://images.unsplash.com/photo-1538688525198-9b88f6f53126?w=600&auto=format&fit=crop&q=80" alt="Furniture" className="w-full h-full object-cover rounded-[20px] row-span-2 border border-[#eef2ff]" />
            <img src="https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=600&auto=format&fit=crop&q=80" alt="Interior" className="w-full h-full object-cover rounded-[20px] border border-[#eef2ff]" />
          </div>
          
          <div className="max-w-xl">
             <div className="inline-flex items-center gap-2 mb-4">
                <div className="w-8 h-px bg-[#0f49d7]"></div>
                <span className="text-[0.62rem] font-bold uppercase tracking-widest text-[#0f49d7]">Our Legacy</span>
             </div>
            <h2 className="text-[1.8rem] md:text-[2.2rem] font-bold text-[#11182d] mb-6 leading-tight tracking-tight">
              The WonderCart Journey
            </h2>
            <div className="space-y-4 text-[#42506d] text-[0.78rem] leading-relaxed font-medium">
              <p>
                Founded in 2024, WonderCart began with a simple observation: the digital marketplace had become a warehouse of noise. Beautiful products were buried under algorithms that prioritized speed over story.
              </p>
              <p>
                A place where "curation" isn't a buzzword, but the foundation of every decision. We travel to find vendors who put their heart into their craft.
              </p>
              <p>
                Today, WonderCart stands as a sanctuary for creator and consumer—a platform where quality is the only metric that matters.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Mission & Vision */}
      <section className="px-4 py-12 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white border border-[#eef2ff] rounded-[32px] p-8 md:p-10 shadow-sm">
            <div className="w-12 h-12 bg-[#f8f9fc] border border-[#eef2ff] rounded-xl flex items-center justify-center text-[#0f49d7] mb-6">
              <Target className="w-5 h-5" />
            </div>
            <h3 className="text-[1.1rem] font-bold text-[#11182d] mb-3 uppercase tracking-widest">Our Mission</h3>
            <p className="text-[#42506d] text-[0.78rem] leading-relaxed max-w-md font-medium">
              To empower independent artisans by providing a premium platform that celebrates their craftsmanship and connects them with a global audience of conscious consumers.
            </p>
          </div>
          <div className="bg-white border border-[#eef2ff] rounded-[32px] p-8 md:p-10 shadow-sm">
            <div className="w-12 h-12 bg-[#f8f9fc] border border-[#eef2ff] rounded-xl flex items-center justify-center text-[#0f49d7] mb-6">
              <Eye className="w-5 h-5" />
            </div>
            <h3 className="text-[1.1rem] font-bold text-[#11182d] mb-3 uppercase tracking-widest">Our Vision</h3>
            <p className="text-[#42506d] text-[0.78rem] leading-relaxed max-w-md font-medium">
              To become the world's most trusted destination for editorial commerce, where every purchase supports sustainable craftsmanship and artistic integrity.
            </p>
          </div>
        </div>
      </section>

      {/* 4. Pillars */}
      <section className="px-4 py-12 max-w-7xl mx-auto border-t border-[#eef2ff]">
        <div className="text-center mb-10">
           <div className="inline-block px-4 py-1.5 bg-[#f8f9fc] text-[#0f49d7] text-[0.62rem] font-bold uppercase tracking-widest rounded-full mb-3 border border-[#eef2ff]">
             Corporate values
           </div>
          <h2 className="text-[1.8rem] font-bold text-[#11182d] tracking-tight">
            The Pillars of WonderCart
          </h2>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: CheckCircle2, title: "Quality", desc: "Rigorous selection to ensure premium standards." },
            { icon: Gem, title: "Integrity", desc: "Fair pricing for all stakeholders involved." },
            { icon: Lightbulb, title: "Innovation", desc: "A seamless editorial shopping experience." },
            { icon: Users, title: "Community", desc: "Fostering connections between makers." }
          ].map((pillar, i) => (
            <div key={i} className="bg-white border border-[#eef2ff] rounded-[24px] p-6 shadow-sm">
              <div className="w-10 h-10 bg-[#f8f9fc] rounded-xl flex items-center justify-center text-[#0f49d7] mb-4 border border-[#eef2ff]">
                <pillar.icon className="w-4.5 h-4.5" />
              </div>
              <h4 className="font-bold text-[#11182d] mb-2 text-[0.78rem] uppercase tracking-widest">{pillar.title}</h4>
              <p className="text-[#5d6a84] text-[0.7rem] leading-relaxed font-medium">{pillar.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Unwavering Commitment */}
      <section className="px-4 pb-12 max-w-7xl mx-auto">
        <div className="relative rounded-[32px] overflow-hidden bg-[#11182d] p-10 md:p-14 text-center shadow-xl">
           <div className="absolute top-0 right-0 w-64 h-64 bg-[#0f49d7]/10 rounded-full blur-3xl -mr-32 -mt-32" />
          <div className="relative z-10 max-w-3xl mx-auto">
            <h2 className="text-[1.8rem] md:text-[2.2rem] font-bold text-white mb-4 leading-tight tracking-tight">
              Unwavering Commitment
            </h2>
            <p className="text-white/60 text-[0.74rem] leading-relaxed mb-10 max-w-2xl mx-auto uppercase tracking-widest font-bold">
              Whether you are a vendor or a customer, WonderCart is dedicated to your absolute success.
            </p>
            
            <div className="flex flex-wrap justify-center gap-4">
              {[
                { icon: HeadphonesIcon, label: "24/7 Support" },
                { icon: Lock, label: "Secure Gateway" },
                { icon: Globe, label: "Global Network" }
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 px-5 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-[0.62rem] font-bold tracking-widest uppercase">
                  <item.icon className="w-3.5 h-3.5 text-[#0f49d7]" /> {item.label}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
