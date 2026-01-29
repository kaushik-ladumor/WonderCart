import { Shield, Lock, Eye, FileText } from "lucide-react";

function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Privacy Policy
          </h1>
          <p className="text-lg text-gray-600">
            Your privacy is important to us
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Last updated: December 15, 2024
          </p>
        </div>

        {/* Quick Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 text-center">
            <Shield className="w-8 h-8 text-black mx-auto mb-2" />
            <p className="text-xs font-semibold text-gray-900">Secure Data</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 text-center">
            <Lock className="w-8 h-8 text-black mx-auto mb-2" />
            <p className="text-xs font-semibold text-gray-900">Encrypted</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 text-center">
            <Eye className="w-8 h-8 text-black mx-auto mb-2" />
            <p className="text-xs font-semibold text-gray-900">Transparent</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 text-center">
            <FileText className="w-8 h-8 text-black mx-auto mb-2" />
            <p className="text-xs font-semibold text-gray-900">Compliant</p>
          </div>
        </div>

        {/* Policy Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Introduction
            </h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              Welcome to WondeCart. We respect your privacy and are committed to
              protecting your personal data. This privacy policy will inform you
              about how we look after your personal data when you visit our
              website and tell you about your privacy rights.
            </p>
            <p className="text-gray-600 leading-relaxed">
              This privacy policy applies to information we collect about you
              when you use our website, mobile application, or interact with us
              through customer service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Information We Collect
            </h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              We collect several types of information from and about users of
              our website:
            </p>

            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">
                  Personal Information
                </h3>
                <ul className="list-disc list-inside text-gray-600 space-y-1 text-sm">
                  <li>Name and contact information</li>
                  <li>Email address and phone number</li>
                  <li>Billing and shipping addresses</li>
                  <li>Payment information (processed securely)</li>
                </ul>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">
                  Usage Information
                </h3>
                <ul className="list-disc list-inside text-gray-600 space-y-1 text-sm">
                  <li>Browsing history and search queries</li>
                  <li>Purchase history and preferences</li>
                  <li>Device and browser information</li>
                  <li>IP address and location data</li>
                </ul>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">
                  Communications
                </h3>
                <ul className="list-disc list-inside text-gray-600 space-y-1 text-sm">
                  <li>Customer service interactions</li>
                  <li>Reviews and feedback</li>
                  <li>Marketing preferences</li>
                  <li>Survey responses</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              How We Use Your Information
            </h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              We use the information we collect for various purposes, including:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
              <li>Processing and fulfilling your orders</li>
              <li>Providing customer service and support</li>
              <li>Improving our website and services</li>
              <li>Sending marketing communications (with your consent)</li>
              <li>Preventing fraud and ensuring security</li>
              <li>Complying with legal obligations</li>
              <li>Analyzing trends and customer behavior</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Data Security
            </h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              We implement appropriate technical and organizational measures to
              protect your personal data against unauthorized access,
              alteration, disclosure, or destruction.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-900">
                <strong>Security Measures:</strong> We use SSL encryption,
                secure servers, and regular security audits to protect your
                data. However, no method of transmission over the Internet is
                100% secure.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Sharing Your Information
            </h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              We may share your information with:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
              <li>
                <strong>Service Providers:</strong> Third parties that help us
                operate our business (payment processors, shipping companies)
              </li>
              <li>
                <strong>Legal Requirements:</strong> When required by law or to
                protect our rights
              </li>
              <li>
                <strong>Business Transfers:</strong> In connection with a
                merger, acquisition, or sale of assets
              </li>
            </ul>
            <p className="text-gray-600 leading-relaxed mt-4">
              We do not sell your personal information to third parties.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Cookies and Tracking
            </h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              We use cookies and similar tracking technologies to enhance your
              experience on our website. Cookies help us:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
              <li>Remember your preferences and settings</li>
              <li>Understand how you use our website</li>
              <li>Improve website performance</li>
              <li>Provide personalized content and ads</li>
            </ul>
            <p className="text-gray-600 leading-relaxed mt-4">
              You can control cookies through your browser settings. However,
              disabling cookies may affect your ability to use certain features
              of our website.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Your Rights
            </h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              You have the following rights regarding your personal data:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Access</h3>
                <p className="text-sm text-gray-600">
                  Request access to your personal data
                </p>
              </div>
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Correction</h3>
                <p className="text-sm text-gray-600">
                  Request correction of inaccurate data
                </p>
              </div>
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Deletion</h3>
                <p className="text-sm text-gray-600">
                  Request deletion of your data
                </p>
              </div>
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Opt-out</h3>
                <p className="text-sm text-gray-600">
                  Unsubscribe from marketing emails
                </p>
              </div>
            </div>
            <p className="text-gray-600 leading-relaxed mt-4">
              To exercise these rights, please contact us at
              privacy@wondercart.com
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Children's Privacy
            </h2>
            <p className="text-gray-600 leading-relaxed">
              Our website is not intended for children under 13 years of age. We
              do not knowingly collect personal information from children under
              13. If you are a parent or guardian and believe your child has
              provided us with personal information, please contact us.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              International Transfers
            </h2>
            <p className="text-gray-600 leading-relaxed">
              Your information may be transferred to and processed in countries
              other than your country of residence. These countries may have
              different data protection laws. We ensure appropriate safeguards
              are in place to protect your information.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Changes to This Policy
            </h2>
            <p className="text-gray-600 leading-relaxed">
              We may update this privacy policy from time to time. We will
              notify you of any changes by posting the new privacy policy on
              this page and updating the "Last updated" date. We encourage you
              to review this policy periodically.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Contact Us
            </h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              If you have any questions about this privacy policy or our data
              practices, please contact us:
            </p>
            <div className="bg-gray-50 rounded-lg p-6">
              <p className="text-gray-700">
                <strong>Email:</strong> privacy@wondercart.com
              </p>
              <p className="text-gray-700">
                <strong>Phone:</strong> +1 (555) 123-4567
              </p>
              <p className="text-gray-700">
                <strong>Address:</strong> 123 Commerce Street, New York, NY
                10001
              </p>
            </div>
          </section>
        </div>

        {/* CTA */}
        <div className="mt-12 bg-black text-white rounded-lg p-8 text-center">
          <Shield className="w-12 h-12 mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">Your Privacy Matters</h3>
          <p className="text-gray-300 mb-4">
            We're committed to protecting your personal information
          </p>
          <a
            href="/contact"
            className="inline-block bg-white text-black px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            Contact Us
          </a>
        </div>
      </div>
    </div>
  );
}

export default PrivacyPolicy;
