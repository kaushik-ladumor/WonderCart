import { Link } from "react-router-dom";

export default function Logo({ className = "", size = "h-14" }) {
  return (
    <Link
      to="/"
      className={`flex items-center group transition-all duration-300 overflow-hidden ${className}`}
    >
      <img 
        src="/WonderCart Logo.png" 
        alt="WonderCart" 
        className={`${size} w-auto object-contain`}
      />
    </Link>
  );
}
