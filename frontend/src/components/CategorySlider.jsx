import { ArrowUpRight } from "lucide-react";

function CategorySlider({ categories, onCategoryClick }) {
  const categoryImages = {
    clothing: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=600&auto=format&fit=crop&q=80",
    footwear: "https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=600&auto=format&fit=crop&q=80",
    electronics: "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=600&auto=format&fit=crop&q=80",
    "home & kitchen": "https://images.unsplash.com/photo-1556911220-bff31c812dba?w=600&auto=format&fit=crop&q=80",
    beauty: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600&auto=format&fit=crop&q=80",
    wellness: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&auto=format&fit=crop&q=80",
  };

  return (
    <section className="py-20 bg-[#f9f9ff]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-12">
          <div>
            <h2 className="font-display text-4xl font-bold text-[#141b2d] tracking-tight">
              Curated Categories
            </h2>
            <p className="font-body text-sm text-[#5c6880] mt-2">
              Explore our hand-picked selections by theme.
            </p>
          </div>
          <button className="font-body text-sm font-semibold text-[#004ac6] hover:underline flex items-center gap-2">
            View All <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.slice(0, 5).map((category, index) => (
            <div
              key={index}
              onClick={() => onCategoryClick(category)}
              className={`group cursor-pointer bg-white rounded-3xl overflow-hidden relative min-h-[300px] flex flex-col transition-all duration-500 hover:scale-[1.02] ${index === 0 ? "lg:col-span-2 lg:row-span-2" : ""
                }`}
            >
              <div className="absolute inset-0 bg-[#f0f4ff]/50 mix-blend-multiply group-hover:bg-[#f0f4ff]/70 transition-colors"></div>
              <img
                src={categoryImages[category.toLowerCase()] || "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&auto=format&fit=crop&q=80"}
                alt={category}
                className="absolute inset-0 w-full h-full object-cover mix-blend-multiply group-hover:scale-110 transition-transform duration-700"
              />
              <div className="relative mt-auto p-8 z-10">
                <p className="font-body text-[10px] uppercase tracking-[0.2em] text-[#5c6880] font-bold mb-2">
                  Category
                </p>
                <h3 className={`font-display font-bold text-[#141b2d] ${index === 0 ? "text-3xl" : "text-xl"}`}>
                  {category}
                </h3>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default CategorySlider;

