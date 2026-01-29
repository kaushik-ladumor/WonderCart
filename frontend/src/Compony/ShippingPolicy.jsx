import { Truck, Clock, MapPin, Package } from "lucide-react";

function ShippingPolicy() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Shipping Policy
          </h1>
          <p className="text-lg text-gray-600">
            Everything you need to know about our shipping process
          </p>
        </div>

        {/* Shipping Options */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 text-center">
            <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center mx-auto mb-4">
              <Truck className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">Standard Shipping</h3>
            <p className="text-sm text-gray-600 mb-2">5-7 Business Days</p>
            <p className="text-lg font-bold text-gray-900">FREE over $50</p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 text-center">
            <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center mx-auto mb-4">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">Express Shipping</h3>
            <p className="text-sm text-gray-600 mb-2">2-3 Business Days</p>
            <p className="text-lg font-bold text-gray-900">$15.99</p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 text-center">
            <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center mx-auto mb-4">
              <MapPin className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">International</h3>
            <p className="text-sm text-gray-600 mb-2">10-15 Business Days</p>
            <p className="text-lg font-bold text-gray-900">$29.99+</p>
          </div>
        </div>

        {/* Policy Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Processing Time
            </h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              All orders are processed within 1-2 business days. Orders are not
              shipped or delivered on weekends or holidays.
            </p>
            <p className="text-gray-600 leading-relaxed">
              If we are experiencing a high volume of orders, shipments may be
              delayed by a few days. Please allow additional days in transit for
              delivery.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Shipping Rates & Delivery Estimates
            </h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              Shipping charges for your order will be calculated and displayed
              at checkout.
            </p>

            <div className="bg-gray-50 rounded-lg p-6 space-y-4">
              <div className="flex justify-between items-center border-b border-gray-200 pb-3">
                <div>
                  <p className="font-semibold text-gray-900">
                    Standard Shipping
                  </p>
                  <p className="text-sm text-gray-600">5-7 business days</p>
                </div>
                <p className="font-bold text-gray-900">FREE over $50</p>
              </div>

              <div className="flex justify-between items-center border-b border-gray-200 pb-3">
                <div>
                  <p className="font-semibold text-gray-900">
                    Express Shipping
                  </p>
                  <p className="text-sm text-gray-600">2-3 business days</p>
                </div>
                <p className="font-bold text-gray-900">$15.99</p>
              </div>

              <div className="flex justify-between items-center">
                <div>
                  <p className="font-semibold text-gray-900">
                    International Shipping
                  </p>
                  <p className="text-sm text-gray-600">10-15 business days</p>
                </div>
                <p className="font-bold text-gray-900">Varies by location</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Shipment Confirmation & Order Tracking
            </h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              You will receive a Shipment Confirmation email once your order has
              shipped containing your tracking number(s). The tracking number
              will be active within 24 hours.
            </p>
            <p className="text-gray-600 leading-relaxed">
              You can track your order status in your account dashboard or by
              using the tracking link provided in your shipment confirmation
              email.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Customs, Duties, and Taxes
            </h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              WondeCart is not responsible for any customs and taxes applied to
              your order. All fees imposed during or after shipping are the
              responsibility of the customer (tariffs, taxes, etc.).
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Damages</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              WondeCart is not liable for any products damaged or lost during
              shipping. If you received your order damaged, please contact the
              shipment carrier to file a claim.
            </p>
            <p className="text-gray-600 leading-relaxed">
              Please save all packaging materials and damaged goods before
              filing a claim. We will do our best to assist you in resolving the
              issue.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              International Shipping
            </h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              We currently ship to most countries worldwide. International
              shipping times and costs vary by destination.
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>Delivery times may vary depending on customs clearance</li>
              <li>Additional duties and taxes may apply</li>
              <li>Orders over $800 USD may require additional documentation</li>
              <li>Remote areas may incur additional shipping charges</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Contact Us
            </h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              If you have any questions about our shipping policy, please
              contact us:
            </p>
            <div className="bg-gray-50 rounded-lg p-6">
              <p className="text-gray-700">
                <strong>Email:</strong> support@wondercart.com
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
          <Package className="w-12 h-12 mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">Ready to Shop?</h3>
          <p className="text-gray-300 mb-4">
            Browse our collection and enjoy free shipping on orders over $50
          </p>
          <a
            href="/"
            className="inline-block bg-white text-black px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            Start Shopping
          </a>
        </div>
      </div>
    </div>
  );
}

export default ShippingPolicy;
