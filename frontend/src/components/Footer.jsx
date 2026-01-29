import { Link } from "react-router-dom";
import { ShoppingCart, Facebook, Twitter, Instagram, Mail } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-black text-white mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Column */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center space-x-2">
              <ShoppingCart className="h-8 w-8" />
              <span className="text-2xl font-bold">WonderCart</span>
            </Link>
            <p className="text-gray-300">
              Your one-stop destination for all shopping needs. Quality products
              at amazing prices.
            </p>
            <div className="flex space-x-4">
              <a
                href="https://www.facebook.com/profile.php?id=100087449514921"
                className="hover:text-gray-300"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="https://x.com/kaushik_ahir04"
                className="hover:text-gray-300"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="https://www.instagram.com/kaushik_ahir04/"
                className="hover:text-gray-300"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="https://mail.google.com/mail/u/0/#inbox?compose=new"
                className="hover:text-gray-300"
              >
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-300 hover:text-white">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/profile" className="text-gray-300 hover:text-white">
                  Profile
                </Link>
              </li>
              <li>
                <Link to="#" className="text-gray-300 hover:text-white">
                  Products
                </Link>
              </li>
              <li>
                <Link to="#" className="text-gray-300 hover:text-white">
                  Categories
                </Link>
              </li>
              <li>
                <Link to="#" className="text-gray-300 hover:text-white">
                  Deals
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Customer Service</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/contact" className="text-gray-300 hover:text-white">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-gray-300 hover:text-white">
                  FAQ
                </Link>
              </li>
              <li>
                <Link to="/shipping" className="text-gray-300 hover:text-white">
                  Shipping Policy
                </Link>
              </li>
              <li>
                <Link to="/returns" className="text-gray-300 hover:text-white">
                  Returns & Refunds
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-gray-300 hover:text-white">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Stay Updated</h3>
            <p className="text-gray-300 mb-4">
              Subscribe to our newsletter for latest updates.
            </p>
            <form className="space-y-2">
              <input
                type="email"
                placeholder="Your email"
                className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white"
              />
              <button
                type="submit"
                className="w-full bg-white text-black px-4 py-2 rounded-lg font-medium hover:bg-gray-100"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-300">
          <p>
            &copy; {new Date().getFullYear()} WonderCart. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
