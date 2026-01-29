import React from "react";
import { Home, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* Error Number */}
        <div className="text-9xl font-bold text-black mb-4">404</div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-gray-900 mb-3">
          Page Not Found
        </h1>

        {/* Description */}
        <p className="text-gray-600 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            to="/"
            className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-black text-white font-medium rounded-lg hover:bg-gray-800 transition-colors"
          >
            <Home className="w-4 h-4" />
            Home Page
          </Link>

          <button
            onClick={() => window.history.back()}
            className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>
        </div>

        {/* Current URL */}
        <div className="mt-8 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-500">
            Current URL:{" "}
            <span className="font-mono text-gray-700">
              {window.location.pathname}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
