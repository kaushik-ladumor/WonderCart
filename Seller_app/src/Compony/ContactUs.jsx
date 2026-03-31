import React, { useState } from "react";
import { sendEmail } from "../utils/emailService";
import toast from "react-hot-toast";
import { Mail, Phone, MapPin, Clock, Send, ChevronRight } from "lucide-react";
import { API_URL } from "../utils/constants";

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
      const response = await fetch(`${API_URL}/user/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, subject, message }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success("Message sent! We'll reply soon.");

        // Send Contact Support Email via EmailJS
        sendEmail({
          to_email: "wondercarthelp@gmail.com",
          type: "contactSupport",
          data: { name, email, subject, message }
        }).catch(err => console.error("EmailJS Error (Admin):", err));

        sendEmail({
          to_email: email,
          type: "contactSupport",
          data: { name, email, subject, message }
        }).catch(err => console.error("EmailJS Error (User):", err));

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
      title: "Email Support",
      content: "wondercarthelp@gmail.com",
      href: "mailto:wondercarthelp@gmail.com",
    },
    {
      icon: Phone,
      title: "Phone Support",
      content: "+91-7226987466",
      sub: "Mon-Sat: 9 AM - 6 PM IST",
    },
    {
      icon: MapPin,
      title: "Our Location",
      content: "WonderCart Headquarters,",
      sub: "Surat, Gujarat, India",
    },
  ];

  return (
    <div className="min-h-screen bg-white pb-8">
      <div className="max-w-7xl mx-auto px-4 py-4 lg:py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="font-display text-4xl font-bold text-[#141b2d] tracking-tight mb-2">
            Contact Us
          </h1>
          <p className="font-body text-[13px] text-[#5c6880] max-w-xl leading-relaxed">
            We're here to help you every step of the way. Reach out to us for any queries about your orders or our services.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Info */}
          <div className="lg:col-span-4 space-y-4">
            {contactInfo.map((item, i) => (
              <div
                key={i}
                className="bg-white border border-[#f0f4ff] border-l-[3px] border-l-[#004ac6] rounded-xl p-5 shadow-sm hover:shadow-tonal-sm transition-all"
              >
                <div className="flex gap-3">
                  <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <item.icon className="w-3.5 h-3.5 text-[#004ac6]" />
                  </div>
                  <div>
                    <h3 className="font-display text-[9px] font-bold uppercase tracking-widest text-[#004ac6] mb-0.5">
                      {item.title}
                    </h3>
                    {item.href ? (
                      <a href={item.href} className="font-display text-[12px] font-bold text-[#141b2d] hover:text-[#004ac6] transition-colors">
                        {item.content}
                      </a>
                    ) : (
                      <p className="font-display text-[12px] font-bold text-[#141b2d]">{item.content}</p>
                    )}
                    {item.sub && <p className="font-body text-[10px] text-[#5c6880] mt-0.5">{item.sub}</p>}
                  </div>
                </div>
              </div>
            ))}

            {/* Business Hours Card */}
            <div className="bg-[#f0f4ff] rounded-xl p-5 border border-blue-100">
               <div className="flex items-center gap-2 mb-4">
                  <Clock className="w-3.5 h-3.5 text-[#141b2d]" />
                  <span className="font-display text-[9px] font-bold uppercase tracking-widest text-[#141b2d]">Business Hours</span>
               </div>
               <div className="space-y-2 font-body text-[10px]">
                  <div className="flex justify-between items-center">
                     <span className="text-[#5c6880] font-medium">Mon-Fri</span>
                     <span className="text-[#141b2d] font-bold">9 AM - 6 PM</span>
                  </div>
                  <div className="flex justify-between items-center">
                     <span className="text-[#5c6880] font-medium">Saturday</span>
                     <span className="text-[#141b2d] font-bold">10 AM - 4 PM</span>
                  </div>
                  <div className="flex justify-between items-center">
                     <span className="text-[#5c6880] font-medium">Sunday</span>
                     <span className="text-red-500 font-bold">Closed</span>
                  </div>
               </div>
            </div>
          </div>

          {/* Right Column: Form */}
          <div className="lg:col-span-8">
            <div className="bg-white border border-[#f0f4ff] rounded-[1.5rem] p-6 md:p-8 shadow-sm relative overflow-hidden">
              <h2 className="font-display text-lg md:text-xl font-bold text-[#141b2d] mb-6">
                Send a Message
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="space-y-1.5">
                  <label className="font-display text-[9px] font-bold uppercase tracking-widest text-[#5c6880]">Your Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => { setName(e.target.value); clearError("name"); }}
                    disabled={isSubmitting}
                    placeholder="John Doe"
                    className="w-full h-11 bg-[#f0f4ff]/50 border-none rounded-lg px-4 text-xs font-semibold text-[#141b2d] outline-none placeholder:text-gray-300 focus:bg-white focus:ring-1 focus:ring-blue-100 transition-all"
                  />
                  {errors.name && <p className="text-red-500 text-[9px] font-bold uppercase ml-1">{errors.name}</p>}
                </div>

                <div className="space-y-1.5">
                  <label className="font-display text-[9px] font-bold uppercase tracking-widest text-[#5c6880]">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); clearError("email"); }}
                    disabled={isSubmitting}
                    placeholder="john@example.com"
                    className="w-full h-11 bg-[#f0f4ff]/50 border-none rounded-lg px-4 text-xs font-semibold text-[#141b2d] outline-none placeholder:text-gray-300 focus:bg-white focus:ring-1 focus:ring-blue-100 transition-all"
                  />
                  {errors.email && <p className="text-red-500 text-[9px] font-bold uppercase ml-1">{errors.email}</p>}
                </div>
              </div>

              <div className="space-y-1.5 mb-4">
                <label className="font-display text-[9px] font-bold uppercase tracking-widest text-[#5c6880]">Subject</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => { setSubject(e.target.value); clearError("subject"); }}
                  disabled={isSubmitting}
                  placeholder="How can we help?"
                  className="w-full h-11 bg-[#f0f4ff]/50 border-none rounded-lg px-4 text-xs font-semibold text-[#141b2d] outline-none placeholder:text-gray-300 focus:bg-white focus:ring-1 focus:ring-blue-100 transition-all"
                />
                {errors.subject && <p className="text-red-500 text-[9px] font-bold uppercase ml-1">{errors.subject}</p>}
              </div>

              <div className="space-y-1.5 mb-6">
                <label className="font-display text-[9px] font-bold uppercase tracking-widest text-[#5c6880]">Message</label>
                <textarea
                  value={message}
                  onChange={(e) => { setMessage(e.target.value); clearError("message"); }}
                  disabled={isSubmitting}
                  rows="4"
                  placeholder="Write your message here..."
                  className="w-full bg-[#f0f4ff]/50 border-none rounded-lg p-4 text-xs font-semibold text-[#141b2d] outline-none placeholder:text-gray-300 focus:bg-white focus:ring-1 focus:ring-blue-100 transition-all resize-none"
                />
                <div className="flex justify-between items-center px-1">
                  {errors.message && <p className="text-red-500 text-[9px] font-bold uppercase">{errors.message}</p>}
                  <p className="text-[9px] font-bold text-[#5c6880] ml-auto uppercase tracking-widest">{message.length}/1000</p>
                </div>
              </div>

              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="h-11 bg-[#004ac6] text-white px-8 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-[#141b2d] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-blue-500/10 active:scale-95"
              >
                {isSubmitting ? (
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>Send Message <Send className="w-3 h-3" /></>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-12 pt-8 border-t border-[#f0f4ff]">
           <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-6">
              <div>
                 <span className="font-display text-[9px] font-bold uppercase tracking-[0.3em] text-[#004ac6] mb-1.5 block">Support</span>
                 <h2 className="font-display text-2xl font-bold text-[#141b2d] tracking-tight">Frequently Asked Questions</h2>
              </div>
              <p className="font-body text-[9px] font-bold uppercase tracking-widest text-[#5c6880] max-w-xs md:text-right">Quick answers to common questions about our platform.</p>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { q: "How long does shipping take?", a: "Domestic orders usually arrive within 3-5 business days. International shipping can take 7-14 days." },
                { q: "What's your return policy?", a: "We offer a 30-day no-questions-asked return policy for all unused items in their original packaging." },
                { q: "How do I track my order?", a: "You'll receive a tracking link via email and SMS as soon as your order is dispatched from our warehouse." },
                { q: "Are my payments secure?", a: "Yes, we use industry-standard SSL encryption and partner with trusted payment gateways for all transactions." }
              ].map((faq, i) => (
                <div key={i} className="bg-[#f0f4ff] rounded-2xl p-6 border border-blue-50 flex flex-col h-full hover:bg-white transition-all hover:shadow-sm">
                   <h4 className="font-display text-xs font-bold text-[#141b2d] mb-3 leading-snug">{faq.q}</h4>
                   <p className="font-body text-[11px] text-[#5c6880] leading-relaxed">{faq.a}</p>
                </div>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;
