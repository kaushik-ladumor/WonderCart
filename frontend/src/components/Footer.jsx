import { Link } from "react-router-dom";
import {
  ShoppingCart,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Mail,
  Phone,
  MapPin,
  ChevronRight
} from "lucide-react";

function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    shop: [
      { name: "All Products", path: "/shop" },
      { name: "Categories", path: "/categories" },
      { name: "Track Order", path: "/track-order" },
      { name: "Wishlist", path: "/wishlist" },
    ],
    support: [
      { name: "Contact Us", path: "/contact" },
      { name: "FAQ", path: "/faq" },
      { name: "Shipping Policy", path: "/shipping" },
      { name: "Returns & Refunds", path: "/returns" },
    ],
    company: [
      { name: "Our Story", path: "/about" },
      { name: "Privacy Policy", path: "/privacy" },
      { name: "Terms of Service", path: "/terms" },
    ]
  };

  return (
    <footer className="bg-black text-white pt-12 pb-6 border-t border-white/5 font-sans">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-10">
          {/* Brand & Mission */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2 group">
              <ShoppingCart className="w-5 h-5" />
              <span className="text-xl font-bold tracking-tighter uppercase transition-colors">
                WonderCart
              </span>
            </Link>
            <p className="text-gray-400 text-[10px] leading-relaxed max-w-xs uppercase tracking-widest font-bold">
              Curating essential lifestyle products with a focus on quality,
              minimalism, and timeless design. Built for the modern standard.
            </p>
            <div className="flex gap-4">
              {[Facebook, Instagram, Twitter, Linkedin].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-8 h-8 flex items-center justify-center border border-white/10 hover:bg-white hover:text-black transition-all"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Shop Links */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest mb-6 text-white">Shop</h3>
            <ul className="space-y-3">
              {footerLinks.shop.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className="group text-[10px] uppercase tracking-[0.2em] text-gray-400 hover:text-white transition-colors flex items-center gap-2 font-bold"
                  >
                    <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 -ml-5 group-hover:ml-0 transition-all" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest mb-6 text-white">Support</h3>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className="group text-[10px] uppercase tracking-[0.2em] text-gray-400 hover:text-white transition-colors flex items-center gap-2 font-bold"
                  >
                    <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 -ml-5 group-hover:ml-0 transition-all" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-widest mb-6 text-white">Contact</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-4 group">
                <MapPin className="w-4 h-4 text-gray-400" />
                <p className="text-[10px] uppercase tracking-widest text-gray-400 leading-relaxed font-bold">
                  123 Design Studio,<br />Modern District, NY 10001
                </p>
              </div>
              <div className="flex items-center gap-4 group cursor-pointer font-bold">
                <Mail className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" />
                <p className="text-[10px] uppercase tracking-widest text-gray-400 group-hover:text-white transition-colors">
                  hello@wondercart.com
                </p>
              </div>
              <div className="flex items-center gap-4 group cursor-pointer font-bold">
                <Phone className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" />
                <p className="text-[10px] uppercase tracking-widest text-gray-400 group-hover:text-white transition-colors">
                  +1 (555) 000-1234
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-[10px] uppercase tracking-[0.3em] text-gray-500 font-bold">
            © {currentYear} WonderCart. Pure Design.
          </p>
          <div className="flex gap-8">
            {footerLinks.company.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className="text-[10px] uppercase tracking-[0.2em] text-gray-500 hover:text-white transition-colors font-bold"
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
