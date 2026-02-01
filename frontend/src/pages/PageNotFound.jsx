import React from "react";
import { Home } from "lucide-react";
import { Link } from "react-router-dom";

const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="max-w-xs w-full text-center">
        {/* Simple error display */}
        <div className="text-7xl font-bold text-gray-800 mb-4">404</div>

        <h2 className="text-lg font-medium text-gray-900 mb-3">
          Page not found
        </h2>

        <p className="text-gray-600 text-sm mb-6">
          This page doesn't exist or has been moved.
        </p>

        <Link
          to="/"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition text-sm"
        >
          <Home className="w-4 h-4" />
          Back to Home
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
