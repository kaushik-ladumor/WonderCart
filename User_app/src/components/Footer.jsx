import { Link } from "react-router-dom";
import {
  Globe,
  ShieldCheck,
  Truck,
  RefreshCcw,
  HelpCircle,
  Info,
  Mail,
  ShoppingBag,
  Star,
  MapPin
} from "lucide-react";
import Logo from "./Logo";

function Footer() {
  const currentYear = new Date().getFullYear();

  const footerGroups = [
    {
      title: "Marketplace",
      icon: <ShoppingBag className="w-4 h-4" />,
      links: [
        { name: "Explore Shop", path: "/shop" },
        { name: "Top Sellers", path: "/top-sellers" },
        { name: "Deals & Offers", path: "/deals" },
        { name: "My Wishlist", path: "/wishlist" },
      ]
    },
    {
      title: "Help & Support",
      icon: <HelpCircle className="w-4 h-4" />,
      links: [
        { name: "Contact Us", path: "/contact" },
        { name: "FAQs", path: "/faq" },
        { name: "Track Order", path: "/track-order" },
        { name: "Returns & Refunds", path: "/returns" },
      ]
    },
    {
      title: "Company & Legal",
      icon: <ShieldCheck className="w-4 h-4" />,
      links: [
        { name: "About WonderCart", path: "/about" },
        { name: "Privacy Policy", path: "/privacy" },
        { name: "Terms of Service", path: "/terms" },
        { name: "Shipping Policy", path: "/shipping" },
      ]
    }
  ];

  return (
    <footer className="bg-[#f8f9fc] pt-6 pb-2 border-t border-[#eef2ff]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-x-4 gap-y-8 lg:gap-8 mb-6 mt-2">

          {/* Brand & Mission */}
          <div className="col-span-2 sm:col-span-3 lg:col-span-2">
            <div className="inline-block mb-4">
              <Logo />
            </div>
            <p className="text-[0.78rem] text-[#42506d] max-w-xs leading-relaxed">
              Experience curated editorial commerce. Premium essentials for the modern lifestyle, selected for the global collector.
            </p>
          </div>

          {/* Dynamic Link Groups */}
          {footerGroups.map((group) => (
            <div key={group.title}>
              <div className="flex items-center gap-2 mb-4 text-[#11182d]">
                <div className="text-[#0f49d7]">{group.icon}</div>
                <h3 className="text-[10px] font-semibold uppercase tracking-widest">
                  {group.title}
                </h3>
              </div>
              <ul className="space-y-2.5">
                {group.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.path}
                      className="text-[0.76rem] font-medium text-[#42506d] hover:text-[#0f49d7] transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Feature Badges */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4 border-t border-[#eef2ff]">
          {[
            { icon: Globe, text: "Global Shipping" },
            { icon: Truck, text: "Fast Delivery" },
            { icon: RefreshCcw, text: "Easy Returns" },
            { icon: Star, text: "Top Rated" }
          ].map((item, i) => (
            <div key={i} className="flex items-center justify-center gap-2 py-1">
              <item.icon className="w-3.5 h-3.5 text-[#0f49d7]" />
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[#11182d]">{item.text}</span>
            </div>
          ))}
        </div>

        {/* Legal & Copyright */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-[#eef2ff]">
          <p className="text-[9px] text-[#8693a8] font-semibold uppercase tracking-[0.15em] text-center sm:text-left">
            © {currentYear} WonderCart. All Rights Reserved.
          </p>

          <div className="flex items-center gap-2 p-1.5 px-3 bg-white rounded-full border border-[#eef2ff] shadow-sm">
             <div className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse"></div>
             <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-[#11182d]">Systems Operational</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;

