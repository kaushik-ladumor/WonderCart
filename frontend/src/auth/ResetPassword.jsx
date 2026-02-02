import { Lock, Eye, EyeOff, X, CheckCircle2, Mail } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

function ResetPassword({ email }) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const hiddenInputRef = useRef(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      otp: "", // Hidden input for all 4 digits
      newPassword: "",
      confirmPassword: "",
    },
  });

  const newPassword = watch("newPassword");
  const confirmPassword = watch("confirmPassword");
  const otp = watch("otp");

  // Split OTP into digits for display
  const otpDigits = otp.split("").slice(0, 4);
  while (otpDigits.length < 4) {
    otpDigits.push("");
  }

  // Focus hidden input when clicking on any OTP box
  const focusHiddenInput = () => {
    if (hiddenInputRef.current) {
      hiddenInputRef.current.focus();
    }
  };

  // Handle keydown on hidden input
  const handleHiddenInputKeyDown = (e) => {
    // Allow only numbers and control keys
    if (
      !/^\d$/.test(e.key) &&
      !["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab"].includes(e.key)
    ) {
      e.preventDefault();
    }
  };

  // Handle input change
  const handleHiddenInputChange = (e) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 4);
    setValue("otp", value);
  };

  // Focus hidden input when modal opens
  useEffect(() => {
    const modal = document.getElementById("reset_modal");
    if (modal) {
      const handleOpen = () => {
        setTimeout(() => {
          focusHiddenInput();
        }, 100);
      };

      modal.addEventListener("shown", handleOpen);
      return () => modal.removeEventListener("shown", handleOpen);
    }
  }, []);

  const onSubmit = async (data) => {
    if (data.otp.length !== 4) {
      toast.error("Please enter all 4 digits of the verification code");
      focusHiddenInput();
      return;
    }

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
          verificationCode: data.otp,
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
      focusHiddenInput();
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    if (!loading) {
      document.getElementById("reset_modal")?.close();
    }
  };

  return (
    <>
      {/* Reset Password Modal */}
      <dialog id="reset_modal" className="modal">
        <div className="modal-box max-w-md p-5 bg-white rounded-lg shadow-xl border border-gray-200">
          {/* Header */}
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200">
            <div>
              <h3 className="font-bold text-gray-900 text-lg">
                Reset Password
              </h3>
              <p className="text-gray-600 text-xs mt-0.5">
                Enter code and set new password
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

          {/* Email Display */}
          {email && (
            <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-blue-600" />
                <div>
                  <p className="text-xs text-gray-600">Reset password for</p>
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {email}
                  </p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Verification Code - Visual Boxes */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Verification Code
              </label>

              {/* Hidden input for actual OTP entry */}
              <input
                ref={hiddenInputRef}
                type="text"
                inputMode="numeric"
                className="absolute opacity-0 w-0 h-0 text-black"
                value={otp}
                onChange={handleHiddenInputChange}
                onKeyDown={handleHiddenInputKeyDown}
                maxLength={4}
              />

              {/* Visual OTP Boxes */}
              <div className="flex justify-center gap-3 text-black">
                {[0, 1, 2, 3].map((index) => (
                  <div
                    key={index}
                    onClick={focusHiddenInput}
                    className={`w-12 h-12 flex items-center justify-center border rounded-md text-xl font-bold cursor-text transition-all ${
                      otp.length === index
                        ? "border-black ring-2 ring-black ring-opacity-20 bg-gray-50"
                        : otpDigits[index]
                          ? "border-gray-300 bg-white"
                          : "border-gray-300 bg-white"
                    } ${
                      errors.otp ? "border-red-500" : ""
                    } ${loading ? "bg-gray-100" : ""}`}
                  >
                    {otpDigits[index] || ""}
                    {/* Cursor indicator */}
                    {otp.length === index && (
                      <div className="ml-0.5 w-0.5 h-6 bg-black animate-pulse"></div>
                    )}
                  </div>
                ))}
              </div>

              {errors.otp && (
                <p className="text-red-600 text-xs mt-2 text-center">
                  Please enter all 4 digits correctly
                </p>
              )}
              <p className="text-xs text-gray-500 mt-2 text-center">
                Click on any box and type 4-digit code
              </p>
            </div>

            {/* New Password */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter new password"
                  className={`w-full pl-10 pr-10 py-2.5 border rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-sm text-gray-900 placeholder-gray-500 bg-white ${
                    errors.newPassword ? "border-red-500" : "border-gray-300"
                  } ${loading ? "bg-gray-100 cursor-not-allowed" : ""}`}
                  disabled={loading}
                  {...register("newPassword", {
                    required: "Password is required",
                    minLength: {
                      value: 8,
                      message: "Password must be at least 8 characters",
                    },
                  })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-black disabled:text-gray-300 disabled:cursor-not-allowed"
                  disabled={loading}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {errors.newPassword && (
                <p className="text-red-600 text-xs mt-1">
                  {errors.newPassword.message}
                </p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Must be at least 8 characters long
              </p>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                Confirm New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm new password"
                  className={`w-full pl-10 pr-10 py-2.5 border rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-sm text-gray-900 placeholder-gray-500 bg-white ${
                    errors.confirmPassword
                      ? "border-red-500"
                      : newPassword === confirmPassword && confirmPassword
                        ? "border-green-500"
                        : "border-gray-300"
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
                <p className="text-red-600 text-xs mt-1">
                  {errors.confirmPassword.message}
                </p>
              )}
              {!errors.confirmPassword &&
                newPassword &&
                confirmPassword &&
                newPassword === confirmPassword && (
                  <div className="flex items-center gap-1 text-green-600 text-xs mt-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Passwords match
                  </div>
                )}
            </div>

            {/* Reset Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white py-2.5 rounded-md font-medium hover:bg-gray-800 transition disabled:bg-gray-400 disabled:cursor-not-allowed text-sm mt-2"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Resetting Password...
                </div>
              ) : (
                "Reset Password"
              )}
            </button>
          </form>

          {/* Security Note */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <div className="w-4 h-4 flex items-center justify-center">
                <Lock className="w-3 h-3 text-green-600" />
              </div>
              <span>Your new password will be encrypted and secured</span>
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

      {/* Success Modal */}
      <dialog id="success_modal" className="modal">
        <div className="modal-box max-w-sm p-5 bg-white rounded-lg shadow-xl border border-gray-200">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-black rounded-full mb-4">
              <CheckCircle2 className="w-6 h-6 text-white" />
            </div>

            <div className="mb-4">
              <h3 className="font-bold text-gray-900 text-lg mb-2">
                Password Reset Complete!
              </h3>
              <p className="text-gray-600 text-sm">
                Your password has been successfully reset. You can now login
                with your new password.
              </p>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => {
                  document.getElementById("success_modal")?.close();
                  navigate("/login");
                }}
                className="w-full bg-black text-white py-2.5 rounded-md font-medium hover:bg-gray-800 transition text-sm"
              >
                Go to Login
              </button>

              <button
                onClick={() =>
                  document.getElementById("success_modal")?.close()
                }
                className="w-full py-2.5 border border-gray-300 rounded-md font-medium hover:bg-gray-50 transition text-sm text-gray-700"
              >
                Close
              </button>
            </div>
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
