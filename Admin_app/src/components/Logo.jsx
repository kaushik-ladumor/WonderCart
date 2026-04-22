import { ShoppingBag } from "lucide-react";

export default function Logo({ className = "", lightText = false }) {
  return (
    <div
      className={`flex items-center gap-2.5 overflow-hidden ${className}`}
    >
      <div className="flex items-center justify-center w-8 h-8 rounded-[10px] bg-[#0f49d7] text-white shrink-0">
        <ShoppingBag className="w-4 h-4" strokeWidth={2.5} />
      </div>
      <span className="text-[1.45rem] font-extrabold tracking-[-0.03em] whitespace-nowrap pt-0.5">
        <span className={lightText ? "text-white" : "text-[#11182d]"}>Wonder</span>
        <span className="text-[#0f49d7]">Cart</span>
      </span>
    </div>
  );
}
