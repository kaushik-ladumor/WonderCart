import React from "react";
import { Link } from "react-router-dom";
import { FileText, Shield, User, Scale, AlertCircle, HelpCircle, ShieldCheck, ArrowRight } from "lucide-react";

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-[#f8f9fc] text-[#11182d]">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
           <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 bg-[#0f49d7] rounded-xl flex items-center justify-center text-white shadow-sm">
                 <ShieldCheck className="w-5 h-5" />
              </div>
              <span className="text-[0.65rem] font-semibold uppercase tracking-widest text-[#0f49d7]">Legal Framework</span>
           </div>
           <h1 className="text-[1.8rem] md:text-[2.2rem] font-semibold text-[#11182d] leading-tight tracking-tight mb-2">
             Terms of Service
           </h1>
           <p className="text-[0.82rem] text-[#42506d] leading-relaxed max-w-lg font-medium">
             Please review our operational mandates and legal obligations carefully before engagement.
           </p>
           <p className="text-[#0f49d7] text-[0.62rem] mt-3 font-semibold uppercase tracking-widest bg-[#0f49d7]/5 inline-block px-3 py-1 rounded-full border border-[#0f49d7]/10">
             Last Refined: February 15, 2026
           </p>
        </div>

        {/* Content Section */}
        <div className="space-y-6">
          {/* 1. Introduction */}
          <section className="bg-white border border-[#eef2ff] rounded-[24px] p-6 shadow-sm">
             <h2 className="text-[0.95rem] font-semibold text-[#11182d] uppercase tracking-widest mb-4 flex items-center gap-2">
                <div className="w-1 h-4 bg-[#0f49d7] rounded-full"></div> 01. Engagement
             </h2>
            <p className="text-[0.78rem] text-[#42506d] leading-relaxed font-medium">
              Welcome to WonderCart. By accessing or using our platform, you
              agree to be bound by these Terms of Service. Please read them
              carefully before using our services. If you do not agree with any
              part of these terms, you may not access or use our services.
            </p>
          </section>

          {/* 2. Definitions */}
          <section className="bg-white border border-[#eef2ff] rounded-[24px] p-6 shadow-sm">
            <h2 className="text-[0.95rem] font-semibold text-[#11182d] uppercase tracking-widest mb-6 flex items-center gap-2">
                <div className="w-1 h-4 bg-[#0f49d7] rounded-full"></div> 02. Definitions
             </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { t: "Platform", d: "The WonderCart digital infrastructure and applications." },
                { t: "User", d: "Any individual engaging with our marketplace protocols." },
                { t: "Seller", d: "Agents listing validated products for acquisition." },
                { t: "Buyer", d: "Agents executing transactions on the marketplace." },
              ].map((item, i) => (
                <div key={i} className="bg-[#f8f9fc] border border-[#eef2ff] p-4 rounded-xl">
                  <span className="font-semibold text-[#0f49d7] block text-[0.65rem] mb-1 uppercase tracking-widest">{item.t}</span>
                  <span className="text-[0.74rem] font-semibold text-[#11182d] opacity-70 uppercase tracking-tight leading-snug">{item.d}</span>
                </div>
              ))}
            </div>
          </section>

          {/* 3. Account Registration */}
          <section className="bg-white border border-[#eef2ff] rounded-[24px] p-6 shadow-sm">
            <h2 className="text-[0.95rem] font-semibold text-[#11182d] uppercase tracking-widest mb-4 flex items-center gap-2">
                <div className="w-1 h-4 bg-[#0f49d7] rounded-full"></div> 03. Registration
             </h2>
            <p className="text-[0.78rem] text-[#42506d] leading-relaxed mb-4 font-medium">
              To leverage premium features, secure registration is mandatory. Users must:
            </p>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2.5 ml-1">
              {[
                "Provide validated current information",
                "Maintain credential confidentiality",
                "Execute immediate breach alerts",
                "Assume full liability for account activity"
              ].map((li, i) => (
                <li key={i} className="text-[0.7rem] font-semibold text-[#5d6a84] uppercase tracking-wide flex items-center gap-2.5">
                  <ArrowRight className="w-3 h-3 text-[#0f49d7]" /> {li}
                </li>
              ))}
            </ul>
          </section>

          {/* 4. User Conduct */}
          <section className="bg-white border border-[#eef2ff] rounded-[24px] p-6 shadow-sm">
            <h2 className="text-[0.95rem] font-semibold text-[#11182d] uppercase tracking-widest mb-4 flex items-center gap-2">
                <div className="w-1 h-4 bg-[#0f49d7] rounded-full"></div> 04. Conduct Ethics
             </h2>
            <p className="text-[0.78rem] text-[#42506d] leading-relaxed mb-4 font-medium">
              The following operations are strictly prohibited on the platform:
            </p>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {[ "Regulatory Violation", "IP Infringement", "Fraudulent Listing", "Malicious Scripts" ].map((t, i) => (
                   <div key={i} className="bg-[#f8f9fc] border border-[#eef2ff] p-3 rounded-xl flex flex-col items-center text-center gap-2">
                      <AlertCircle className="w-4 h-4 text-[#e11d48]" />
                      <span className="text-[0.62rem] font-semibold text-[#11182d] uppercase tracking-widest leading-tight">{t}</span>
                   </div>
                ))}
            </div>
          </section>

          <section className="bg-white border border-[#eef2ff] rounded-[24px] p-6 shadow-sm">
             <h2 className="text-[0.95rem] font-semibold text-[#11182d] uppercase tracking-widest mb-4 flex items-center gap-2">
                <div className="w-1 h-4 bg-[#0f49d7] rounded-full"></div> 05. Intellectual Assets
             </h2>
            <p className="text-[0.78rem] text-[#42506d] leading-relaxed font-medium">
              WonderCart maintains exclusive rights to platform infrastructure and aesthetics. Users granting data access retain origin rights but authorize platform operations license in perpetuity.
            </p>
          </section>

          <section className="bg-white border border-[#eef2ff] rounded-[24px] p-6 shadow-sm">
             <h2 className="text-[0.9rem] font-semibold text-[#11182d] uppercase tracking-widest mb-4">
              Legal Liaison
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 bg-[#f8f9fc] border border-[#eef2ff] p-5 rounded-2xl">
               <div>
                  <p className="text-[0.55rem] font-semibold text-[#0f49d7] uppercase tracking-widest mb-1 opacity-60">Correspondence</p>
                  <p className="text-[0.7rem] font-semibold text-[#11182d] uppercase tracking-widest">wondercarthelp@gmail.com</p>
               </div>
               <div>
                  <p className="text-[0.55rem] font-semibold text-[#0f49d7] uppercase tracking-widest mb-1 opacity-60">Hotline</p>
                  <p className="text-[0.7rem] font-semibold text-[#11182d] uppercase tracking-widest">+91 7226987466</p>
               </div>
               <div>
                  <p className="text-[0.55rem] font-semibold text-[#0f49d7] uppercase tracking-widest mb-1 opacity-60">Jurisdiction</p>
                  <p className="text-[0.7rem] font-semibold text-[#11182d] uppercase tracking-widest">Surat, Gujarat, India</p>
               </div>
            </div>
          </section>
        </div>

        {/* Footer Links */}
        <div className="mt-8 border-t border-[#eef2ff] pt-8 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
           <p className="text-[0.62rem] font-semibold text-[#5d6a84] uppercase tracking-widest max-w-[280px] leading-relaxed">
             Engagement constitutes acknowledgment of these mandates.
           </p>
           <div className="flex gap-6">
              {[ "Home", "Privacy", "Contact" ].map((link, i) => (
                <Link 
                  key={i} 
                  to={link === "Home" ? "/" : `/${link.toLowerCase()}`} 
                  className="text-[0.65rem] font-semibold text-[#11182d] uppercase tracking-widest border-b-2 border-transparent hover:border-[#0f49d7] transition-all"
                >
                  {link}
                </Link>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
