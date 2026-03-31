import React, { useState } from "react";
import { sendEmail } from "../utils/emailService";
import toast from "react-hot-toast";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  ShieldCheck,
  MessageSquare,
  Headphones,
  Zap,
  Globe,
  Star,
} from "lucide-react";
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
      title: "Email Assistance",
      content: "wondercarthelp@gmail.com",
      href: "mailto:wondercarthelp@gmail.com",
      color: "bg-blue-50 text-[#0f49d7]"
    },
    {
      icon: Phone,
      title: "Direct Support",
      content: "+91-7226987466",
      sub: "Mon-Sat: 9 AM - 6 PM IST",
      color: "bg-green-50 text-[#10b981]"
    },
    {
      icon: MapPin,
      title: "Global Headquarters",
      content: "WonderCart Corporate Office,",
      sub: "Surat, Gujarat, India",
      color: "bg-orange-50 text-[#f97316]"
    },
  ];

  return (
    <div className="min-h-screen bg-[#f8f9fc] text-[#11182d]">
      <div className="max-w-7xl mx-auto px-4 py-6">
        
        {/* Header Section */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2.5">
             <div className="w-8 h-8 bg-[#0f49d7] rounded-xl flex items-center justify-center text-white shadow-sm">
                <Headphones className="w-4 h-4" />
             </div>
             <span className="text-[0.62rem] font-bold uppercase tracking-widest text-[#0f49d7]">Customer Support</span>
          </div>
          <h1 className="text-[1.6rem] md:text-[2rem] font-bold text-[#11182d] leading-tight mb-2 tracking-tight">
            How can we help you?
          </h1>
          <p className="text-[0.8rem] text-[#42506d] max-w-lg leading-relaxed">
            Reach out to our dedicated support team for any queries regarding orders, products, or platform features.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column: Info Cards */}
          <div className="lg:col-span-4 space-y-4">
            <div className="grid grid-cols-1 gap-4">
              {contactInfo.map((item, i) => (
                <div
                  key={i}
                  className="bg-white border border-[#eef2ff] rounded-[20px] p-4 shadow-sm"
                >
                  <div className="flex gap-3.5">
                    <div className={`w-10 h-10 ${item.color} rounded-[12px] flex items-center justify-center flex-shrink-0 border border-[#eef2ff]`}>
                      <item.icon className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <h3 className="text-[0.62rem] font-bold uppercase tracking-widest text-[#5d6a84] mb-0.5">
                        {item.title}
                      </h3>
                      {item.href ? (
                        <a href={item.href} className="text-[0.78rem] font-bold text-[#11182d] hover:text-[#0f49d7]">
                          {item.content}
                        </a>
                      ) : (
                        <p className="text-[0.78rem] font-bold text-[#11182d]">{item.content}</p>
                      )}
                      {item.sub && <p className="text-[0.68rem] text-[#5d6a84] mt-0.5 font-medium">{item.sub}</p>}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Business Hours Card */}
            <div className="bg-[#1e293b] rounded-[20px] p-5 text-white shadow-lg relative overflow-hidden">
               <div className="relative z-10">
                 <div className="flex items-center gap-3 mb-5">
                    <Clock className="w-4 h-4 text-[#0f49d7]" />
                    <span className="text-[0.62rem] font-bold uppercase tracking-widest text-white/70">Operation Hours</span>
                 </div>
                 <div className="space-y-3.5">
                    <div className="flex justify-between items-center border-b border-white/5 pb-2">
                       <span className="text-[0.7rem] font-medium text-white/60 uppercase tracking-widest">Mon-Fri</span>
                       <span className="text-[0.75rem] font-bold">09:00 - 18:00</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-white/5 pb-2">
                       <span className="text-[0.7rem] font-medium text-white/60 uppercase tracking-widest">Saturday</span>
                       <span className="text-[0.75rem] font-bold">10:00 - 16:00</span>
                    </div>
                    <div className="flex justify-between items-center">
                       <span className="text-[0.7rem] font-medium text-white/60 uppercase tracking-widest">Sunday</span>
                       <span className="text-[0.75rem] font-bold text-[#0f49d7]">Closed</span>
                    </div>
                 </div>
               </div>
            </div>
          </div>

          {/* Right Column: Contact Form */}
          <div className="lg:col-span-8">
            <div className="bg-white border border-[#eef2ff] rounded-[28px] p-7 md:p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-5">
                 <MessageSquare className="w-4.5 h-4.5 text-[#0f49d7]" />
                 <h2 className="text-[1.05rem] font-bold text-[#11182d]">Message our team</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="space-y-1.5">
                  <label className="text-[0.62rem] font-bold uppercase tracking-widest text-[#5d6a84] ml-1">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => { setName(e.target.value); clearError("name"); }}
                    disabled={isSubmitting}
                    placeholder="Full Name"
                    className="w-full h-10 bg-[#f8f9fc] border border-[#eef2ff] rounded-[12px] px-4 text-[0.78rem] font-bold text-[#11182d] outline-none placeholder:text-[#b0b8cb] focus:border-[#0f49d7]"
                  />
                  {errors.name && <p className="text-red-500 text-[0.58rem] font-bold uppercase mt-1 ml-1">{errors.name}</p>}
                </div>

                <div className="space-y-1.5">
                  <label className="text-[0.62rem] font-bold uppercase tracking-widest text-[#5d6a84] ml-1">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); clearError("email"); }}
                    disabled={isSubmitting}
                    placeholder="email@address.com"
                    className="w-full h-10 bg-[#f8f9fc] border border-[#eef2ff] rounded-[12px] px-4 text-[0.78rem] font-bold text-[#11182d] outline-none placeholder:text-[#b0b8cb] focus:border-[#0f49d7]"
                  />
                  {errors.email && <p className="text-red-500 text-[0.58rem] font-bold uppercase mt-1 ml-1">{errors.email}</p>}
                </div>
              </div>

              <div className="space-y-1.5 mb-4">
                <label className="text-[0.62rem] font-bold uppercase tracking-widest text-[#5d6a84] ml-1">Subject</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => { setSubject(e.target.value); clearError("subject"); }}
                  disabled={isSubmitting}
                  placeholder="What is this regarding?"
                  className="w-full h-10 bg-[#f8f9fc] border border-[#eef2ff] rounded-[12px] px-4 text-[0.78rem] font-bold text-[#11182d] outline-none placeholder:text-[#b0b8cb] focus:border-[#0f49d7]"
                />
                {errors.subject && <p className="text-red-500 text-[0.58rem] font-bold uppercase mt-1 ml-1">{errors.subject}</p>}
              </div>

              <div className="space-y-1.5 mb-5">
                <label className="text-[0.62rem] font-bold uppercase tracking-widest text-[#5d6a84] ml-1">Your Message</label>
                <textarea
                  value={message}
                  onChange={(e) => { setMessage(e.target.value); clearError("message"); }}
                  disabled={isSubmitting}
                  rows="4"
                  placeholder="Please describe your query in detail..."
                  className="w-full bg-[#f8f9fc] border border-[#eef2ff] rounded-[14px] p-4 text-[0.78rem] font-bold text-[#11182d] outline-none placeholder:text-[#b0b8cb] focus:border-[#0f49d7] resize-none"
                />
                <div className="flex justify-between items-center px-1 mt-1">
                  {errors.message && <p className="text-red-500 text-[0.58rem] font-bold uppercase">{errors.message}</p>}
                  <p className="text-[0.62rem] font-bold text-[#b0b8cb] ml-auto tracking-widest">{message.length}/1000</p>
                </div>
              </div>

              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full lg:w-auto h-10 bg-[#0f49d7] text-white px-8 rounded-[12px] text-[0.68rem] font-bold uppercase tracking-widest hover:bg-[#11182d] disabled:opacity-50 flex items-center justify-center gap-2.5 shadow-sm border-none outline-none"
              >
                {isSubmitting ? (
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>Send Message <Send className="w-3.5 h-3.5" /></>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Support Highlights */}
        <div className="mt-8 pt-6 border-t border-[#eef2ff]">
           <div className="text-center mb-8">
             <h2 className="text-[1.3rem] font-bold text-[#11182d] mb-1.5">Elite Support Network</h2>
             <p className="text-[0.78rem] text-[#42506d] max-w-xl mx-auto leading-relaxed">Dedicated to providing world-class assistance for our global community.</p>
           </div>

           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { 
                  q: "Rapid Response", 
                  a: "Prioritized tickets with 2-4 hour response times.",
                  icon: <Zap className="w-4.5 h-4.5 text-[#0f49d7]" />
                },
                { 
                  q: "Global Presence", 
                  a: "Localized assistance across all timezones.",
                  icon: <Globe className="w-4.5 h-4.5 text-[#0f49d7]" />
                },
                { 
                  q: "Expert Knowledge", 
                  a: "Specialists trained on all platform features.",
                  icon: <Star className="w-4.5 h-4.5 text-[#0f49d7]" />
                },
                { 
                  q: "Secure Channel", 
                  a: "Protected by end-to-end industry encryption.",
                  icon: <ShieldCheck className="w-4.5 h-4.5 text-[#0f49d7]" />
                }
              ].map((faq, i) => (
                <div key={i} className="bg-white rounded-[20px] p-6 border border-[#eef2ff] shadow-sm">
                   <div className="w-9 h-9 bg-[#f8f9fc] border border-[#eef2ff] rounded-xl flex items-center justify-center mb-4">
                      {faq.icon}
                   </div>
                   <h4 className="text-[0.78rem] font-bold text-[#11182d] mb-1.5">{faq.q}</h4>
                   <p className="text-[0.68rem] text-[#5d6a84] leading-relaxed">{faq.a}</p>
                </div>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;
