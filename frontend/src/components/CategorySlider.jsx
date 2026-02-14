// import { Swiper, SwiperSlide } from "swiper/react";
// import { Navigation } from "swiper/modules";
// import { ArrowUpRight } from "lucide-react";

// // Import Swiper styles
// import "swiper/css";
// import "swiper/css/navigation";

// function CategorySlider({ categories, onCategoryClick }) {
//   // Category images with full color
//   const categoryImages = {
//     clothing:
//       "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=600&auto=format&fit=crop&q=80",
//     footwear:
//       "https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=600&auto=format&fit=crop&q=80",
//     electronics:
//       "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=600&auto=format&fit=crop&q=80",
//     "home & kitchen":
//       "https://images.unsplash.com/photo-1556911220-bff31c812dba?w=600&auto=format&fit=crop&q=80",
//     books:
//       "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=600&auto=format&fit=crop&q=80",
//     sports:
//       "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=600&auto=format&fit=crop&q=80",
//     beauty:
//       "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600&auto=format&fit=crop&q=80",
//     accessories:
//       "https://images.unsplash.com/photo-1526170375885-4d8ecbc6058e?w=600&auto=format&fit=crop&q=80",
//   };

//   return (
//     <section className="py-12 sm:py-16 md:py-20 lg:py-24 bg-white">
//       <div className="container mx-auto px-4 sm:px-6 lg:px-8">
//         {/* Header */}
//         <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 sm:mb-12 gap-4">
//           <div>
//             <p className="text-xs sm:text-sm tracking-[0.3em] text-gray-500 mb-2">
//               Shop By
//             </p>
//             <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold">
//               CATEGORIES
//             </h2>
//           </div>
//           <button className="group self-start sm:self-auto flex items-center gap-2 text-sm sm:text-base font-semibold hover:gap-3 transition-all">
//             VIEW ALL
//             <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
//           </button>
//         </div>

//         {/* Categories Slider */}
//         <div className="relative">
//           <Swiper
//             modules={[Navigation]}
//             spaceBetween={16}
//             slidesPerView={1.5}
//             navigation={{
//               nextEl: ".category-swiper-button-next",
//               prevEl: ".category-swiper-button-prev",
//             }}
//             breakpoints={{
//               480: {
//                 slidesPerView: 2,
//                 spaceBetween: 16,
//               },
//               640: {
//                 slidesPerView: 2.5,
//                 spaceBetween: 20,
//               },
//               768: {
//                 slidesPerView: 3,
//                 spaceBetween: 24,
//               },
//               1024: {
//                 slidesPerView: 4,
//                 spaceBetween: 24,
//               },
//               1280: {
//                 slidesPerView: 5,
//                 spaceBetween: 32,
//               },
//             }}
//             className="!pb-4"
//           >
//             {categories.map((category, index) => (
//               <SwiperSlide key={index}>
//                 <div
//                   onClick={() => onCategoryClick(category)}
//                   className="group cursor-pointer"
//                 >
//                   {/* Image Container */}
//                   <div className="relative aspect-[3/4] overflow-hidden bg-gray-100 mb-3 sm:mb-4">
//                     <img
//                       src={
//                         categoryImages[category.toLowerCase()] ||
//                         "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&auto=format&fit=crop&q=80"
//                       }
//                       alt={category}
//                       className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
//                     />
//                     <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300"></div>
//                   </div>

//                   {/* Category Name */}
//                   <h3 className="text-sm sm:text-base md:text-lg font-semibold uppercase tracking-wider text-center group-hover:translate-x-1 transition-transform">
//                     {category}
//                   </h3>
//                 </div>
//               </SwiperSlide>
//             ))}
//           </Swiper>

//           {/* Slider Navigation */}
//           <div className="category-swiper-button-prev hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 lg:-translate-x-6 z-10 w-10 h-10 lg:w-12 lg:h-12 bg-white shadow-lg rounded-full items-center justify-center cursor-pointer hover:bg-gray-50 transition-all duration-300 group">
//             <svg
//               className="w-5 h-5 lg:w-6 lg:h-6 text-black group-hover:scale-110 transition-transform"
//               fill="none"
//               stroke="currentColor"
//               viewBox="0 0 24 24"
//             >
//               <path
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 strokeWidth={2}
//                 d="M15 19l-7-7 7-7"
//               />
//             </svg>
//           </div>
//           <div className="category-swiper-button-next hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 lg:translate-x-6 z-10 w-10 h-10 lg:w-12 lg:h-12 bg-white shadow-lg rounded-full items-center justify-center cursor-pointer hover:bg-gray-50 transition-all duration-300 group">
//             <svg
//               className="w-5 h-5 lg:w-6 lg:h-6 text-black group-hover:scale-110 transition-transform"
//               fill="none"
//               stroke="currentColor"
//               viewBox="0 0 24 24"
//             >
//               <path
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 strokeWidth={2}
//                 d="M9 5l7 7-7 7"
//               />
//             </svg>
//           </div>
//         </div>
//       </div>
//     </section>
//   );
// }

// export default CategorySlider;
