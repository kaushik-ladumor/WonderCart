import { useState } from "react";
import { ChevronDown, Search } from "lucide-react";

function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const faqs = [
    {
      category: "Orders & Shipping",
      questions: [
        {
          q: "How long does shipping take?",
          a: "Standard shipping typically takes 5-7 business days. Express shipping is available for 2-3 business days delivery.",
        },
        {
          q: "Can I track my order?",
          a: "Yes! Once your order ships, you'll receive a tracking number via email. You can also track your order in your account dashboard.",
        },
        {
          q: "Do you ship internationally?",
          a: "Yes, we ship to most countries worldwide. International shipping times vary by location, typically 10-15 business days.",
        },
      ],
    },
    {
      category: "Returns & Refunds",
      questions: [
        {
          q: "What is your return policy?",
          a: "We offer a 30-day return policy for most items. Products must be unused and in original packaging with tags attached.",
        },
        {
          q: "How do I initiate a return?",
          a: "Log into your account, go to your order history, and click 'Return Item'. Follow the prompts to complete your return request.",
        },
        {
          q: "When will I receive my refund?",
          a: "Refunds are processed within 5-7 business days after we receive your return. The refund will be credited to your original payment method.",
        },
      ],
    },
    {
      category: "Payment & Security",
      questions: [
        {
          q: "What payment methods do you accept?",
          a: "We accept all major credit cards (Visa, MasterCard, American Express), PayPal, and Apple Pay.",
        },
        {
          q: "Is my payment information secure?",
          a: "Yes, we use industry-standard SSL encryption to protect your payment information. We never store your complete credit card details.",
        },
        {
          q: "Can I change my payment method after placing an order?",
          a: "Unfortunately, payment methods cannot be changed after an order is placed. Please contact customer support for assistance.",
        },
      ],
    },
    {
      category: "Account & Profile",
      questions: [
        {
          q: "How do I create an account?",
          a: "Click 'Sign Up' in the top navigation, enter your email and create a password. You can also sign up during checkout.",
        },
        {
          q: "I forgot my password. What should I do?",
          a: "Click 'Forgot Password' on the login page, enter your email, and we'll send you a password reset link.",
        },
        {
          q: "How do I update my account information?",
          a: "Log into your account and go to 'Profile Settings' where you can update your personal information, address, and preferences.",
        },
      ],
    },
  ];

  const allQuestions = faqs.flatMap((cat) =>
    cat.questions.map((q) => ({ ...q, category: cat.category }))
  );

  const filteredQuestions = searchTerm
    ? allQuestions.filter(
        (item) =>
          item.q.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.a.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : null;

  const toggleAccordion = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-lg text-gray-600">
            Find answers to common questions about our products and services
          </p>
        </div>

        {/* Search */}
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search for answers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>
        </div>

        {/* FAQs */}
        {searchTerm && filteredQuestions ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {filteredQuestions.length > 0 ? (
              filteredQuestions.map((item, index) => (
                <div
                  key={index}
                  className="border-b border-gray-200 last:border-0"
                >
                  <button
                    onClick={() => toggleAccordion(index)}
                    className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <div>
                      <span className="text-xs font-medium text-gray-500 uppercase block mb-1">
                        {item.category}
                      </span>
                      <span className="font-semibold text-gray-900">
                        {item.q}
                      </span>
                    </div>
                    <ChevronDown
                      className={`w-5 h-5 text-gray-500 transition-transform flex-shrink-0 ml-4 ${
                        openIndex === index ? "transform rotate-180" : ""
                      }`}
                    />
                  </button>
                  {openIndex === index && (
                    <div className="px-6 pb-4 text-gray-600 text-sm leading-relaxed">
                      {item.a}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="px-6 py-8 text-center text-gray-500">
                No results found for "{searchTerm}"
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {faqs.map((category, catIndex) => (
              <div
                key={catIndex}
                className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
              >
                <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                  <h2 className="text-lg font-bold text-gray-900">
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
                        className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                      >
                        <span className="font-semibold text-gray-900">
                          {item.q}
                        </span>
                        <ChevronDown
                          className={`w-5 h-5 text-gray-500 transition-transform flex-shrink-0 ml-4 ${
                            openIndex === globalIndex
                              ? "transform rotate-180"
                              : ""
                          }`}
                        />
                      </button>
                      {openIndex === globalIndex && (
                        <div className="px-6 pb-4 text-gray-600 text-sm leading-relaxed">
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
        <div className="mt-12 bg-black text-white rounded-lg p-8 text-center">
          <h3 className="text-xl font-bold mb-2">Still have questions?</h3>
          <p className="text-gray-300 mb-4">
            Can't find what you're looking for? Contact our support team.
          </p>
          <a
            href="/contact"
            className="inline-block bg-white text-black px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            Contact Support
          </a>
        </div>
      </div>
    </div>
  );
}

export default FAQ;
