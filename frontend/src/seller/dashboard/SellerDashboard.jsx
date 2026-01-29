import React from "react";

const SellerDashboard = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6">
      {/* Header - Clean & Minimal */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-gray-500 mb-1">
              Good Morning, Seller
            </div>
            <h1 className="text-2xl font-light text-gray-800">
              Store Command Center
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-sm text-gray-600">Store Status</div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium">Active</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Live Stats - Minimal Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {/* Active Orders */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 p-6">
          <div className="text-3xl font-light mb-2 text-gray-800">12</div>
          <div className="text-sm text-gray-600">Active Orders</div>
          <div className="h-1 w-full bg-gray-200 mt-3 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 w-3/4"></div>
          </div>
        </div>

        {/* Today's Revenue */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 p-6">
          <div className="text-3xl font-light mb-2 text-gray-800">₹8,425</div>
          <div className="text-sm text-gray-600">Today's Revenue</div>
          <div className="h-1 w-full bg-gray-200 mt-3 rounded-full overflow-hidden">
            <div className="h-full bg-green-500 w-2/3"></div>
          </div>
        </div>

        {/* Response Time */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 p-6">
          <div className="text-3xl font-light mb-2 text-gray-800">32m</div>
          <div className="text-sm text-gray-600">Avg Response Time</div>
          <div className="h-1 w-full bg-gray-200 mt-3 rounded-full overflow-hidden">
            <div className="h-full bg-purple-500 w-1/2"></div>
          </div>
        </div>
      </div>

      {/* Action Grid - Center Piece */}
      <div className="mb-8">
        <h2 className="text-sm font-medium text-gray-600 mb-4">
          QUICK ACTIONS
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <button className="bg-white/90 hover:bg-white border border-gray-200 rounded-xl p-5 flex flex-col items-center justify-center transition-all hover:scale-[1.02] hover:shadow-sm">
            <div className="text-2xl mb-2">📦</div>
            <div className="text-sm font-medium">Process Orders</div>
          </button>

          <button className="bg-white/90 hover:bg-white border border-gray-200 rounded-xl p-5 flex flex-col items-center justify-center transition-all hover:scale-[1.02] hover:shadow-sm">
            <div className="text-2xl mb-2">📝</div>
            <div className="text-sm font-medium">Add Product</div>
          </button>

          <button className="bg-white/90 hover:bg-white border border-gray-200 rounded-xl p-5 flex flex-col items-center justify-center transition-all hover:scale-[1.02] hover:shadow-sm">
            <div className="text-2xl mb-2">📊</div>
            <div className="text-sm font-medium">View Analytics</div>
          </button>

          <button className="bg-white/90 hover:bg-white border border-gray-200 rounded-xl p-5 flex flex-col items-center justify-center transition-all hover:scale-[1.02] hover:shadow-sm">
            <div className="text-2xl mb-2">💬</div>
            <div className="text-sm font-medium">Messages</div>
          </button>
        </div>
      </div>

      {/* Recent Activity Timeline - Minimal */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 p-6">
        <h2 className="text-sm font-medium text-gray-600 mb-4">
          RECENT ACTIVITY
        </h2>
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 mt-2 bg-blue-500 rounded-full"></div>
            <div className="flex-1">
              <div className="text-sm">Order #7894 marked as shipped</div>
              <div className="text-xs text-gray-500 mt-1">10:30 AM</div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-2 h-2 mt-2 bg-green-500 rounded-full"></div>
            <div className="flex-1">
              <div className="text-sm">Payment received for Order #7893</div>
              <div className="text-xs text-gray-500 mt-1">09:15 AM</div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-2 h-2 mt-2 bg-yellow-500 rounded-full"></div>
            <div className="flex-1">
              <div className="text-sm">New customer inquiry received</div>
              <div className="text-xs text-gray-500 mt-1">08:45 AM</div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Status Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-sm border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between text-sm">
            <div className="text-gray-600">Store online for 8h 24m</div>
            <div className="flex items-center gap-4">
              <span className="text-gray-600">Orders pending: 5</span>
              <span className="text-gray-600">Messages unread: 3</span>
              <button className="text-blue-600 hover:text-blue-700">
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerDashboard;
