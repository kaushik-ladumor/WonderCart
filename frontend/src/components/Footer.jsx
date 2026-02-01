import { Link } from "react-router-dom";
import { ShoppingCart, Facebook, Twitter, Instagram, Mail } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-black text-white border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <Link to="/" className="flex items-center gap-2 mb-4">
              <ShoppingCart className="w-7 h-7" />
              <span className="text-xl font-bold">WonderCart</span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed">
              A modern e-commerce platform delivering quality products with
              secure checkout and fast delivery.
            </p>

            <div className="flex gap-4 mt-4">
              <Facebook className="w-5 h-5 hover:text-gray-300 cursor-pointer" />
              <Twitter className="w-5 h-5 hover:text-gray-300 cursor-pointer" />
              <Instagram className="w-5 h-5 hover:text-gray-300 cursor-pointer" />
              <Mail className="w-5 h-5 hover:text-gray-300 cursor-pointer" />
            </div>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <Link to="/" className="hover:text-white">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/shop" className="hover:text-white">
                  Shop
                </Link>
              </li>
              <li>
                <Link to="/categories" className="hover:text-white">
                  Categories
                </Link>
              </li>
              <li>
                <Link to="/deals" className="hover:text-white">
                  Deals
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold mb-4">Support</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <Link to="/contact" className="hover:text-white">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/faq" className="hover:text-white">
                  FAQ
                </Link>
              </li>
              <li>
                <Link to="/shipping" className="hover:text-white">
                  Shipping
                </Link>
              </li>
              <li>
                <Link to="/returns" className="hover:text-white">
                  Returns
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="font-semibold mb-4">Newsletter</h3>
            <p className="text-gray-400 text-sm mb-3">
              Get updates on new arrivals and exclusive offers.
            </p>
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full bg-gray-800 px-4 py-2 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white"
            />
            <button className="w-full bg-white text-black mt-3 py-2 rounded-lg font-semibold hover:bg-gray-200">
              Subscribe
            </button>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-10 pt-6 text-center text-sm text-gray-400">
          © {new Date().getFullYear()} WonderCart. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
