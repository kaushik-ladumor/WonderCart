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
  const { authUser } = useAuth();

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm();

  const newPassword = watch("newPassword");
  const isGoogleUser = !authUser?.password;

  const onSubmit = async (data) => {
    // ✅ correct auth check
    if (!authUser?._id) {
      toast.error("User not authenticated. Please login again.");
      return;
    }

    const passwordData = isGoogleUser
      ? { newPassword: data.newPassword }
      : {
          currentPassword: data.currentPassword,
          newPassword: data.newPassword,
        };


    try {
      
      const token = localStorage.getItem("token");

      await axios.put(
        "http://localhost:4000/user/update-password",
        passwordData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success("Password updated successfully");
      reset();
      document.getElementById("my_modal_7").close();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update password");
    }
  };

  return (
    <div>
      <dialog id="my_modal_7" className="modal">
        <div className="modal-box bg-white max-w-md p-8">
          {/* Close Button */}
          <form method="dialog">
            <button className="btn btn-sm btn-circle btn-ghost absolute right-3 top-3 text-gray-400 hover:text-white">
              <X className="h-5 w-5" />
            </button>
          </form>

          {/* Header */}
          <h2 className="text-2xl font-bold text-black mb-6">
            Update Password
          </h2>

          <div className="space-y-5">
            {/* Current Password */}
            {!isGoogleUser && (
              <div>
                <label className="block text-sm font-medium text-black mb-2 text-left">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    placeholder="Enter current password"
                    className="w-full px-3 py-2 pl-9 pr-11 border border-gray-300 rounded-lg"
                    {...register("currentPassword", { required: true })}
                  />
                  <Lock className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                </div>
              </div>
            )}

            {/* New Password */}
            <div>
              <label className="block text-sm font-medium text-black mb-2 text-left">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  placeholder="Enter new password"
                  className="w-full px-3 py-2 pl-9 pr-11 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-black placeholder-gray-400"
                  {...register("newPassword", {
                    required: true,
                    minLength: 8,
                  })}
                />
                <Lock className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-3.5 text-gray-400 hover:text-black"
                >
                  {showNewPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.newPassword && (
                <span className="text-red-500 text-xs block text-left mt-1">
                  {errors.newPassword.type === "minLength"
                    ? "Password must be at least 8 characters"
                    : "New password is required"}
                </span>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-black mb-2 text-left">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm new password"
                  className="w-full px-3 py-2 pl-9 pr-11 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-black placeholder-gray-400"
                  {...register("confirmPassword", {
                    required: true,
                    validate: (value) =>
                      value === newPassword || "Passwords don't match",
                  })}
                />
                <Lock className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-3.5 text-gray-400 hover:text-black"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <span className="text-red-500 text-xs block text-left mt-1">
                  {errors.confirmPassword.message ||
                    "Please confirm your password"}
                </span>
              )}
            </div>

            {/* Update Button */}
            <button
              type="button"
              onClick={handleSubmit(onSubmit)}
              className="w-full bg-black text-white py-3.5 rounded-lg font-semibold hover:bg-gray-800 transition-all duration-200 mt-2"
            >
              {isGoogleUser ? "Set Password" : "Update Password"}
            </button>
          </div>
        </div>
      </dialog>
    </div>
  );
}

export default UpdatePassword;
