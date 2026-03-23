import { Lock, Eye, EyeOff, X, Shield, Key } from "lucide-react";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthProvider";
import { API_URL } from "../utils/constants";

function UpdatePassword() {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkingPassword, setCheckingPassword] = useState(true);
  const [hasPassword, setHasPassword] = useState(null);
  const { authUser, setAuthUser } = useAuth();

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm();

  const newPassword = watch("newPassword");

  // Check if user has a password set by fetching profile from backend
  useEffect(() => {
    const checkHasPassword = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setCheckingPassword(false);
        return;
      }

      try {
        // First check stored user data
        const storedUser = localStorage.getItem("Users");
        if (storedUser) {
          const parsed = JSON.parse(storedUser);
          if (typeof parsed.hasPassword === "boolean") {
            setHasPassword(parsed.hasPassword);
            setCheckingPassword(false);
            return;
          }
        }

        // If hasPassword not in stored data, fetch from backend
        const response = await axios.get(`${API_URL}/user/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data.success) {
          const userHasPassword = response.data.user.hasPassword;
          setHasPassword(userHasPassword);

          // Update localStorage with hasPassword info
          if (storedUser) {
            const parsed = JSON.parse(storedUser);
            parsed.hasPassword = userHasPassword;
            localStorage.setItem("Users", JSON.stringify(parsed));
          }
        }
      } catch (err) {
        console.error("Error checking password status:", err);
        // Fallback: assume has password if error
        setHasPassword(true);
      } finally {
        setCheckingPassword(false);
      }
    };

    checkHasPassword();
  }, []);

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

      // Only send currentPassword if user already has a password
      if (hasPassword && data.currentPassword) {
        passwordData.currentPassword = data.currentPassword;
      }

      const response = await axios.put(
        `${API_URL}/user/update-password`,
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

        // Update hasPassword status after successful password set/update
        if (response.data.hasPassword) {
          setHasPassword(true);
          // Update stored user data
          const storedUser = localStorage.getItem("Users");
          if (storedUser) {
            const parsed = JSON.parse(storedUser);
            parsed.hasPassword = true;
            localStorage.setItem("Users", JSON.stringify(parsed));
            setAuthUser(parsed);
          }
        }

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

  const needsCurrentPassword = hasPassword === true;
  const isSettingNewPassword = hasPassword === false;

  return (
    <dialog id="update_password_modal" className="modal font-body">
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-[2px]">
        <div className="bg-white rounded-2xl w-full max-w-sm mx-auto shadow-tonal-md relative max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-300">
          
          {/* Close Button */}
          <button
            onClick={closeModal}
            disabled={loading}
            className="absolute top-4 right-4 p-1.5 rounded-full text-[#5c6880] hover:bg-[#f0f4ff] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Modal header */}
          <div className="px-6 pt-6 pb-0 text-center">
            <span className="text-[10px] uppercase tracking-[0.15em] text-[#004ac6] font-semibold block mb-1">
              {isSettingNewPassword ? "SECURE ACCOUNT" : "SAFETY FIRST"}
            </span>
            <h3 className="font-display text-2xl font-bold text-[#141b2d]">
              {isSettingNewPassword ? "Set Password" : "Update Password"}
            </h3>
            <p className="text-xs text-[#5c6880] mt-1 mb-5 leading-relaxed">
              {isSettingNewPassword
                ? "Set a password to enable multi-method login."
                : "Regular password rotation is recommended."}
            </p>
          </div>

          {/* Modal body */}
          <div className="px-6 py-4">
            {checkingPassword ? (
              <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <div className="w-10 h-10 border-4 border-[#f0f4ff] border-t-[#004ac6] rounded-full animate-spin"></div>
                <span className="font-body text-[10px] uppercase tracking-widest font-bold text-[#5c6880]">Synchronizing...</span>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* Current Password */}
                {needsCurrentPassword && (
                  <div>
                    <label className="text-[10px] uppercase tracking-widest font-semibold text-[#5c6880] mb-1.5 block">
                      Current Password
                    </label>
                    <div className="flex items-center gap-2 bg-[#f0f4ff] rounded-xl px-3 py-2.5 focus-within:bg-white focus-within:ring-2 focus-within:ring-[#004ac6]/20 transition-all border border-transparent focus-within:border-[#004ac6]/20">
                      <Lock className="w-4 h-4 text-[#5c6880]" />
                      <input
                        type={showCurrentPassword ? "text" : "password"}
                        placeholder="Current password"
                        className="bg-transparent flex-1 text-sm text-[#141b2d] outline-none placeholder:text-[#5c6880]/60"
                        disabled={loading}
                        {...register("currentPassword", {
                          required: needsCurrentPassword && "Required",
                        })}
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="text-[#5c6880] hover:text-[#141b2d]"
                      >
                        {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                )}

                {/* New Password */}
                <div>
                  <label className="text-[10px] uppercase tracking-widest font-semibold text-[#5c6880] mb-1.5 block">
                    New Password
                  </label>
                  <div className="flex items-center gap-2 bg-[#f0f4ff] rounded-xl px-3 py-2.5 focus-within:bg-white focus-within:ring-2 focus-within:ring-[#004ac6]/20 transition-all border border-transparent focus-within:border-[#004ac6]/20">
                    <Lock className="w-4 h-4 text-[#5c6880]" />
                    <input
                      type={showNewPassword ? "text" : "password"}
                      placeholder="Min. 8 characters"
                      className="bg-transparent flex-1 text-sm text-[#141b2d] outline-none placeholder:text-[#5c6880]/60"
                      disabled={loading}
                      {...register("newPassword", {
                        required: "Required",
                        minLength: { value: 8, message: "Min 8 chars" },
                      })}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="text-[#5c6880] hover:text-[#141b2d]"
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.newPassword && (
                    <p className="text-red-500 text-[10px] font-bold mt-1 ml-1">{errors.newPassword.message}</p>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="text-[10px] uppercase tracking-widest font-semibold text-[#5c6880] mb-1.5 block">
                    Confirm Password
                  </label>
                  <div className="flex items-center gap-2 bg-[#f0f4ff] rounded-xl px-3 py-2.5 focus-within:bg-white focus-within:ring-2 focus-within:ring-[#004ac6]/20 transition-all border border-transparent focus-within:border-[#004ac6]/20">
                    <Lock className="w-4 h-4 text-[#5c6880]" />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Verify new password"
                      className="bg-transparent flex-1 text-sm text-[#141b2d] outline-none placeholder:text-[#5c6880]/60"
                      disabled={loading}
                      {...register("confirmPassword", {
                        required: "Required",
                        validate: (value) => value === newPassword || "Keys don't match",
                      })}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="text-[#5c6880] hover:text-[#141b2d]"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-red-500 text-[10px] font-bold mt-1 ml-1">{errors.confirmPassword.message}</p>
                  )}
                </div>

                {/* Primary Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-[#004ac6] to-[#2563eb] text-white font-semibold rounded-xl py-3 text-sm hover:scale-[1.02] transition-transform mt-4 disabled:opacity-50"
                >
                  {loading ? "Processing..." : isSettingNewPassword ? "Set Secure Password" : "Save Changes"}
                </button>
              </form>
            )}
          </div>

          {/* Modal footer */}
          <div className="px-6 pb-6 pt-2 border-t border-[#f0f4ff] bg-gray-50/30">
            <div className="flex items-center gap-3 text-[#5c6880]">
              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center border border-[#f0f4ff]">
                <Shield className="w-3.5 h-3.5 text-[#004ac6]" />
              </div>
              <span className="text-[10px] uppercase tracking-wider font-medium leading-tight">Your credential data is encrypted using archival-grade protocols.</span>
            </div>
          </div>
        </div>
      </div>
    </dialog>
  );
}

export default UpdatePassword;
