import { Shield, Lock, Eye, FileText, Mail, Phone, MapPin } from "lucide-react";

function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-[#f8f9fc] text-[#11182d]">
      <div className="max-w-4xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="mb-10 text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-[#0f49d7] p-3 rounded-2xl text-white">
              <Shield className="w-8 h-8" />
            </div>
          </div>
          <h1 className="text-[1.55rem] font-semibold tracking-tight sm:text-[1.8rem] text-[#11182d] mb-2">
            Privacy Policy
          </h1>
          <p className="text-[0.82rem] text-[#42506d] leading-relaxed max-w-lg mx-auto">
            Your privacy is extremely important to us. This document outlines how we collect, use, and protect your personal data.
          </p>
          <p className="text-[#5d6a84] text-[0.74rem] mt-3 font-medium uppercase tracking-[0.1em]">
            Last updated: March 15, 2026
          </p>
        </div>

        {/* Quick Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <div className="bg-white rounded-2xl p-4 border border-[#eef2ff] shadow-sm text-center">
            <Shield className="w-6 h-6 text-[#0f49d7] mx-auto mb-3" />
            <p className="text-[0.76rem] font-bold text-[#141b2d] uppercase tracking-tight">Secure Data</p>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-[#eef2ff] shadow-sm text-center">
            <Lock className="w-6 h-6 text-[#0f49d7] mx-auto mb-3" />
            <p className="text-[0.76rem] font-bold text-[#141b2d] uppercase tracking-tight">Encrypted</p>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-[#eef2ff] shadow-sm text-center">
            <Eye className="w-6 h-6 text-[#0f49d7] mx-auto mb-3" />
            <p className="text-[0.76rem] font-bold text-[#141b2d] uppercase tracking-tight">Transparent</p>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-[#eef2ff] shadow-sm text-center">
            <FileText className="w-6 h-6 text-[#0f49d7] mx-auto mb-3" />
            <p className="text-[0.76rem] font-bold text-[#141b2d] uppercase tracking-tight">Compliant</p>
          </div>
        </div>

        {/* Policy Content */}
        <div className="space-y-6">
          <section className="bg-white border border-[#eef2ff] rounded-[24px] p-8 shadow-sm">
            <h2 className="text-[1.2rem] font-semibold text-[#11182d] mb-4">
              Introduction
            </h2>
            <p className="text-[0.82rem] text-[#42506d] leading-relaxed">
              Welcome to WonderCart. We respect your privacy and are committed to
              protecting your personal data. This privacy policy will inform you
              about how we look after your personal data when you visit our
              website and tell you about your privacy rights.
            </p>
          </section>

          <section className="bg-white border border-[#eef2ff] rounded-[24px] p-8 shadow-sm">
            <h2 className="text-[1.2rem] font-semibold text-[#11182d] mb-4">
              Information We Collect
            </h2>
            <p className="text-[0.82rem] text-[#42506d] leading-relaxed mb-6">
              We collect several types of information from and about users to provide a seamless and personalized shopping experience:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-[#f8f9fc] rounded-[18px] p-5">
                <h3 className="font-bold text-[#11182d] text-[0.88rem] mb-3">
                  Personal Information
                </h3>
                <ul className="list-disc list-inside text-[#42506d] space-y-2 text-[0.76rem]">
                  <li>Name and contact information</li>
                  <li>Email address and phone number</li>
                  <li>Billing and shipping addresses</li>
                  <li>Payment information (processed securely)</li>
                </ul>
              </div>

              <div className="bg-[#f8f9fc] rounded-[18px] p-5">
                <h3 className="font-bold text-[#11182d] text-[0.88rem] mb-3">
                  Usage Information
                </h3>
                <ul className="list-disc list-inside text-[#42506d] space-y-2 text-[0.76rem]">
                  <li>Browsing history and search queries</li>
                  <li>Purchase history and preferences</li>
                  <li>Device and browser information</li>
                  <li>IP address and location data</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="bg-white border border-[#eef2ff] rounded-[24px] p-8 shadow-sm">
            <h2 className="text-[1.2rem] font-semibold text-[#11182d] mb-4">
              How We Use Your Information
            </h2>
            <ul className="list-disc list-inside text-[#42506d] space-y-3 text-[0.82rem] ml-2">
              <li>Processing and fulfilling your orders</li>
              <li>Providing customer service and support</li>
              <li>Improving our website and services</li>
              <li>Sending marketing communications (with your consent)</li>
              <li>Preventing fraud and ensuring security</li>
            </ul>
          </section>

          <section className="bg-white border border-[#eef2ff] rounded-[24px] p-8 shadow-sm">
            <h2 className="text-[1.2rem] font-semibold text-[#11182d] mb-4">
              Data Security
            </h2>
            <p className="text-[0.82rem] text-[#42506d] leading-relaxed mb-4">
              We implement appropriate technical and organizational measures to
              protect your personal data against unauthorized access,
              alteration, disclosure, or destruction.
            </p>
            <div className="bg-[#eef2ff] rounded-[16px] p-4 flex items-start gap-4">
               <div className="bg-white p-2 rounded-lg text-[#0f49d7] shadow-sm">
                 <Lock className="w-4 h-4" />
               </div>
               <div>
                  <p className="text-[0.74rem] font-bold text-[#11182d] mb-1">Security Measures</p>
                  <p className="text-[0.74rem] text-[#5d6a84]">We use SSL encryption, secure servers, and regular security audits to protect your data integrity.</p>
               </div>
            </div>
          </section>

          <section className="bg-white border border-[#eef2ff] rounded-[24px] p-8 shadow-sm">
            <h2 className="text-[1.2rem] font-semibold text-[#11182d] mb-4">
              Your Rights
            </h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="bg-[#f8f9fc] rounded-xl p-4 text-center">
                <p className="text-[0.76rem] font-bold text-[#11182d] mb-1">Access</p>
                <p className="text-[0.68rem] text-[#5d6a84]">Request personal data</p>
              </div>
              <div className="bg-[#f8f9fc] rounded-xl p-4 text-center">
                <p className="text-[0.76rem] font-bold text-[#11182d] mb-1">Correction</p>
                <p className="text-[0.68rem] text-[#5d6a84]">Update inaccurate data</p>
              </div>
              <div className="bg-[#f8f9fc] rounded-xl p-4 text-center">
                <p className="text-[0.76rem] font-bold text-[#11182d] mb-1">Deletion</p>
                <p className="text-[0.68rem] text-[#5d6a84]">Remove account data</p>
              </div>
              <div className="bg-[#f8f9fc] rounded-xl p-4 text-center">
                <p className="text-[0.76rem] font-bold text-[#11182d] mb-1">Opt-out</p>
                <p className="text-[0.68rem] text-[#5d6a84]">Unsubscribe anytime</p>
              </div>
            </div>
          </section>

          <section className="bg-white border border-[#eef2ff] rounded-[24px] p-8 shadow-sm">
            <h2 className="text-[1.2rem] font-semibold text-[#11182d] mb-4">Contact Us</h2>
            <div className="bg-[#f8f9fc] rounded-[18px] p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex items-center gap-3">
                  <div className="bg-white p-2.5 rounded-full text-[#0f49d7] shadow-sm">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[0.68rem] text-[#5d6a84] font-bold uppercase tracking-tight">Email</p>
                    <p className="text-[#141b2d] text-[0.76rem] font-medium">wondercarthelp@gmail.com</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="bg-white p-2.5 rounded-full text-[#0f49d7] shadow-sm">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[0.68rem] text-[#5d6a84] font-bold uppercase tracking-tight">Call Us</p>
                    <p className="text-[#141b2d] text-[0.76rem] font-medium">+91 7226987466</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="bg-white p-2.5 rounded-full text-[#0f49d7] shadow-sm">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[0.68rem] text-[#5d6a84] font-bold uppercase tracking-tight">Visit Us</p>
                    <p className="text-[#141b2d] text-[0.76rem] font-medium">Surat, Gujarat, India</p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* CTA */}
        <div className="mt-10 bg-[#1e293b] text-white rounded-[24px] p-10 text-center shadow-xl">
          <div className="bg-[#0f49d7] w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-[1.2rem] font-bold mb-3">Your Privacy Matters</h3>
          <p className="text-white/70 text-[0.82rem] mb-8 max-w-xs mx-auto leading-relaxed">
            We are fully committed to protecting your personal information and maintaining your trust.
          </p>
          <a
            href="/contact"
            className="inline-block bg-[#0f49d7] text-white px-8 py-3 rounded-xl font-bold text-[0.88rem] transition-colors"
          >
            Contact Privacy Team
          </a>
        </div>
      </div>
    </div>
  );
}

export default PrivacyPolicy;
