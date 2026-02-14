import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay, EffectFade } from "swiper/modules";
import { ArrowRight } from "lucide-react";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/effect-fade";

function HeroSlider() {
  // Hero slider data with colorful images
  const heroSlides = [
    {
      id: 1,
      title: "THE MINIMALIST COLLECTION",
      subtitle: "EST. 2026",
      description:
        "Define your style with absolute simplicity. Our latest essentials.",
      image:
        "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1600&auto=format&fit=crop&q=80",
      cta: "EXPLORE",
    },
    {
      id: 2,
      title: "MODERN ELECTRONICS",
      subtitle: "PURE TECH",
      description:
        "Experience technology in its purest form. High-performance designs.",
      image:
        "https://plus.unsplash.com/premium_photo-1661304671477-37c77d0c6930?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTN8fGVsZWN0cm9uaWNzfGVufDB8fDB8fHww",
      cta: "SHOP TECH",
    },
    {
      id: 3,
      title: "LUXURY FOOTWEAR",
      subtitle: "STEP IN STYLE",
      description:
        "Discover footwear that makes a statement without saying a word.",
      image:
        "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=1600&auto=format&fit=crop&q=80",
      cta: "VIEW ALL",
    },
  ];

  return (
    <section className="relative w-full h-screen">
      <Swiper
        modules={[Navigation, Pagination, Autoplay, EffectFade]}
        effect="fade"
        navigation={{
          nextEl: ".hero-swiper-button-next",
          prevEl: ".hero-swiper-button-prev",
        }}
        pagination={{
          clickable: true,
          el: ".hero-swiper-pagination",
        }}
        autoplay={{
          delay: 5000,
          disableOnInteraction: false,
        }}
        loop={true}
        speed={1000}
        className="w-full h-full"
      >
        {heroSlides.map((slide) => (
          <SwiperSlide key={slide.id}>
            <div className="relative w-full h-full">
              {/* Background Image */}
              <div className="absolute inset-0 w-full h-full">
                <img
                  src={slide.image}
                  alt={slide.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40"></div>
              </div>

              {/* Content */}
              <div className="relative z-10 h-full flex items-center justify-center px-4 sm:px-6 lg:px-8">
                <div className="text-center text-white max-w-4xl mx-auto">
                  <p className="text-xs sm:text-sm md:text-base tracking-[0.3em] mb-3 sm:mb-4 font-light opacity-90">
                    {slide.subtitle}
                  </p>
                  <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold mb-4 sm:mb-6 tracking-tight leading-tight">
                    {slide.title}
                  </h1>
                  <p className="text-sm sm:text-base md:text-lg lg:text-xl mb-6 sm:mb-8 max-w-2xl mx-auto font-light px-4">
                    {slide.description}
                  </p>
                  <button className="group bg-white text-black px-6 sm:px-8 md:px-10 py-3 sm:py-4 text-xs sm:text-sm md:text-base font-semibold tracking-wider hover:bg-black hover:text-white transition-all duration-300 inline-flex items-center gap-2">
                    {slide.cta}
                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}

        {/* Navigation Buttons */}
        <div className="hero-swiper-button-prev absolute left-2 sm:left-4 md:left-8 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full flex items-center justify-center cursor-pointer hover:bg-white/20 transition-all duration-300 group">
          <svg
            className="w-5 h-5 sm:w-6 sm:h-6 text-white group-hover:scale-110 transition-transform"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </div>
        <div className="hero-swiper-button-next absolute right-2 sm:right-4 md:right-8 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full flex items-center justify-center cursor-pointer hover:bg-white/20 transition-all duration-300 group">
          <svg
            className="w-5 h-5 sm:w-6 sm:h-6 text-white group-hover:scale-110 transition-transform"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </div>

        {/* Pagination */}
        <div className="hero-swiper-pagination absolute bottom-4 sm:bottom-6 md:bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2"></div>
      </Swiper>

      {/* Custom Pagination Styles */}
      <style jsx>{`
        .hero-swiper-pagination :global(.swiper-pagination-bullet) {
          width: 8px;
          height: 8px;
          background: white;
          opacity: 0.5;
          transition: all 0.3s;
        }
        .hero-swiper-pagination :global(.swiper-pagination-bullet-active) {
          width: 32px;
          border-radius: 4px;
          opacity: 1;
        }
        @media (min-width: 640px) {
          .hero-swiper-pagination :global(.swiper-pagination-bullet) {
            width: 10px;
            height: 10px;
          }
          .hero-swiper-pagination :global(.swiper-pagination-bullet-active) {
            width: 40px;
          }
        }
      `}</style>
    </section>
  );
}

export default HeroSlider;
