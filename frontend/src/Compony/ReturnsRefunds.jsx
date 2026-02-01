import {
  RotateCcw,
  CheckCircle,
  XCircle,
  AlertCircle,
  ChevronRight,
} from "lucide-react";

function ReturnsRefunds() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 py-5">
        {/* Header */}
        <div className="mb-6 text-center">
          <div className="flex justify-center mb-3">
            <RotateCcw className="w-8 h-8 text-black" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-1">
            Returns & Refunds
          </h1>
          <p className="text-gray-600 text-sm">
            We want you to be completely satisfied with your purchase
          </p>
        </div>

        {/* Quick Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
          <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <RotateCcw className="w-5 h-5 text-green-600" />
            </div>
            <h3 className="font-bold text-gray-900 text-sm mb-1">
              30-Day Returns
            </h3>
            <p className="text-gray-600 text-xs">Easy returns within 30 days</p>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <CheckCircle className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="font-bold text-gray-900 text-sm mb-1">
              Free Returns
            </h3>
            <p className="text-gray-600 text-xs">No restocking fees</p>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <AlertCircle className="w-5 h-5 text-purple-600" />
            </div>
            <h3 className="font-bold text-gray-900 text-sm mb-1">
              Quick Refunds
            </h3>
            <p className="text-gray-600 text-xs">Processed in 5-7 days</p>
          </div>
        </div>

        {/* Policy Content */}
        <div className="bg-white border border-gray-200 rounded-lg p-5 space-y-5">
          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">
              Return Policy
            </h2>
            <p className="text-gray-600 text-sm leading-relaxed">
              We offer a 30-day return policy on most items. To be eligible,
              items must be unused, in original condition, and in original
              packaging.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">
              How to Return an Item
            </h2>
            <div className="space-y-3">
              <div className="flex gap-3">
                <div className="w-6 h-6 bg-black text-white rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold">
                  1
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm mb-1">
                    Initiate Return
                  </h3>
                  <p className="text-gray-600 text-xs">
                    Go to Order History and select "Return Item"
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-6 h-6 bg-black text-white rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold">
                  2
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm mb-1">
                    Package Item
                  </h3>
                  <p className="text-gray-600 text-xs">
                    Pack securely in original packaging with all accessories
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-6 h-6 bg-black text-white rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold">
                  3
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm mb-1">
                    Ship Return
                  </h3>
                  <p className="text-gray-600 text-xs">
                    Use prepaid return label and drop off at shipping location
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-6 h-6 bg-black text-white rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold">
                  4
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm mb-1">
                    Get Refund
                  </h3>
                  <p className="text-gray-600 text-xs">
                    Refund processed within 5-7 business days after inspection
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">
              Refund Policy
            </h2>
            <p className="text-gray-600 text-sm leading-relaxed mb-3">
              Once your return is received and inspected, we'll notify you of
              refund approval. If approved, refund is processed to original
              payment method within 5-7 business days.
            </p>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-xs text-yellow-800">
                <strong>Note:</strong> Bank/credit card processing may take
                additional 2-3 days.
              </p>
            </div>
          </section>

          <section>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-3">
                  Eligible for Return
                </h2>
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                    <p className="text-gray-700 text-xs">
                      Unused in original packaging
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                    <p className="text-gray-700 text-xs">
                      All original tags attached
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                    <p className="text-gray-700 text-xs">
                      Within 30 days of delivery
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-3">
                  Not Eligible
                </h2>
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <XCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-gray-700 text-xs">Gift cards</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <XCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-gray-700 text-xs">Personal care items</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <XCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-gray-700 text-xs">Clearance items</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">Exchanges</h2>
            <p className="text-gray-600 text-sm leading-relaxed">
              We only replace defective/damaged items. For size/color changes,
              please return and place new order.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">Contact Us</h2>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <svg
                    className="w-3.5 h-3.5 text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  <p className="text-gray-700 text-sm">
                    wondercarthelp@gmail.com
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <svg
                    className="w-3.5 h-3.5 text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                  <p className="text-gray-700 text-sm">+91 7226987466</p>
                </div>
                <div className="flex items-center gap-2">
                  <svg
                    className="w-3.5 h-3.5 text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <p className="text-gray-700 text-sm">
                    Mon-Fri, 9 AM - 6 PM IST
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* CTA */}
        <div className="mt-6 bg-gradient-to-r from-black to-gray-900 text-white rounded-lg p-5 text-center">
          <RotateCcw className="w-8 h-8 mx-auto mb-3" />
          <h3 className="text-base font-bold mb-2">
            Need to Return Something?
          </h3>
          <p className="text-gray-300 text-sm mb-3">
            Access your order history to start a return
          </p>
          <a
            href="/profile"
            className="inline-block bg-white text-black px-4 py-2 rounded-md font-medium hover:bg-gray-100 transition-colors text-sm"
          >
            View Orders
          </a>
        </div>
      </div>
    </div>
  );
}

export default ReturnsRefunds;
