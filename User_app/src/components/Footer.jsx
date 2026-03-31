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

function Footer() {
  const currentYear = new Date().getFullYear();

  const footerGroups = [
    {
      title: "Marketplace",
      icon: <ShoppingBag className="w-4 h-4" />,
      links: [
        { name: "Explore Shop", path: "/shop" },
        { name: "Top Sellers", path: "/top-sellers" },
        { name: "New Arrivals", path: "/shop" },
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
    <footer className="bg-[#f8f9fc] pt-10 pb-6 border-t border-[#eef2ff]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-8">

          {/* Brand & Mission */}
          <div className="lg:col-span-2">
            <Link to="/" className="inline-block mb-4">
              <span className="text-[1.2rem] font-bold tracking-tighter text-[#11182d] uppercase">
                WonderCart
              </span>
            </Link>
            <p className="text-[0.78rem] text-[#42506d] max-w-xs leading-relaxed mb-6">
              Experience curated editorial commerce. Premium essentials for the modern lifestyle, selected for the global collector.
            </p>
            
            <div className="space-y-3">
              <div className="flex items-center gap-2.5 text-[#42506d]">
                <div className="w-7 h-7 bg-white border border-[#eef2ff] rounded-lg flex items-center justify-center text-[#0f49d7] shadow-sm">
                  <Mail className="w-3.5 h-3.5" />
                </div>
                <span className="text-[0.72rem] font-medium">support@wondercart.com</span>
              </div>
              <div className="flex items-center gap-2.5 text-[#42506d]">
                <div className="w-7 h-7 bg-white border border-[#eef2ff] rounded-lg flex items-center justify-center text-[#0f49d7] shadow-sm">
                  <MapPin className="w-3.5 h-3.5" />
                </div>
                <span className="text-[0.72rem] font-medium">Global HQ • India</span>
              </div>
            </div>
          </div>

          {/* Dynamic Link Groups */}
          {footerGroups.map((group) => (
            <div key={group.title}>
              <div className="flex items-center gap-2 mb-4 text-[#11182d]">
                <div className="text-[#0f49d7]">{group.icon}</div>
                <h3 className="text-[0.6rem] font-bold uppercase tracking-widest">
                  {group.title}
                </h3>
              </div>
              <ul className="space-y-2.5">
                {group.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.path}
                      className="text-[0.72rem] font-medium text-[#42506d] hover:text-[#0f49d7] transition-colors"
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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4 border-y border-[#eef2ff] mb-6">
          {[
            { icon: Globe, text: "Global Shipping" },
            { icon: Truck, text: "Fast Delivery" },
            { icon: RefreshCcw, text: "Easy Returns" },
            { icon: Star, text: "Top Rated" }
          ].map((item, i) => (
            <div key={i} className="flex items-center justify-center gap-2 py-1">
              <item.icon className="w-3.5 h-3.5 text-[#0f49d7]" />
              <span className="text-[0.6rem] font-bold uppercase tracking-wider text-[#11182d]">{item.text}</span>
            </div>
          ))}
        </div>

        {/* Legal & Copyright */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[0.6rem] text-[#5d6a84] font-bold uppercase tracking-widest">
            © {currentYear} WonderCart. All Rights Reserved.
          </p>
          
          <div className="flex items-center gap-6">
             <div className="flex items-center gap-4 text-[0.6rem] font-bold uppercase tracking-widest text-[#42506d]">
                <Link to="/privacy" className="hover:text-[#0f49d7]">Privacy</Link>
                <Link to="/terms" className="hover:text-[#0f49d7]">Terms</Link>
                <Link to="/shipping" className="hover:text-[#0f49d7]">Shipping</Link>
                <Link to="/returns" className="hover:text-[#0f49d7]">Returns</Link>
             </div>
             <div className="h-3 w-px bg-[#eef2ff] hidden md:block"></div>
             <div className="flex items-center gap-2 text-[#0f49d7]">
                <div className="w-1.5 h-1.5 rounded-full bg-[#10b981]"></div>
                <span className="text-[0.6rem] font-bold uppercase tracking-widest text-[#11182d]">Online</span>
             </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;

