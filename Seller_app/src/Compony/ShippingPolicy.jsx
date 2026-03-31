import { Truck, Clock, MapPin, Package, CheckCircle } from "lucide-react";

function ShippingPolicy() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 py-5">
        {/* Header */}
        <div className="mb-6 text-center">
          <div className="flex justify-center mb-3">
            <Truck className="w-8 h-8 text-black" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-1">
            Shipping Policy
          </h1>
          <p className="text-gray-600 text-sm">
            Everything you need to know about shipping
          </p>
        </div>

        {/* Shipping Options */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
          <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
            <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center mx-auto mb-3">
              <Truck className="w-5 h-5 text-white" />
            </div>
            <h3 className="font-bold text-gray-900 text-sm mb-1">
              Standard Shipping
            </h3>
            <p className="text-gray-600 text-xs mb-1">5-7 Business Days</p>
            <p className="text-sm font-bold text-gray-900">FREE over ₹999</p>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
            <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center mx-auto mb-3">
              <Clock className="w-5 h-5 text-white" />
            </div>
            <h3 className="font-bold text-gray-900 text-sm mb-1">
              Express Shipping
            </h3>
            <p className="text-gray-600 text-xs mb-1">2-3 Business Days</p>
            <p className="text-sm font-bold text-gray-900">₹99</p>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
            <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center mx-auto mb-3">
              <MapPin className="w-5 h-5 text-white" />
            </div>
            <h3 className="font-bold text-gray-900 text-sm mb-1">
              India Shipping
            </h3>
            <p className="text-gray-600 text-xs mb-1">All across India</p>
            <p className="text-sm font-bold text-gray-900">₹50 - ₹150</p>
          </div>
        </div>

        {/* Policy Content */}
        <div className="bg-white border border-gray-200 rounded-lg p-5 space-y-5">
          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">
              Processing Time
            </h2>
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                <p className="text-gray-700 text-sm">
                  Orders processed within 1-2 business days
                </p>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                <p className="text-gray-700 text-sm">
                  No shipping on weekends or holidays
                </p>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                <p className="text-gray-700 text-sm">
                  Allow extra days during high volume periods
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">
              Shipping Rates
            </h2>
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium text-gray-900 text-sm">
                    Standard Shipping
                  </p>
                  <p className="text-gray-600 text-xs">5-7 business days</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900 text-sm">FREE</p>
                  <p className="text-gray-600 text-xs">on orders over ₹999</p>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium text-gray-900 text-sm">
                    Express Shipping
                  </p>
                  <p className="text-gray-600 text-xs">2-3 business days</p>
                </div>
                <p className="font-bold text-gray-900 text-sm">₹99</p>
              </div>

              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium text-gray-900 text-sm">
                    Regular Shipping
                  </p>
                  <p className="text-gray-600 text-xs">5-7 business days</p>
                </div>
                <p className="font-bold text-gray-900 text-sm">₹50</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">
              Order Tracking
            </h2>
            <div className="space-y-2">
              <p className="text-gray-700 text-sm">
                You'll receive a shipment confirmation email with tracking
                number once your order ships.
              </p>
              <p className="text-gray-700 text-sm">
                Track your order in your account dashboard or using the tracking
                link in your email.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">
              Delivery Information
            </h2>
            <div className="space-y-3">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-blue-900 text-xs">
                  <strong>Delivery Attempts:</strong> 3 attempts will be made.
                  Please ensure someone is available to receive the package.
                </p>
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-yellow-900 text-xs">
                  <strong>Delivery Times:</strong> Typically between 9 AM - 8
                  PM. No specific time slots available.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">
              Damaged Items
            </h2>
            <p className="text-gray-700 text-sm mb-2">
              If your order arrives damaged:
            </p>
            <div className="space-y-1 ml-4">
              <p className="text-gray-600 text-xs">
                • Take photos of damaged items and packaging
              </p>
              <p className="text-gray-600 text-xs">
                • Save all packaging materials
              </p>
              <p className="text-gray-600 text-xs">
                • Contact support within 48 hours of delivery
              </p>
              <p className="text-gray-600 text-xs">
                • File claim with shipment carrier
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">
              Shipping Locations
            </h2>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 rounded-lg p-3">
                <h3 className="font-medium text-gray-900 text-sm mb-1">
                  Metro Cities
                </h3>
                <p className="text-gray-600 text-xs">2-3 days delivery</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <h3 className="font-medium text-gray-900 text-sm mb-1">
                  Tier 2 Cities
                </h3>
                <p className="text-gray-600 text-xs">4-5 days delivery</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <h3 className="font-medium text-gray-900 text-sm mb-1">
                  Tier 3 Cities
                </h3>
                <p className="text-gray-600 text-xs">5-7 days delivery</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <h3 className="font-medium text-gray-900 text-sm mb-1">
                  Remote Areas
                </h3>
                <p className="text-gray-600 text-xs">7-10 days delivery</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">
              Contact Support
            </h2>
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
          <Package className="w-8 h-8 mx-auto mb-3" />
          <h3 className="text-base font-bold mb-2">Ready to Shop?</h3>
          <p className="text-gray-300 text-sm mb-3">
            Free shipping on orders over ₹999
          </p>
          <a
            href="/"
            className="inline-block bg-white text-black px-4 py-2 rounded-md font-medium hover:bg-gray-100 transition-colors text-sm"
          >
            Start Shopping
          </a>
        </div>
      </div>
    </div>
  );
}

export default ShippingPolicy;
