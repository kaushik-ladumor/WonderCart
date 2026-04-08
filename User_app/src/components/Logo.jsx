import { ShoppingBag } from "lucide-react";
import { Link } from "react-router-dom";

export default function Logo({ className = "", lightText = false }) {
  return (
    <Link
      to="/"
      className={`flex items-center gap-2.5 group transition-all duration-300 overflow-hidden ${className}`}
    >
      <div className="flex items-center justify-center w-8 h-8 rounded-[10px] bg-gradient-to-br from-[#0f49d7] to-[#3a70f5] text-white shadow-[0_4px_12px_rgba(15,73,215,0.25)] group-hover:scale-105 group-hover:-rotate-3 transition-transform duration-300 shrink-0">
        <ShoppingBag className="w-4 h-4 ml-[0px] mt-[0px]" strokeWidth={2.5} />
      </div>
      <span className="text-[1.45rem] font-extrabold tracking-[-0.03em] whitespace-nowrap pt-0.5">
        <span className={lightText ? "text-white" : "text-[#11182d]"}>Wonder</span>
        <span className="text-[#0f49d7]">Cart</span>
      </span>
    </Link>
  );
}
