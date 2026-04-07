import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay, EffectFade } from "swiper/modules";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/effect-fade";

function HeroSlider() {
  const heroSlides = [
    {
      id: 1,
      subtitle: "EXCLUSIVE LAUNCH",
      title: "The Modern Editorial Series.",
      description: "Curated selection of premium essentials from global artisans.",
      image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80",
      secondaryImage: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&auto=format&fit=crop&q=80",
    },
    {
      id: 2,
      subtitle: "TECH ESSENTIALS",
      title: "Audio Perfection Reimagined.",
      description: "Discover the next generation of studio-grade sound equipment.",
      image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80",
      secondaryImage: "https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=400&auto=format&fit=crop&q=80",
    }
  ];

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Swiper
        modules={[Autoplay, Pagination, EffectFade]}
        effect="fade"
        autoplay={{ delay: 6000 }}
        pagination={{ clickable: true, el: ".hero-pagination" }}
        loop={true}
        className="rounded-3xl overflow-hidden"
      >
        {heroSlides.map((slide) => (
          <SwiperSlide key={slide.id}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-[500px]">
              {/* Left Panel - Hero Content */}
              <div className="lg:col-span-2 bg-gradient-to-br from-[#004ac6] to-[#2563eb] rounded-3xl p-8 md:p-12 lg:p-16 flex flex-col justify-center text-white relative overflow-hidden">
                <div className="relative z-10">
                  <span className="font-body text-[0.76rem] md:text-sm font-semibold tracking-[0.2em] text-white/80 block mb-4 uppercase">
                    {slide.subtitle}
                  </span>
                  <h1 className="font-display text-[1.75rem] md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1] mb-6 max-w-xl">
                    {slide.title}
                  </h1>
                  <p className="font-body text-[0.82rem] md:text-base text-white/80 mb-10 max-w-md leading-relaxed">
                    {slide.description}
                  </p>
                  <Link to="/shop">
                    <button className="bg-white text-[#004ac6] font-semibold rounded-lg px-8 py-4 hover:scale-[1.02] transition-all duration-300 shadow-lg shadow-blue-900/20">
                      Explore Now
                    </button>
                  </Link>
                </div>

                {/* Decorative Elements */}
                <div className="absolute top-[-10%] right-[-5%] w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-[-5%] left-[-5%] w-48 h-48 bg-[#2563eb]/20 rounded-full blur-2xl"></div>
              </div>

              {/* Right Panel - Stacked Cards */}
              <div className="flex flex-col gap-6">
                <div className="flex-1 bg-[#f0f4ff] rounded-3xl p-6 flex flex-col items-center justify-center relative overflow-hidden group">
                  <img
                    src={slide.image}
                    alt="Featured"
                    className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute bottom-6 left-6">
                    <p className="font-display font-semibold text-[#141b2d] text-[0.9rem]">New Arrivals</p>
                    <p className="font-body text-[0.76rem] text-[#5c6880]">Shop the collection</p>
                  </div>
                </div>
                <div className="flex-1 bg-[#e1e8fd] rounded-3xl p-6 flex flex-col items-center justify-center relative overflow-hidden group">
                  <img
                    src={slide.secondaryImage}
                    alt="Trending"
                    className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute bottom-6 left-6">
                    <p className="font-display font-semibold text-[#141b2d] text-[0.9rem]">Tech Deals</p>
                    <p className="font-body text-[0.76rem] text-[#5c6880]">Up to 40% Off</p>
                  </div>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
        {/* Custom Pagination */}
        <div className="hero-pagination flex justify-center gap-2 mt-6"></div>
      </Swiper>

      <style jsx>{`
        .hero-pagination :global(.swiper-pagination-bullet) {
          width: 8px;
          height: 8px;
          background: #004ac6;
          opacity: 0.2;
          transition: all 0.3s;
        }
        .hero-pagination :global(.swiper-pagination-bullet-active) {
          width: 24px;
          border-radius: 4px;
          opacity: 1;
        }
      `}</style>
    </section>
  );
}

export default HeroSlider;
