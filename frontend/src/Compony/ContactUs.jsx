import React, { useState } from "react";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Clock, Send, ChevronRight } from "lucide-react";

const ContactUs = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!name.trim()) newErrors.name = "Name is required";
    else if (name.trim().length < 2) newErrors.name = "Name too short";

    if (!email.trim()) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      newErrors.email = "Invalid email";

    if (!subject.trim()) newErrors.subject = "Subject is required";
    else if (subject.trim().length < 3) newErrors.subject = "Subject too short";

    if (!message.trim()) newErrors.message = "Message is required";
    else if (message.trim().length < 10)
      newErrors.message = "Message too short";
    else if (message.trim().length > 1000)
      newErrors.message = "Message too long";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const clearError = (field) => {
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast.error("Please fix the errors");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("http://localhost:4000/user/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, subject, message }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success("Message sent! We'll reply soon.");
        setName("");
        setEmail("");
        setSubject("");
        setMessage("");
        setErrors({});
      } else {
        toast.error(data.message || "Failed to send");
      }
    } catch (error) {
      toast.error("Network error. Try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactInfo = [
    {
      icon: Mail,
      title: "Email",
      content: "wondercarthelp@gmail.com",
      href: "mailto:wondercarthelp@gmail.com",
    },
    {
      icon: Phone,
      title: "Phone",
      content: "+91-7226987466",
      sub: "Mon–Sat: 9 AM – 6 PM IST",
    },
    {
      icon: MapPin,
      title: "Address",
      content: "WonderCart Headquarters",
      sub: "Surat, Gujarat, India",
    },
    {
      icon: Clock,
      title: "Business Hours",
      content: "Mon–Fri: 9 AM – 6 PM",
      sub: "Sat: 10 AM – 4 PM | Sun: Closed",
    },
  ];

  const faqs = [
    {
      q: "How long does shipping take?",
      a: "Standard: 5–7 business days. Express: 2–3 days.",
    },
    {
      q: "What's your return policy?",
      a: "7-day returns for most items in original condition.",
    },
    {
      q: "Do you ship internationally?",
      a: "Currently India only. International coming soon.",
    },
    {
      q: "How can I track my order?",
      a: "Tracking link sent via email. Also visible in your account.",
    },
  ];

  return (
    <div className="min-h-screen bg-white py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Contact Us</h1>
          <p className="text-gray-600 text-sm">
            We're here to help you every step of the way
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Contact Info Cards */}
          <div className="space-y-4">
            {contactInfo.map((item, i) => (
              <div
                key={i}
                className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-all"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-black rounded">
                    <item.icon className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 text-sm mb-1">
                      {item.title}
                    </h3>
                    {item.href ? (
                      <a
                        href={item.href}
                        className="text-gray-600 hover:text-black transition-colors text-sm"
                      >
                        {item.content}
                      </a>
                    ) : (
                      <p className="text-gray-600 text-sm">{item.content}</p>
                    )}
                    {item.sub && (
                      <p className="text-xs text-gray-500 mt-0.5">{item.sub}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-white border border-gray-200 rounded-lg p-5">
              <h2 className="text-lg font-semibold text-gray-900 mb-5">
                Send us a Message
              </h2>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Name <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        clearError("name");
                      }}
                      disabled={isSubmitting}
                      placeholder="Your full name"
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition text-sm"
                    />
                    {errors.name && (
                      <p className="text-red-600 text-xs mt-1">{errors.name}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        clearError("email");
                      }}
                      disabled={isSubmitting}
                      placeholder="your@email.com"
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition text-sm"
                    />
                    {errors.email && (
                      <p className="text-red-600 text-xs mt-1">
                        {errors.email}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subject <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => {
                      setSubject(e.target.value);
                      clearError("subject");
                    }}
                    disabled={isSubmitting}
                    placeholder="What's this about?"
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition text-sm"
                  />
                  {errors.subject && (
                    <p className="text-red-600 text-xs mt-1">
                      {errors.subject}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Message <span className="text-red-600">*</span>
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => {
                      setMessage(e.target.value);
                      clearError("message");
                    }}
                    disabled={isSubmitting}
                    rows={4}
                    placeholder="Tell us more..."
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition resize-none text-sm"
                  />
                  <div className="flex justify-between items-center mt-1">
                    {errors.message && (
                      <p className="text-red-600 text-xs">{errors.message}</p>
                    )}
                    <p className="text-xs text-gray-500 ml-auto">
                      {message.length}/1000
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="w-full bg-black text-white py-2.5 rounded font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2 text-sm"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      Send Message
                      <Send className="w-4 h-4" />
                    </>
                  )}
                </button>

                <p className="text-center text-xs text-gray-500">
                  We typically respond within 24–48 hours on business days.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <section className="mt-12">
          <h2 className="text-lg font-semibold text-gray-900 text-center mb-6">
            Frequently Asked Questions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-all"
              >
                <h3 className="font-medium text-gray-900 text-sm mb-2 flex items-center gap-2">
                  <ChevronRight className="w-3 h-3 text-gray-400" />
                  {faq.q}
                </h3>
                <p className="text-gray-600 text-sm">{faq.a}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default ContactUs;
