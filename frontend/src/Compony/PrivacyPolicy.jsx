import { Shield, Lock, Eye, FileText, Mail, Phone, MapPin } from "lucide-react";

function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 py-5">
        {/* Header */}
        <div className="mb-6 text-center">
          <div className="flex justify-center mb-3">
            <Shield className="w-8 h-8 text-black" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-1">
            Privacy Policy
          </h1>
          <p className="text-gray-600 text-sm">
            Your privacy is important to us
          </p>
          <p className="text-gray-500 text-xs mt-1">
            Last updated: December 15, 2024
          </p>
        </div>

        {/* Quick Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="bg-gray-50 rounded-lg p-3 border border-gray-200 text-center">
            <Shield className="w-5 h-5 text-black mx-auto mb-1.5" />
            <p className="text-xs font-medium text-gray-900">Secure Data</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 border border-gray-200 text-center">
            <Lock className="w-5 h-5 text-black mx-auto mb-1.5" />
            <p className="text-xs font-medium text-gray-900">Encrypted</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 border border-gray-200 text-center">
            <Eye className="w-5 h-5 text-black mx-auto mb-1.5" />
            <p className="text-xs font-medium text-gray-900">Transparent</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 border border-gray-200 text-center">
            <FileText className="w-5 h-5 text-black mx-auto mb-1.5" />
            <p className="text-xs font-medium text-gray-900">Compliant</p>
          </div>
        </div>

        {/* Policy Content */}
        <div className="bg-white border border-gray-200 rounded-lg p-5 space-y-6">
          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">
              Introduction
            </h2>
            <p className="text-gray-600 text-sm leading-relaxed">
              Welcome to WondeCart. We respect your privacy and are committed to
              protecting your personal data. This privacy policy will inform you
              about how we look after your personal data when you visit our
              website and tell you about your privacy rights.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">
              Information We Collect
            </h2>
            <p className="text-gray-600 text-sm leading-relaxed mb-3">
              We collect several types of information from and about users:
            </p>

            <div className="space-y-3">
              <div className="bg-gray-50 rounded-lg p-3">
                <h3 className="font-semibold text-gray-900 text-sm mb-1.5">
                  Personal Information
                </h3>
                <ul className="list-disc list-inside text-gray-600 space-y-1 text-xs">
                  <li>Name and contact information</li>
                  <li>Email address and phone number</li>
                  <li>Billing and shipping addresses</li>
                  <li>Payment information (processed securely)</li>
                </ul>
              </div>

              <div className="bg-gray-50 rounded-lg p-3">
                <h3 className="font-semibold text-gray-900 text-sm mb-1.5">
                  Usage Information
                </h3>
                <ul className="list-disc list-inside text-gray-600 space-y-1 text-xs">
                  <li>Browsing history and search queries</li>
                  <li>Purchase history and preferences</li>
                  <li>Device and browser information</li>
                  <li>IP address and location data</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">
              How We Use Your Information
            </h2>
            <ul className="list-disc list-inside text-gray-600 space-y-1.5 text-sm ml-4">
              <li>Processing and fulfilling your orders</li>
              <li>Providing customer service and support</li>
              <li>Improving our website and services</li>
              <li>Sending marketing communications (with your consent)</li>
              <li>Preventing fraud and ensuring security</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">
              Data Security
            </h2>
            <p className="text-gray-600 text-sm leading-relaxed mb-3">
              We implement appropriate technical and organizational measures to
              protect your personal data against unauthorized access,
              alteration, disclosure, or destruction.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-xs text-blue-900">
                <strong>Security Measures:</strong> We use SSL encryption,
                secure servers, and regular security audits to protect your
                data.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">
              Cookies and Tracking
            </h2>
            <p className="text-gray-600 text-sm leading-relaxed mb-2">
              We use cookies and similar tracking technologies to enhance your
              experience:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-1 text-sm ml-4">
              <li>Remember your preferences and settings</li>
              <li>Understand how you use our website</li>
              <li>Improve website performance</li>
              <li>Provide personalized content</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">
              Your Rights
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="border border-gray-200 rounded-lg p-3">
                <h3 className="font-semibold text-gray-900 text-sm mb-1">
                  Access
                </h3>
                <p className="text-xs text-gray-600">
                  Request access to your personal data
                </p>
              </div>
              <div className="border border-gray-200 rounded-lg p-3">
                <h3 className="font-semibold text-gray-900 text-sm mb-1">
                  Correction
                </h3>
                <p className="text-xs text-gray-600">
                  Request correction of inaccurate data
                </p>
              </div>
              <div className="border border-gray-200 rounded-lg p-3">
                <h3 className="font-semibold text-gray-900 text-sm mb-1">
                  Deletion
                </h3>
                <p className="text-xs text-gray-600">
                  Request deletion of your data
                </p>
              </div>
              <div className="border border-gray-200 rounded-lg p-3">
                <h3 className="font-semibold text-gray-900 text-sm mb-1">
                  Opt-out
                </h3>
                <p className="text-xs text-gray-600">
                  Unsubscribe from marketing emails
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">
              Children's Privacy
            </h2>
            <p className="text-gray-600 text-sm leading-relaxed">
              Our website is not intended for children under 13 years of age. We
              do not knowingly collect personal information from children under
              13.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">Contact Us</h2>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-gray-500" />
                  <p className="text-gray-700 text-sm">
                    wondercarthelp@gmail.com
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-gray-500" />
                  <p className="text-gray-700 text-sm">+91 7226987466</p>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-gray-500" />
                  <p className="text-gray-700 text-sm">Surat, Gujarat, India</p>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* CTA */}
        <div className="mt-6 bg-gradient-to-r from-black to-gray-900 text-white rounded-lg p-5 text-center">
          <Shield className="w-8 h-8 mx-auto mb-3" />
          <h3 className="text-base font-bold mb-2">Your Privacy Matters</h3>
          <p className="text-gray-300 text-sm mb-3">
            We're committed to protecting your personal information
          </p>
          <a
            href="/contact"
            className="inline-block bg-white text-black px-4 py-2 rounded-md font-medium hover:bg-gray-100 transition-colors text-sm"
          >
            Contact Us
          </a>
        </div>
      </div>
    </div>
  );
}

export default PrivacyPolicy;
