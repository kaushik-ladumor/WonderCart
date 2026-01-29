import React from "react";

function Logout() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold">Logged Out</h2>
        <p className="text-sm text-gray-600">
          You have been logged out successfully.
        </p>
      </div>
    </div>
  );
}

export default Logout;
