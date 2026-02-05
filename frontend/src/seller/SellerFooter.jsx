import React from "react";
import {
  ShoppingBag,
  Shield,
  Truck,
  CreditCard,
  ChevronRight,
} from "lucide-react";

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
    <footer className="bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {/* Brand Column */}
          <div className="space-y-4 col-span-2 sm:col-span-1 lg:col-span-1">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-white rounded-lg">
                <ShoppingBag className="w-5 h-5 text-black" />
              </div>
              <span className="text-lg font-bold">SellerHub</span>
            </div>
            <p className="text-gray-400 text-sm">
              Complete platform for sellers to manage and grow their online
              business.
            </p>
          </div>

          {/* Other Columns */}
          {footerLinks.map((section) => (
            <div key={section.title} className="space-y-4">
              <h3 className="text-sm font-semibold">{section.title}</h3>
              <ul className="space-y-2">
                {section.items.map((item, i) => (
                  <li key={i}>
                    <button className="group flex items-center gap-2 text-gray-400 hover:text-white text-sm transition-colors">
                      {item.icon && (
                        <item.icon className="w-3 h-3 text-gray-500 group-hover:text-white" />
                      )}
                      <span className="flex items-center gap-1">
                        {item.label}
                        <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="mt-6 pt-4 border-t border-gray-800">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-gray-500">
            <p>© {currentYear} SellerHub. All rights reserved.</p>
            <p>Made for sellers, by sellers.</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default SellerFooter;
