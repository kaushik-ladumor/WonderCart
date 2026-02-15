import React from "react";
import { Link } from "react-router-dom";

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-black text-white py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            Terms of Service
          </h1>
          <p className="text-gray-300 text-sm md:text-base">
            Last updated: February 15, 2026
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="space-y-8">
          {/* Introduction */}
          <section>
            <h2 className="text-xl md:text-2xl font-bold text-black mb-4">
              1. Introduction
            </h2>
            <p className="text-gray-600 leading-relaxed">
              Welcome to WonderCart. By accessing or using our platform, you
              agree to be bound by these Terms of Service. Please read them
              carefully before using our services. If you do not agree with any
              part of these terms, you may not access or use our services.
            </p>
          </section>

          {/* Definitions */}
          <section>
            <h2 className="text-xl md:text-2xl font-bold text-black mb-4">
              2. Definitions
            </h2>
            <ul className="list-disc pl-5 space-y-2 text-gray-600">
              <li>
                <span className="font-semibold text-black">"Platform"</span>{" "}
                refers to WonderCart website and mobile application.
              </li>
              <li>
                <span className="font-semibold text-black">"User"</span> refers
                to any individual who accesses or uses our platform.
              </li>
              <li>
                <span className="font-semibold text-black">"Seller"</span>{" "}
                refers to users who list products for sale on our platform.
              </li>
              <li>
                <span className="font-semibold text-black">"Buyer"</span> refers
                to users who purchase products on our platform.
              </li>
              <li>
                <span className="font-semibold text-black">"Content"</span>{" "}
                refers to any information, text, images, or materials uploaded
                to our platform.
              </li>
            </ul>
          </section>

          {/* Account Registration */}
          <section>
            <h2 className="text-xl md:text-2xl font-bold text-black mb-4">
              3. Account Registration
            </h2>
            <p className="text-gray-600 leading-relaxed mb-3">
              To access certain features of our platform, you must register for
              an account. You agree to:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-gray-600">
              <li>Provide accurate, current, and complete information</li>
              <li>Maintain and update your information as needed</li>
              <li>Keep your password secure and confidential</li>
              <li>Notify us immediately of any unauthorized account use</li>
              <li>Be responsible for all activities under your account</li>
            </ul>
          </section>

          {/* User Conduct */}
          <section>
            <h2 className="text-xl md:text-2xl font-bold text-black mb-4">
              4. User Conduct
            </h2>
            <p className="text-gray-600 leading-relaxed mb-3">
              You agree not to use our platform to:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-gray-600">
              <li>Violate any applicable laws or regulations</li>
              <li>Infringe upon intellectual property rights</li>
              <li>Post false, misleading, or fraudulent content</li>
              <li>Harass, abuse, or harm other users</li>
              <li>Distribute viruses or malicious code</li>
              <li>Attempt to gain unauthorized access to our systems</li>
              <li>
                Engage in any activity that disrupts platform functionality
              </li>
            </ul>
          </section>

          {/* Seller Terms */}
          <section>
            <h2 className="text-xl md:text-2xl font-bold text-black mb-4">
              5. Seller Terms
            </h2>
            <p className="text-gray-600 leading-relaxed mb-3">
              If you list products as a seller, you agree to:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-gray-600">
              <li>Provide accurate product descriptions and prices</li>
              <li>Maintain sufficient inventory for listed products</li>
              <li>Process orders promptly upon receipt</li>
              <li>Ship products in a timely manner</li>
              <li>Respond to buyer inquiries within 24 hours</li>
              <li>Accept returns in accordance with our return policy</li>
              <li>Pay applicable fees and commissions</li>
            </ul>
          </section>

          {/* Buyer Terms */}
          <section>
            <h2 className="text-xl md:text-2xl font-bold text-black mb-4">
              6. Buyer Terms
            </h2>
            <p className="text-gray-600 leading-relaxed mb-3">
              When purchasing products on our platform, you agree to:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-gray-600">
              <li>Provide accurate shipping and payment information</li>
              <li>Ensure you have the legal right to use payment methods</li>
              <li>Not engage in fraudulent purchases</li>
              <li>Inspect products upon delivery and report issues promptly</li>
              <li>Follow our return and refund procedures</li>
              <li>Communicate respectfully with sellers</li>
            </ul>
          </section>

          {/* Payments and Fees */}
          <section>
            <h2 className="text-xl md:text-2xl font-bold text-black mb-4">
              7. Payments and Fees
            </h2>
            <p className="text-gray-600 leading-relaxed mb-3">
              Our payment terms include:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-gray-600">
              <li>All prices are in USD unless otherwise stated</li>
              <li>Sellers agree to pay applicable commission fees</li>
              <li>Payment processing fees may apply</li>
              <li>Refunds will be processed according to our refund policy</li>
              <li>We reserve the right to change fees with notice</li>
            </ul>
          </section>

          {/* Intellectual Property */}
          <section>
            <h2 className="text-xl md:text-2xl font-bold text-black mb-4">
              8. Intellectual Property
            </h2>
            <p className="text-gray-600 leading-relaxed mb-3">
              Our platform and its content are protected by intellectual
              property laws. You agree that:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-gray-600">
              <li>
                WonderCart owns all platform content unless otherwise noted
              </li>
              <li>You retain ownership of content you post</li>
              <li>
                You grant us license to use your content for platform operations
              </li>
              <li>
                You may not copy or reproduce platform content without
                permission
              </li>
            </ul>
          </section>

          {/* Privacy */}
          <section>
            <h2 className="text-xl md:text-2xl font-bold text-black mb-4">
              9. Privacy
            </h2>
            <p className="text-gray-600 leading-relaxed">
              Your use of our platform is also governed by our Privacy Policy.
              Please review our Privacy Policy to understand how we collect,
              use, and protect your personal information.
            </p>
          </section>

          {/* Termination */}
          <section>
            <h2 className="text-xl md:text-2xl font-bold text-black mb-4">
              10. Termination
            </h2>
            <p className="text-gray-600 leading-relaxed">
              We reserve the right to suspend or terminate your account at our
              discretion, without notice, for conduct that we believe violates
              these terms or is harmful to other users, us, or third parties, or
              for any other reason.
            </p>
          </section>

          {/* Limitation of Liability */}
          <section>
            <h2 className="text-xl md:text-2xl font-bold text-black mb-4">
              11. Limitation of Liability
            </h2>
            <p className="text-gray-600 leading-relaxed">
              To the maximum extent permitted by law, WonderCart shall not be
              liable for any indirect, incidental, special, consequential, or
              punitive damages, or any loss of profits or revenues, whether
              incurred directly or indirectly, or any loss of data, use,
              goodwill, or other intangible losses.
            </p>
          </section>

          {/* Changes to Terms */}
          <section>
            <h2 className="text-xl md:text-2xl font-bold text-black mb-4">
              12. Changes to Terms
            </h2>
            <p className="text-gray-600 leading-relaxed">
              We may modify these terms at any time. We will provide notice of
              significant changes by posting the updated terms on our platform
              and updating the "Last updated" date. Your continued use after
              such changes constitutes acceptance.
            </p>
          </section>

          {/* Contact Information */}
          <section>
            <h2 className="text-xl md:text-2xl font-bold text-black mb-4">
              13. Contact Us
            </h2>
            <p className="text-gray-600 leading-relaxed mb-3">
              If you have questions about these Terms of Service, please contact
              us:
            </p>
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <p className="text-gray-700 mb-2">
                <span className="font-semibold">Email:</span>{" "}
                wondercarthelp@gmail.com
              </p>
              <p className="text-gray-700 mb-2">
                <span className="font-semibold">Address:</span> WonderCart Headquarters Surat, Gujarat, India
              </p>
              <p className="text-gray-700">
                <span className="font-semibold">Phone:</span> +91 7226987466
              </p>
            </div>
          </section>
        </div>

        {/* Footer Note */}
        <div className="mt-12 pt-8 border-t border-gray-200 text-center">
          <p className="text-sm text-gray-500">
            By using WonderCart, you acknowledge that you have read and
            understood these Terms of Service.
          </p>
          <div className="flex justify-center gap-4 mt-4">
            <Link to="/" className="text-sm text-black hover:underline">
              Home
            </Link>
            <Link to="/privacy" className="text-sm text-black hover:underline">
              Privacy Policy
            </Link>
            <Link to="/contact" className="text-sm text-black hover:underline">
              Contact
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
