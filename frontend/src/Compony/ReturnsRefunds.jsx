import { RotateCcw, CheckCircle, XCircle, AlertCircle } from "lucide-react";

function ReturnsRefunds() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Returns & Refunds
          </h1>
          <p className="text-lg text-gray-600">
            We want you to be completely satisfied with your purchase
          </p>
        </div>

        {/* Quick Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 text-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <RotateCcw className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">30-Day Returns</h3>
            <p className="text-sm text-gray-600">
              Easy returns within 30 days of purchase
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">Free Returns</h3>
            <p className="text-sm text-gray-600">
              No restocking fees or hidden charges
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">Quick Refunds</h3>
            <p className="text-sm text-gray-600">
              Refunds processed within 5-7 business days
            </p>
          </div>
        </div>

        {/* Policy Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Return Policy
            </h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              We offer a 30-day return policy on most items. To be eligible for
              a return, your item must be unused and in the same condition that
              you received it. It must also be in the original packaging.
            </p>
            <p className="text-gray-600 leading-relaxed">
              To start a return, please contact us at returns@wondercart.com or
              visit your account dashboard and select the order you wish to
              return.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              How to Return an Item
            </h2>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold">
                  1
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">
                    Initiate Your Return
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Log into your account and go to Order History. Select the
                    item you want to return and click "Return Item".
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold">
                  2
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">
                    Package Your Item
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Pack the item securely in its original packaging. Include
                    all accessories, manuals, and documentation.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold">
                  3
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">
                    Ship Your Return
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Use the prepaid return label we provide via email. Drop off
                    at any authorized shipping location.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold">
                  4
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">
                    Get Your Refund
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Once we receive and inspect your return, we'll process your
                    refund within 5-7 business days.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Refund Policy
            </h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              Once your return is received and inspected, we will send you an
              email notification of the approval or rejection of your refund.
            </p>
            <p className="text-gray-600 leading-relaxed mb-4">
              If approved, your refund will be processed and a credit will
              automatically be applied to your original method of payment within
              5-7 business days.
            </p>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> Depending on your bank or credit card
                company, it may take an additional 2-3 business days for the
                refund to appear in your account.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Items Eligible for Return
            </h2>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <p className="text-gray-700">
                  Unused items in original packaging
                </p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <p className="text-gray-700">
                  Items with all original tags attached
                </p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <p className="text-gray-700">
                  Items returned within 30 days of delivery
                </p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <p className="text-gray-700">
                  Defective or damaged items (within 7 days)
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Non-Returnable Items
            </h2>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-gray-700">
                  Gift cards and downloadable software
                </p>
              </div>
              <div className="flex items-start gap-3">
                <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-gray-700">
                  Personal care items and hygiene products
                </p>
              </div>
              <div className="flex items-start gap-3">
                <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-gray-700">Clearance and final sale items</p>
              </div>
              <div className="flex items-start gap-3">
                <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-gray-700">Custom or personalized items</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Exchanges</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              We only replace items if they are defective or damaged. If you
              need to exchange an item for the same product, please initiate a
              return and place a new order for the replacement.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Late or Missing Refunds
            </h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              If you haven't received a refund yet, first check your bank
              account again. Then contact your credit card company, as it may
              take some time before your refund is officially posted.
            </p>
            <p className="text-gray-600 leading-relaxed">
              If you've done all of this and still have not received your
              refund, please contact us at support@wondercart.com
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Contact Us
            </h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              If you have any questions about returns or refunds, please contact
              us:
            </p>
            <div className="bg-gray-50 rounded-lg p-6">
              <p className="text-gray-700">
                <strong>Email:</strong> returns@wondercart.com
              </p>
              <p className="text-gray-700">
                <strong>Phone:</strong> +1 (555) 123-4567
              </p>
              <p className="text-gray-700">
                <strong>Hours:</strong> Mon-Fri, 9:00 AM - 6:00 PM EST
              </p>
            </div>
          </section>
        </div>

        {/* CTA */}
        <div className="mt-12 bg-black text-white rounded-lg p-8 text-center">
          <RotateCcw className="w-12 h-12 mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">Need to Return Something?</h3>
          <p className="text-gray-300 mb-4">
            Access your order history to start a return
          </p>
          <a
            href="/profile"
            className="inline-block bg-white text-black px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            View Orders
          </a>
        </div>
      </div>
    </div>
  );
}

export default ReturnsRefunds;
