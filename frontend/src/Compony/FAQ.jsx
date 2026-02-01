import { useState } from "react";
import { ChevronDown, Search, HelpCircle } from "lucide-react";

function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const faqs = [
    {
      category: "Orders & Shipping",
      questions: [
        {
          q: "How long does shipping take?",
          a: "Standard shipping: 5-7 business days. Express shipping: 2-3 business days.",
        },
        {
          q: "Can I track my order?",
          a: "Yes, tracking number sent via email. Also visible in your account.",
        },
        {
          q: "Do you ship internationally?",
          a: "Currently India only. International shipping coming soon.",
        },
      ],
    },
    {
      category: "Returns & Refunds",
      questions: [
        {
          q: "What is your return policy?",
          a: "30-day return policy. Items must be unused with original packaging.",
        },
        {
          q: "How do I initiate a return?",
          a: "Go to order history in your account and click 'Return Item'.",
        },
        {
          q: "When will I receive my refund?",
          a: "Refunds processed within 5-7 business days after we receive your return.",
        },
      ],
    },
    {
      category: "Payment & Security",
      questions: [
        {
          q: "What payment methods do you accept?",
          a: "All major cards, UPI, Razorpay, and Cash on Delivery.",
        },
        {
          q: "Is my payment information secure?",
          a: "Yes, we use industry-standard SSL encryption to protect your data.",
        },
        {
          q: "Can I change my payment method?",
          a: "Payment methods cannot be changed after order is placed.",
        },
      ],
    },
    {
      category: "Account & Profile",
      questions: [
        {
          q: "How do I create an account?",
          a: "Click 'Sign Up' or create an account during checkout.",
        },
        {
          q: "I forgot my password. What should I do?",
          a: "Click 'Forgot Password' on login page to reset via email.",
        },
        {
          q: "How do I update my account information?",
          a: "Go to 'Profile Settings' in your account to update information.",
        },
      ],
    },
  ];

  const allQuestions = faqs.flatMap((cat) =>
    cat.questions.map((q) => ({ ...q, category: cat.category })),
  );

  const filteredQuestions = searchTerm
    ? allQuestions.filter(
        (item) =>
          item.q.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.a.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    : null;

  const toggleAccordion = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 py-5">
        {/* Header */}
        <div className="mb-6 text-center">
          <div className="flex justify-center mb-3">
            <HelpCircle className="w-8 h-8 text-black" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">
            Frequently Asked Questions
          </h1>
          <p className="text-gray-600 text-sm">
            Find answers to common questions
          </p>
        </div>

        {/* Search */}
        <div className="mb-5">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search for answers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-sm text-gray-900 placeholder-gray-500 bg-white"
            />
          </div>
        </div>

        {/* FAQs */}
        {searchTerm && filteredQuestions ? (
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden mb-5">
            {filteredQuestions.length > 0 ? (
              filteredQuestions.map((item, index) => (
                <div
                  key={index}
                  className="border-b border-gray-200 last:border-0"
                >
                  <button
                    onClick={() => toggleAccordion(index)}
                    className="w-full px-4 py-3 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <span className="text-xs font-medium text-gray-500 block mb-0.5">
                        {item.category}
                      </span>
                      <span className="font-medium text-gray-900 text-sm">
                        {item.q}
                      </span>
                    </div>
                    <ChevronDown
                      className={`w-4 h-4 text-gray-500 transition-transform flex-shrink-0 ml-3 ${
                        openIndex === index ? "transform rotate-180" : ""
                      }`}
                    />
                  </button>
                  {openIndex === index && (
                    <div className="px-4 pb-3 text-gray-600 text-xs leading-relaxed">
                      {item.a}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="px-4 py-8 text-center text-gray-500 text-sm">
                No results found for "{searchTerm}"
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4 mb-5">
            {faqs.map((category, catIndex) => (
              <div
                key={catIndex}
                className="bg-white border border-gray-200 rounded-lg overflow-hidden"
              >
                <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                  <h2 className="text-base font-bold text-gray-900">
                    {category.category}
                  </h2>
                </div>
                {category.questions.map((item, qIndex) => {
                  const globalIndex = `${catIndex}-${qIndex}`;
                  return (
                    <div
                      key={qIndex}
                      className="border-b border-gray-200 last:border-0"
                    >
                      <button
                        onClick={() => toggleAccordion(globalIndex)}
                        className="w-full px-4 py-3 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                      >
                        <span className="font-medium text-gray-900 text-sm flex-1 text-left">
                          {item.q}
                        </span>
                        <ChevronDown
                          className={`w-4 h-4 text-gray-500 transition-transform flex-shrink-0 ml-3 ${
                            openIndex === globalIndex
                              ? "transform rotate-180"
                              : ""
                          }`}
                        />
                      </button>
                      {openIndex === globalIndex && (
                        <div className="px-4 pb-3 text-gray-600 text-xs leading-relaxed">
                          {item.a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        )}

        {/* Contact CTA */}
        <div className="bg-gradient-to-r from-black to-gray-900 text-white rounded-lg p-5 text-center">
          <h3 className="text-base font-bold mb-2">Still have questions?</h3>
          <p className="text-gray-300 text-sm mb-3">
            Can't find what you're looking for? Contact our support team.
          </p>
          <a
            href="/contact"
            className="inline-block bg-white text-black px-4 py-2 rounded-md font-medium hover:bg-gray-100 transition-colors text-sm"
          >
            Contact Support
          </a>
        </div>
      </div>
    </div>
  );
}

export default FAQ;
