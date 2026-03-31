import React, { useState, useRef } from "react";
import axios from "axios";
import { Search, UploadCloud, Camera, ArrowRight, Loader2, Sparkles, Image as ImageIcon, AlertCircle, ShieldCheck } from "lucide-react";
import { API_URL } from "../utils/constants";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

const VisualSearch = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [searchMessage, setSearchMessage] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResults([]);
      setSearchMessage("");
      setHasSearched(false);
    }
  };

  const handleSearch = async () => {
    if (!selectedImage) {
      toast.error("Please upload an image first");
      return;
    }

    setLoading(true);
    setHasSearched(false);
    const formData = new FormData();
    formData.append("images", selectedImage);

    try {
      const { data } = await axios.post(`${API_URL}/visual-search/search`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const matchedResults = data.results || data || [];
      setResults(matchedResults);
      setSearchMessage(data.message || "");
      setHasSearched(true);

      if (matchedResults.length === 0) {
        toast.error(data.message || "No similar products found");
      } else {
        toast.success(`Found ${matchedResults.length} similar product(s)!`);
        setTimeout(() => {
          document.getElementById('search-results')?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    } catch (error) {
      console.error("Search failed:", error);
      toast.error(error.response?.data?.message || "Visual search failed");
      setHasSearched(true);
      setResults([]);
      setSearchMessage("Search failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const loadExample = async (imageUrl) => {
    try {
      toast.success("Loading example image...");
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const file = new File([blob], "example.jpg", { type: "image/jpeg" });
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResults([]);
      setHasSearched(false);
    } catch (error) {
      toast.error("Failed to load example image");
    }
  };

  const getConfidenceInfo = (score) => {
    if (score >= 0.75) return { label: "Excellent Match", color: "bg-emerald-100 text-emerald-700", barColor: "bg-emerald-500" };
    if (score >= 0.60) return { label: "Good Match", color: "bg-blue-100 text-blue-700", barColor: "bg-blue-500" };
    if (score >= 0.50) return { label: "Fair Match", color: "bg-amber-100 text-amber-700", barColor: "bg-amber-500" };
    return { label: "Possible Match", color: "bg-gray-100 text-gray-600", barColor: "bg-gray-400" };
  };

  const examples = [
    { name: "Premium Watch", url: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=500&auto=format&fit=crop" },
    { name: "Performance Shoes", url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&auto=format&fit=crop" },
    { name: "Leather Tote", url: "https://images.unsplash.com/photo-1584916201218-f4242ceb4809?w=500&auto=format&fit=crop" },
    { name: "Studio Audio", url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop" },
    { name: "Essentials Wear", url: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&auto=format&fit=crop" },
  ];

  return (
    <div className="min-h-screen bg-[#f9f9ff] font-body selection:bg-blue-100 selection:text-blue-900 pb-12">
      
      {/* Header Container */}
      <div className="pt-12 pb-6 px-4 text-center max-w-2xl mx-auto">
        <h1 className="font-display text-4xl md:text-[56px] font-extrabold text-[#141b2d] tracking-tight mb-4">
          Visual Search
        </h1>
        <p className="text-[#5c6880] text-sm md:text-[15px] leading-relaxed">
          Find exactly what you're looking for with an image. Our AI-driven engine detects styles, patterns, and brands instantly.
        </p>
      </div>

      {/* Main Upload Box */}
      <div className="px-4 max-w-4xl mx-auto mb-8">
        <div 
          className={`bg-white border-2 border-dashed ${previewUrl ? 'border-[#004ac6] shadow-[0_20px_60px_-15px_rgba(0,74,198,0.1)]' : 'border-gray-200 shadow-sm'} rounded-[2rem] p-8 md:p-10 flex flex-col items-center justify-center text-center transition-all duration-300`}
        >
          {previewUrl ? (
            <div className="w-full max-w-md mx-auto flex flex-col items-center">
              <div className="relative group rounded-2xl overflow-hidden shadow-lg mb-8 border border-gray-100 w-full aspect-square md:aspect-[4/3] bg-gray-50 flex items-center justify-center">
                <img src={previewUrl} alt="Preview" className="max-w-full max-h-full object-contain" />
                <button 
                  onClick={() => fileInputRef.current.click()}
                  className="absolute inset-0 bg-[#141b2d]/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity backdrop-blur-sm"
                >
                  <span className="text-white font-display font-bold text-xs bg-[#141b2d]/50 px-5 py-2.5 rounded-full">Change Image</span>
                </button>
              </div>
              <button
                onClick={handleSearch}
                disabled={loading}
                className="w-full px-10 py-4 bg-[#004ac6] text-white rounded-xl font-display font-bold text-[13px] tracking-wide hover:bg-[#003da1] focus:ring-4 focus:ring-[#004ac6]/20 transition-all shadow-md shadow-[#004ac6]/20 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Analyzing Image...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    Search for Similar Items
                  </>
                )}
              </button>
            </div>
          ) : (
            <>
              <div className="w-16 h-16 bg-[#f0f4ff] rounded-full flex items-center justify-center mb-6">
                <UploadCloud className="w-8 h-8 text-[#004ac6]" />
              </div>
              <h3 className="font-display font-bold text-[#141b2d] text-xl mb-3 tracking-tight">
                Drag and drop an image here
              </h3>
              <p className="text-[#5c6880] text-xs font-medium mb-8">
                Supported formats: JPG, PNG, WEBP. Max size 5MB.
              </p>
              <button 
                onClick={() => fileInputRef.current.click()}
                className="px-8 py-3 bg-[#004ac6] text-white rounded-xl font-display font-bold text-[13px] hover:bg-[#003da1] transition-all shadow-md shadow-[#004ac6]/20"
              >
                Upload Image
              </button>
            </>
          )}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept="image/*"
          />
        </div>
      </div>

      {/* Try these examples section */}
      {!hasSearched && !loading && (
        <div className="max-w-4xl mx-auto px-4 mt-6">
          <div className="border-t border-gray-200/60 pt-6">
            <h3 className="font-display font-extrabold text-[#141b2d] text-lg mb-6">
              Try these examples
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 md:gap-6">
              {examples.map((ex, idx) => (
                <div 
                  key={idx} 
                  className="group cursor-pointer flex flex-col items-center"
                  onClick={() => loadExample(ex.url)}
                >
                  <div className="w-full aspect-square rounded-[1.25rem] overflow-hidden bg-white hover:bg-gray-50 transition-colors p-2 md:p-3 shadow-sm border border-transparent group-hover:border-gray-200">
                    <img src={ex.url} alt={ex.name} className="w-full h-full object-cover rounded-[0.85rem] group-hover:scale-[1.03] transition-transform duration-500 mix-blend-multiply" />
                  </div>
                  <span className="text-[10px] font-bold text-[#5c6880] mt-4 tracking-wide text-center">{ex.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Results Section */}
      {hasSearched && (
        <div id="search-results" className="max-w-5xl mx-auto px-4 mt-10 pt-10 border-t border-gray-200/80">
          {results.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center bg-white border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[2rem] space-y-6">
              <div className="w-16 h-16 bg-[#fff5f5] rounded-full flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-[#ef4444]" />
              </div>
              <div className="space-y-2 max-w-md">
                <p className="text-xl font-display font-extrabold tracking-tight text-[#141b2d]">No Similar Products Found</p>
                <p className="text-[#5c6880] text-[13px] leading-relaxed">
                  {searchMessage || "We couldn't find a close match for this image in our catalog. Try uploading a different image or a product that's in our collection."}
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 mt-6">
                <button
                  onClick={() => {
                    fileInputRef.current.click();
                    setHasSearched(false);
                  }}
                  className="px-6 py-3 bg-white border border-gray-200 text-[#141b2d] rounded-xl font-display font-bold text-xs hover:bg-gray-50 transition-all shadow-sm"
                >
                  Try Another Image
                </button>
                <Link
                  to="/shop"
                  className="px-6 py-3 bg-[#141b2d] text-white rounded-xl font-display font-bold text-xs hover:bg-[#004ac6] transition-all shadow-md shadow-black/10"
                >
                  Browse Catalog
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                <h2 className="text-2xl font-display font-extrabold tracking-tight text-[#141b2d]">Similar Matches</h2>
                <div className="px-4 py-1.5 bg-white border border-gray-200 rounded-full flex items-center shadow-sm">
                  <span className="text-[10px] font-bold text-[#5c6880] uppercase tracking-widest">
                    <span className="text-[#004ac6] mr-1">{results.length}</span> Results Found
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {results.map((product) => {
                  const confidence = getConfidenceInfo(product.similarityScore);
                  return (
                    <Link
                      key={product._id}
                      to={`/product-detail/${product._id}`}
                      className="group bg-white p-5 rounded-[1.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_60px_-15px_rgba(0,74,198,0.1)] border border-transparent hover:border-[#e1e8fd] transition-all duration-300 flex flex-col h-full"
                    >
                      <div className="w-full aspect-[4/5] rounded-[1rem] overflow-hidden bg-[#f9f9ff] mb-5 relative">
                        <img
                          src={product.variants[0]?.images[0]}
                          alt={product.name}
                          className="w-full h-full object-cover mix-blend-multiply transition-transform duration-700 group-hover:scale-105"
                        />
                        {/* Similarity Confidence Badge */}
                        {product.similarityScore && (
                          <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-white/90 backdrop-blur-md px-2.5 py-1.5 rounded-lg shadow-sm">
                            <ShieldCheck className={`w-3.5 h-3.5 ${confidence.color.split(' ')[1]}`} />
                            <span className="text-[10px] font-bold text-[#141b2d]">{Math.round(product.similarityScore * 100)}% Match</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex flex-col flex-1">
                        <p className="text-[10px] font-bold text-[#004ac6] uppercase tracking-[0.15em] mb-1.5">{product.category}</p>
                        <h3 className="text-[15px] font-display font-bold text-[#141b2d] leading-snug mb-3 line-clamp-2">
                          {product.name}
                        </h3>
                        <div className="mt-auto flex items-end justify-between pt-4 border-t border-gray-100">
                          <p className="text-lg font-bold text-[#141b2d]">
                            ₹{product.variants[0]?.sizes[0]?.sellingPrice?.toLocaleString()}
                          </p>
                          <div className="w-8 h-8 rounded-full bg-[#f9f9ff] flex items-center justify-center group-hover:bg-[#004ac6] transition-colors">
                            <ArrowRight className="w-4 h-4 text-[#141b2d] group-hover:text-white transition-colors" />
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default VisualSearch;
