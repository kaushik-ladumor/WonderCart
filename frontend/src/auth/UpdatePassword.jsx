import { Lock, Eye, EyeOff, X } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthProvider";

function UpdatePassword() {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { authUser } = useAuth();

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm();

  const newPassword = watch("newPassword");

  // IMPORTANT: Check if user is Google user
  // Based on the database structure, Google users have googleId field
  // We need to get the full user data from localStorage to check properly
  const getStoredUser = () => {
    try {
      const storedUser = localStorage.getItem("Users");
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (error) {
      return null;
    }
  };

  const storedUser = getStoredUser();
  const isGoogleUser = storedUser?.googleId || authUser?.googleId;

  const onSubmit = async (data) => {
    if (!authUser?._id) {
      toast.error("User not authenticated. Please login again.");
      return;
    }

    try {
      setLoading(true);

      const token = localStorage.getItem("token");
      const passwordData = {
        newPassword: data.newPassword,
      };

      // For Google users, we don't send currentPassword
      // For regular users, we send currentPassword
      if (!isGoogleUser && data.currentPassword) {
        passwordData.currentPassword = data.currentPassword;
      }

      console.log("User type:", isGoogleUser ? "Google User" : "Regular User");
      console.log("Sending password data:", passwordData);

      const response = await axios.put(
        "http://localhost:4000/user/update-password",
        passwordData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.data.success) {
        toast.success(response.data.message);
        reset();
        document.getElementById("update_password_modal").close();
      } else {
        toast.error(response.data.message || "Failed to update password");
      }
    } catch (err) {
      console.error("Password update error:", err.response?.data);
      toast.error(
        err.response?.data?.message ||
          "Failed to update password. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    if (!loading) {
      document.getElementById("update_password_modal")?.close();
    }
  };

  return (
    <dialog id="update_password_modal" className="modal">
      <div className="modal-box max-w-md p-5 bg-white rounded-lg shadow-xl border border-gray-200">
        {/* Header - Login modal style */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
          <div className="text-left">
            <h3 className="font-bold text-gray-900 text-lg">
              {isGoogleUser ? "Set Password" : "Update Password"}
            </h3>
            <p className="text-gray-600 text-sm mt-1">
              {isGoogleUser
                ? "Set a password for your account"
                : "Enter your current and new password"}
            </p>
          </div>
          <button
            onClick={closeModal}
            disabled={loading}
            className="p-1 hover:bg-gray-100 rounded disabled:opacity-50"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Current Password - Only for NON-Google users */}
          {!isGoogleUser && (
            <div className="text-left">
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Current Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type={showCurrentPassword ? "text" : "password"}
                  placeholder="Enter current password"
                  className={`w-full pl-10 pr-10 py-2.5 border rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-sm text-gray-900 placeholder-gray-500 bg-white ${
                    errors.currentPassword
                      ? "border-red-500"
                      : "border-gray-300"
                  } ${loading ? "bg-gray-100 cursor-not-allowed" : ""}`}
                  disabled={loading}
                  {...register("currentPassword", {
                    required: !isGoogleUser && "Current password is required",
                  })}
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-black disabled:text-gray-300 disabled:cursor-not-allowed"
                  disabled={loading}
                >
                  {showCurrentPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {errors.currentPassword && (
                <p className="text-red-600 text-xs mt-1 text-left">
                  {errors.currentPassword.message}
                </p>
              )}
            </div>
          )}

          {/* New Password - For ALL users */}
          <div className="text-left">
            <label className="block text-sm font-medium text-gray-900 mb-2">
              New Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type={showNewPassword ? "text" : "password"}
                placeholder="Enter new password"
                className={`w-full pl-10 pr-10 py-2.5 border rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-sm text-gray-900 placeholder-gray-500 bg-white ${
                  errors.newPassword ? "border-red-500" : "border-gray-300"
                } ${loading ? "bg-gray-100 cursor-not-allowed" : ""}`}
                disabled={loading}
                {...register("newPassword", {
                  required: "New password is required",
                  minLength: {
                    value: 8,
                    message: "Password must be at least 8 characters",
                  },
                })}
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-black disabled:text-gray-300 disabled:cursor-not-allowed"
                disabled={loading}
              >
                {showNewPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            {errors.newPassword && (
              <p className="text-red-600 text-xs mt-1 text-left">
                {errors.newPassword.message}
              </p>
            )}
            <p className="text-xs text-gray-500 mt-1 text-left">
              Must be at least 8 characters long
            </p>
          </div>

          {/* Confirm Password - For ALL users */}
          <div className="text-left">
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Confirm New Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm new password"
                className={`w-full pl-10 pr-10 py-2.5 border rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-sm text-gray-900 placeholder-gray-500 bg-white ${
                  errors.confirmPassword ? "border-red-500" : "border-gray-300"
                } ${loading ? "bg-gray-100 cursor-not-allowed" : ""}`}
                disabled={loading}
                {...register("confirmPassword", {
                  required: "Please confirm your password",
                  validate: (value) =>
                    value === newPassword || "Passwords don't match",
                })}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-black disabled:text-gray-300 disabled:cursor-not-allowed"
                disabled={loading}
              >
                {showConfirmPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-red-600 text-xs mt-1 text-left">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          {/* Update Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-2.5 rounded-md font-medium hover:bg-gray-800 transition disabled:bg-gray-400 disabled:cursor-not-allowed text-sm mt-4"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                {isGoogleUser ? "Setting Password..." : "Updating Password..."}
              </div>
            ) : isGoogleUser ? (
              "Set Password"
            ) : (
              "Update Password"
            )}
          </button>
        </form>

        {/* Security Note */}
        <div className="mt-6 pt-5 border-t border-gray-200 text-left">
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <div className="w-4 h-4 flex items-center justify-center">
              <Lock className="w-3 h-3 text-green-600" />
            </div>
            <span>Your password is encrypted and securely stored</span>
          </div>
        </div>
      </div>

      {/* Modal backdrop */}
      <form method="dialog" className="modal-backdrop">
        <button onClick={closeModal} disabled={loading}>
          close
        </button>
      </form>
    </dialog>
  );
}

export default UpdatePassword;
