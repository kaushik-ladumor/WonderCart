import { Lock, Eye, EyeOff, X, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import toast from "react-hot-toast";

function ResetPassword({ email }) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      verificationCode: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const newPassword = watch("newPassword");
  const confirmPassword = watch("confirmPassword");

  const onSubmit = async (data) => {
    if (data.newPassword !== data.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(
        "http://localhost:4000/user/reset-password",
        {
          email: email,
          verificationCode: data.verificationCode,
          newPassword: data.newPassword,
        },
      );

      if (response.data.success) {
        toast.success(response.data.message);
        document.getElementById("reset_modal")?.close();

        setTimeout(() => {
          document.getElementById("success_modal")?.showModal();
        }, 300);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Reset Password Modal */}
      <dialog id="reset_modal" className="modal">
        <div className="modal-box bg-white max-w-md p-0 border border-gray-200">
          {/* Modal Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Reset Password
              </h2>
              <p className="text-gray-600 text-sm mt-1">
                Enter code and new password
              </p>
            </div>
            <button
              onClick={() => document.getElementById("reset_modal")?.close()}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Modal Body */}
          <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
            {/* Verification Code */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Verification Code
              </label>
              <input
                {...register("verificationCode", {
                  required: "Verification code is required",
                  pattern: {
                    value: /^\d{4}$/,
                    message: "Enter a valid 4-digit code",
                  },
                })}
                type="text"
                maxLength="4"
                placeholder="••••"
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-1 focus:ring-black text-black text-center text-xl font-medium tracking-[0.5em] text-sm ${
                  errors.verificationCode
                    ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:border-black"
                }`}
              />
              {errors.verificationCode && (
                <p className="text-red-500 text-xs mt-2">
                  {errors.verificationCode.message}
                </p>
              )}
            </div>

            {/* New Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register("newPassword", {
                    required: "Password is required",
                    minLength: {
                      value: 8,
                      message: "Password must be at least 8 characters",
                    },
                  })}
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter new password"
                  className={`w-full pl-10 pr-10 py-3 border rounded-lg focus:outline-none focus:ring-1 text-black text-sm ${
                    errors.newPassword
                      ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                      : "border-gray-300 focus:border-black focus:ring-black"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.newPassword && (
                <p className="text-red-500 text-xs mt-2">
                  {errors.newPassword.message}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register("confirmPassword", {
                    required: "Please confirm your password",
                    validate: (value) =>
                      value === newPassword || "Passwords do not match",
                  })}
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm new password"
                  className={`w-full pl-10 pr-10 py-3 border rounded-lg focus:outline-none focus:ring-1 text-black text-sm ${
                    errors.confirmPassword
                      ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                      : newPassword === confirmPassword && confirmPassword
                        ? "border-green-500 focus:border-green-500 focus:ring-green-500"
                        : "border-gray-300 focus:border-black focus:ring-black"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-red-500 text-xs mt-2">
                  {errors.confirmPassword.message}
                </p>
              )}
              {!errors.confirmPassword &&
                newPassword &&
                confirmPassword &&
                newPassword === confirmPassword && (
                  <p className="text-green-600 text-xs mt-2 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Passwords match
                  </p>
                )}
            </div>

            {/* Action Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white py-3.5 rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed text-sm"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Resetting...
                </span>
              ) : (
                "Reset Password"
              )}
            </button>
          </form>
        </div>

        <form method="dialog" className="modal-backdrop">
          <button
            onClick={() => document.getElementById("reset_modal")?.close()}
          >
            close
          </button>
        </form>
      </dialog>

      {/* Success Modal */}
      <dialog id="success_modal" className="modal">
        <div className="modal-box bg-white max-w-sm p-6 border border-gray-200">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-black rounded-full mb-4">
              <CheckCircle2 className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Password Reset Complete!
            </h3>
            <p className="text-gray-600 text-sm mb-6">
              Your password has been successfully reset.
            </p>
            <a
              href="/"
              className="block w-full bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors text-sm"
            >
              Go to Login
            </a>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button
            onClick={() => document.getElementById("success_modal")?.close()}
          >
            close
          </button>
        </form>
      </dialog>
    </>
  );
}

export default ResetPassword;
