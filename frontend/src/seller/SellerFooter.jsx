// src/seller/components/SellerFooter.jsx
import React from "react";
import {
  ShoppingBag,
  Shield,
  Truck,
  CreditCard,
  ChevronRight,
} from "lucide-react";
import { motion } from "framer-motion";

const SellerFooter = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = [
    {
      title: "Seller Features",
      items: [
        { icon: Shield, label: "Secure Payments" },
        { icon: Truck, label: "Advanced Shipping" },
        { icon: CreditCard, label: "Instant Payouts" },
      ],
    },
    {
      title: "Resources",
      items: [
        { label: "Help Center" },
        { label: "Seller Academy" },
        { label: "Community Forum" },
        { label: "API Docs" },
      ],
    },
    {
      title: "Company",
      items: [
        { label: "About Us" },
        { label: "Careers" },
        { label: "Press Kit" },
        { label: "Partner Program" },
      ],
    },
    {
      title: "Legal",
      items: [
        { label: "Terms of Service" },
        { label: "Privacy Policy" },
        { label: "Seller Agreement" },
        { label: "Cookie Policy" },
      ],
    },
  ];

  return (
    <footer className="bg-black text-white mt-20">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Brand Column - Same width as others */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white rounded-2xl">
                <ShoppingBag className="w-7 h-7 text-black" />
              </div>
              <span className="text-2xl font-bold">SellerHub</span>
            </div>
            <p className="text-gray-400 leading-relaxed text-sm">
              The complete platform for sellers to manage, grow, and scale their
              online business with confidence.
            </p>
          </motion.div>

          {/* Other Columns - Equal width, centered content */}
          {footerLinks.map((section, index) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 + 0.2 }}
              className="space-y-5"
            >
              <h3 className="text-lg font-semibold text-white">
                {section.title}
              </h3>
              <ul className="space-y-3">
                {section.items.map((item, i) => (
                  <motion.li
                    key={i}
                    whileHover={{ x: 8 }}
                    transition={{ duration: 0.3 }}
                  >
                    <button className="group flex items-center gap-3 text-gray-400 hover:text-white transition-colors duration-300 text-sm font-medium">
                      {item.icon && (
                        <item.icon className="w-4 h-4 text-gray-500 group-hover:text-white transition-colors" />
                      )}
                      <span className="flex items-center gap-1">
                        {item.label}
                        <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </span>
                    </button>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Bottom Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
          className="mt-10 pt-5 border-t border-gray-800"
        >
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
            <p>© {currentYear} SellerHub. All rights reserved.</p>
            <p>Made for sellers, by sellers.</p>
          </div>
        </motion.div>
      </div>
    </footer>
  );
};

export default SellerFooter;
