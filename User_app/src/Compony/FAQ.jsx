import { useState } from "react";
import { ChevronDown, Search, HelpCircle, Mail, Phone, MessageSquare, Headphones } from "lucide-react";

function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const faqs = [
    {
      category: "Orders & Shipping",
      questions: [
        {
          q: "How long does shipping take?",
          a: "Standard shipping typically takes 5-7 business days, while Express shipping arrives in 2-3 business days across major metro cities in India.",
        },
        {
          q: "Can I track my order?",
          a: "Yes, a unique tracking number is sent via email and SMS once your order ships. You can also view it in your dashboard under 'Recent Orders'.",
        },
        {
          q: "Do you ship internationally?",
          a: "Currently, we only ship within India. We are working on expanding our logistics to support international shipping by early 2027.",
        },
      ],
    },
    {
      category: "Returns & Refunds",
      questions: [
        {
          q: "What is your return policy?",
          a: "We offer a 30-day return policy. Items must be unused, in original condition, and include all original packaging and tags.",
        },
        {
          q: "How do I initiate a return?",
          a: "Simply go to your Account > Order History, select the item you wish to return, and click the 'Initiate Return' button.",
        },
        {
          q: "When will I receive my refund?",
          a: "Refunds are processed within 5-7 business days after we receive and inspect your return shipment at our fulfillment center.",
        },
      ],
    },
    {
      category: "Payment & Security",
      questions: [
        {
          q: "What payment methods do you accept?",
          a: "We accept all major credit/debit cards, Net Banking, UPI (Google Pay, PhonePe), and Cash on Delivery in selected regions.",
        },
        {
          q: "Is my payment information secure?",
          a: "Yes, we use TLS 1.3 encryption and partner with industry leaders like Razorpay to ensure your payment data is never stored on our servers.",
        },
        {
          q: "Can I change my payment method?",
          a: "For security reasons, payment methods cannot be changed once an order has been successfully placed.",
        },
      ],
    },
    {
      category: "Account & Profile",
      questions: [
        {
          q: "How do I create an account?",
          a: "Click 'Sign Up' in the navigation bar or simply provide your mobile number during the checkout process to create an account instantly.",
        },
        {
          q: "I forgot my password. What should I do?",
          a: "Use the 'Forgot Password' link on the login page to receive a secure password reset link via your registered email address.",
        },
        {
          q: "How do I update my account information?",
          a: "Navigate to your 'Profile' page while logged in to update your email, phone number, and primary shipping addresses.",
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
    <div className="min-h-screen bg-[#f8f9fc] text-[#11182d]">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
             <div className="w-9 h-9 bg-[#0f49d7] rounded-xl flex items-center justify-center text-white">
                <Headphones className="w-5 h-5" />
             </div>
             <span className="text-[0.65rem] font-bold uppercase tracking-widest text-[#0f49d7]">Help & Assistance</span>
          </div>
          <h1 className="text-[1.8rem] md:text-[2.2rem] font-bold text-[#11182d] leading-tight mb-2 tracking-tight">
            How can we help?
          </h1>
          <p className="text-[0.82rem] text-[#42506d] leading-relaxed max-w-lg">
             Explore our dedicated help center for immediate answers to common platform queries.
          </p>
        </div>

        {/* Search */}
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4.5 h-4.5 text-[#5d6a84]" />
            <input
              type="text"
              placeholder="Search for answers (e.g. shipping, refund)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-6 py-3.5 bg-white border border-[#eef2ff] rounded-[16px] shadow-sm text-[0.82rem] font-bold outline-none placeholder:text-[#b0b8cb] focus:border-[#0f49d7] transition-all"
            />
          </div>
        </div>

        {/* FAQs */}
        <div className="space-y-6">
          {searchTerm && filteredQuestions ? (
            <div className="bg-white border border-[#eef2ff] rounded-[24px] overflow-hidden shadow-sm">
              {filteredQuestions.length > 0 ? (
                filteredQuestions.map((item, index) => (
                  <div key={index} className="border-b border-[#f0f4ff] last:border-0">
                    <button
                      onClick={() => toggleAccordion(index)}
                      className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-[#f8f9fc] border-none outline-none"
                    >
                      <div className="flex-1">
                        <span className="text-[0.55rem] font-bold text-[#0f49d7] uppercase tracking-widest block mb-0.5">
                          {item.category}
                        </span>
                        <span className="font-bold text-[#11182d] text-[0.82rem]">
                          {item.q}
                        </span>
                      </div>
                      <ChevronDown
                        className={`w-4.5 h-4.5 text-[#5d6a84] transition-transform ${openIndex === index ? "rotate-180" : ""}`}
                      />
                    </button>
                    {openIndex === index && (
                      <div className="px-6 pb-4 text-[0.74rem] text-[#42506d] leading-relaxed">
                        {item.a}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="px-6 py-10 text-center text-[#5d6a84] text-[0.82rem]">
                  No results found for "<span className="text-[#11182d] font-bold">{searchTerm}</span>"
                </div>
              )}
            </div>
          ) : (
            faqs.map((category, catIndex) => (
              <div key={catIndex}>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-1 h-5 bg-[#0f49d7] rounded-full"></div>
                  <h2 className="text-[0.95rem] font-bold text-[#11182d] uppercase tracking-widest">
                    {category.category}
                  </h2>
                </div>
                <div className="bg-white border border-[#eef2ff] rounded-[24px] overflow-hidden shadow-sm">
                  {category.questions.map((item, qIndex) => {
                    const globalIndex = `${catIndex}-${qIndex}`;
                    return (
                      <div key={qIndex} className="border-b border-[#f0f4ff] last:border-0">
                        <button
                          onClick={() => toggleAccordion(globalIndex)}
                          className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-[#f8f9fc] border-none outline-none"
                        >
                          <span className="font-bold text-[#11182d] text-[0.82rem]">
                            {item.q}
                          </span>
                          <ChevronDown
                            className={`w-4.5 h-4.5 text-[#5d6a84] transition-transform ${openIndex === globalIndex ? "rotate-180" : ""}`}
                          />
                        </button>
                        {openIndex === globalIndex && (
                          <div className="px-6 pb-4 text-[0.74rem] text-[#42506d] leading-relaxed">
                            {item.a}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Contact CTA */}
        <div className="mt-10 bg-[#1e293b] text-white rounded-[28px] p-8 text-center shadow-lg">
          <div className="flex justify-center -space-x-2 mb-5">
             <div className="w-10 h-10 rounded-full border-4 border-[#1e293b] bg-white flex items-center justify-center">
                <MessageSquare className="w-4 h-4 text-[#0f49d7]" />
             </div>
             <div className="w-10 h-10 rounded-full border-4 border-[#1e293b] bg-[#0f49d7] flex items-center justify-center">
                <Mail className="w-4 h-4 text-white" />
             </div>
          </div>
          <h3 className="text-[1.1rem] font-bold mb-2">Still have questions?</h3>
          <p className="text-white/60 text-[0.74rem] mb-6 max-w-xs mx-auto font-medium uppercase tracking-widest leading-relaxed">
            Our dedicated support team is available mon-sat to assist you.
          </p>
          <div className="flex justify-center">
             <a
               href="/contact"
               className="bg-[#0f49d7] text-white px-8 py-3 rounded-xl font-bold text-[0.65rem] uppercase tracking-widest shadow-md"
             >
               Contact Support
             </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FAQ;
