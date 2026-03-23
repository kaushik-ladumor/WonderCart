import React from "react";
import { Home } from "lucide-react";
import { Link } from "react-router-dom";

const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-[#f9f9ff] flex flex-col relative overflow-hidden">
      {/* Soft Background Glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-100/40 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-white rounded-full blur-[60px] pointer-events-none" />

      <div className="flex-1 flex items-center justify-center p-6 relative z-10">
        <div className="max-w-md w-full bg-white rounded-[2.5rem] p-10 md:p-12 text-center shadow-[0_20px_60px_-15px_rgba(20,27,45,0.06)] border border-white">
          <h1 className="font-display text-[4.5rem] md:text-[6rem] font-extrabold text-[#141b2d] leading-none tracking-tighter mb-4">
            404
          </h1>
          
          <div className="space-y-2 mb-8">
            <h2 className="font-display text-lg font-bold text-[#141b2d] tracking-tight">
              Page not found
            </h2>
            <p className="font-body text-[11px] text-[#5c6880] max-w-[200px] mx-auto leading-relaxed">
              This page doesn't exist or has been moved.
            </p>
          </div>

          <Link
            to="/"
            className="inline-flex items-center gap-2 px-7 py-3.5 bg-[#141b2d] text-white rounded-xl font-display font-bold text-[9px] uppercase tracking-[0.2em] hover:bg-[#004ac6] transition-all hover:scale-105 active:scale-95 shadow-xl shadow-black/10"
          >
            <Home className="w-3.5 h-3.5" strokeWidth={2.5} />
            Back to Home
          </Link>
        </div>
      </div>

      {/* Minimalist Footer */}
      <footer className="w-full max-w-7xl mx-auto px-10 py-8 flex flex-col md:flex-row items-center justify-between text-[#5c6880] opacity-40 relative z-10 border-t border-[#f0f4ff]">
        <div className="flex flex-col items-center md:items-start gap-1 mb-6 md:mb-0">
          <span className="font-display font-bold text-xs tracking-tight text-[#141b2d]">WonderCart</span>
          <span className="text-[9px] uppercase font-medium tracking-widest">© 2024 WonderCart. Curated with intention.</span>
        </div>
        
        <div className="flex gap-6 text-[8px] font-bold uppercase tracking-[0.2em]">
          <Link to="#" className="hover:text-[#004ac6] transition-colors">Privacy Policy</Link>
          <Link to="#" className="hover:text-[#004ac6] transition-colors">Terms of Service</Link>
          <Link to="#" className="hover:text-[#004ac6] transition-colors">Shipping</Link>
          <Link to="#" className="hover:text-[#004ac6] transition-colors">Contact</Link>
        </div>
      </footer>
    </div>
  );
};

export default NotFoundPage;
