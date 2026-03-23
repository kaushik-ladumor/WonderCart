import { Link } from "react-router-dom";
import {
  Twitter,
  Instagram,
  Youtube,
  CreditCard,
  Wallet,
  Coins
} from "lucide-react";

function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    shop: [
      { name: "New Arrivals", path: "/shop" },
      { name: "Best Sellers", path: "/shop" },
      { name: "Electronics", path: "/shop" },
      { name: "Lifestyle", path: "/shop" },
    ],
    legal: [
      { name: "Privacy Policy", path: "/privacy" },
      { name: "Terms of Service", path: "/terms" },
      { name: "Shipping Info", path: "/shipping" },
      { name: "Returns", path: "/returns" },
    ],
    support: [
      { name: "Contact Us", path: "/contact" },
      { name: "FAQ", path: "/faq" },
      { name: "Track Order", path: "/track-order" },
    ]
  };

  return (
    <footer className="bg-[#f0f4ff] pt-20 pb-10 border-t border-[#e1e8fd]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">

          {/* Brand */}
          <div className="lg:col-span-2">
            <Link to="/" className="font-display font-bold text-2xl text-[#141b2d] tracking-tight">
              WonderCart
            </Link>
            <p className="font-body text-sm text-[#5c6880] mt-6 max-w-xs leading-relaxed">
              Experience curated editorial commerce. Premium essentials for the modern lifestyle, thoughtfully selected for you.
            </p>
          </div>

          {/* Links Columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h3 className="font-body text-xs uppercase tracking-[0.2em] font-bold text-[#141b2d] mb-8">
                {title}
              </h3>
              <ul className="space-y-4">
                {links.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.path}
                      className="font-body text-sm text-[#5c6880] hover:text-[#004ac6] transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-[#e1e8fd] flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="font-body text-xs text-[#5c6880]">
            © {currentYear} WonderCart. Curated Quality.
          </p>
          <div className="flex gap-8">
            <Link to="/privacy" className="font-body text-xs text-[#5c6880] hover:text-[#141b2d]">Privacy</Link>
            <Link to="/terms" className="font-body text-xs text-[#5c6880] hover:text-[#141b2d]">Terms</Link>
            <Link to="/shipping" className="font-body text-xs text-[#5c6880] hover:text-[#141b2d]">Shipping</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;

